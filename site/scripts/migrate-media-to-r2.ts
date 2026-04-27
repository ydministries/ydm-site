import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

loadEnv({ path: join(SITE_DIR, '.env.local') });

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  R2_PUBLIC_URL,
} = process.env;

for (const [k, v] of Object.entries({
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
})) {
  if (!v) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

const ENDPOINT =
  R2_ENDPOINT ?? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = R2_BUCKET_NAME!;
const PUBLIC_URL = R2_PUBLIC_URL!.replace(/\/$/, '');

const PAGES_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages');
const LOCAL_UPLOADS = join(REPO_DIR, 'archive/wordpress/exports/uploads');
const MANIFEST_PATH = join(
  REPO_DIR,
  'archive/wordpress/scrape/media-manifest.json',
);

const CONCURRENCY = 8;
const MAX_RETRIES = 3;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

type Status = 'uploaded' | 'skipped' | 'existing' | 'sermon' | 'error';

type ManifestItem = {
  sourceUrl: string;
  r2Key: string;
  publicUrl: string;
  bytes: number;
  contentType: string;
  status: Status;
  error?: string;
};

const s3 = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

// Match absolute and protocol-relative WP upload URLs across the JSON text.
// Stops at quote, backslash, whitespace, or closing bracket — covers JSON
// strings, srcset entries, and inline HTML attributes.
const WP_UPLOAD_RE =
  /(?:https?:)?\/\/(?:www\.)?ydministries\.ca\/wp-content\/uploads\/[^\s"'<>\\)\]]+/gi;

function normalizeUrl(raw: string): string | null {
  let u = raw;
  if (u.startsWith('//')) u = 'https:' + u;
  // Drop trailing punctuation that often clings to URLs in HTML/JSON
  u = u.replace(/[.,;:!?]+$/g, '');
  // Drop query/fragment for keying — same asset
  const qi = u.indexOf('?');
  if (qi >= 0) u = u.slice(0, qi);
  const hi = u.indexOf('#');
  if (hi >= 0) u = u.slice(0, hi);
  if (!u.includes('/wp-content/uploads/')) return null;
  return u;
}

function urlToR2Info(url: string): { r2Key: string; isSermon: boolean } {
  // Decode percent-encoding so local lookups work for files with spaces, etc.
  let path: string;
  try {
    path = decodeURIComponent(new URL(url).pathname);
  } catch {
    path = url.replace(/^https?:\/\/[^/]+/, '');
  }
  // path looks like /wp-content/uploads/2025/02/foo.ext
  const afterWpContent = path.replace(/^\/wp-content\//, '');
  // afterWpContent: uploads/2025/02/foo.ext
  const isSermon = path.toLowerCase().endsWith('.mp3');
  if (isSermon) {
    return { r2Key: `sermons/${basename(afterWpContent)}`, isSermon };
  }
  return { r2Key: afterWpContent, isSermon };
}

async function walkPagesForUrls(): Promise<string[]> {
  const found = new Set<string>();
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.isFile() && e.name.endsWith('.json')) {
        const text = await readFile(p, 'utf8');
        const matches = text.match(WP_UPLOAD_RE);
        if (matches) {
          for (const m of matches) {
            const norm = normalizeUrl(m);
            if (norm) found.add(norm);
          }
        }
      }
    }
  }
  await walk(PAGES_DIR);
  return [...found].sort();
}

async function headR2(key: string) {
  try {
    const r = await s3.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    return { exists: true, contentLength: Number(r.ContentLength ?? 0) };
  } catch (err: unknown) {
    const e = err as { $metadata?: { httpStatusCode?: number }; name?: string };
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NotFound') {
      return { exists: false, contentLength: 0 };
    }
    throw err;
  }
}

async function readLocalMirror(
  url: string,
): Promise<{ buf: Buffer; bytes: number } | null> {
  const { pathname } = new URL(url);
  const decoded = decodeURIComponent(pathname);
  // /wp-content/uploads/2025/02/foo.ext  ->  2025/02/foo.ext
  const rel = decoded.replace(/^\/wp-content\/uploads\//, '');
  const local = join(LOCAL_UPLOADS, rel);
  if (!existsSync(local)) return null;
  const s = await stat(local);
  if (!s.isFile()) return null;
  const buf = await readFile(local);
  return { buf, bytes: buf.length };
}

async function fetchOrigin(
  url: string,
): Promise<{ buf: Buffer; bytes: number } | null> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  return { buf, bytes: buf.length };
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const wait = 250 * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error(
    `${label} failed after ${MAX_RETRIES} retries: ${(lastErr as Error)?.message ?? lastErr}`,
  );
}

async function processOne(url: string): Promise<ManifestItem> {
  const { r2Key, isSermon } = urlToR2Info(url);
  const contentType = mime.lookup(r2Key) || 'application/octet-stream';
  const publicUrl = `${PUBLIC_URL}/${r2Key}`;

  if (isSermon) {
    // Sermons live under sermons/ already — just record, do not upload.
    let bytes = 0;
    try {
      const head = await headR2(r2Key);
      bytes = head.contentLength;
    } catch {
      /* no-op — sermon bucket may have key listed missing; we still record */
    }
    return {
      sourceUrl: url,
      r2Key,
      publicUrl,
      bytes,
      contentType,
      status: 'sermon',
    };
  }

  try {
    const head = await withRetry(`HEAD ${r2Key}`, () => headR2(r2Key));
    if (head.exists) {
      return {
        sourceUrl: url,
        r2Key,
        publicUrl,
        bytes: head.contentLength,
        contentType,
        status: 'existing',
      };
    }

    let payload = await readLocalMirror(url);
    if (!payload) {
      payload = await withRetry(`fetch ${url}`, async () => {
        const r = await fetchOrigin(url);
        if (!r) throw new Error('origin fetch returned non-200 / empty');
        return r;
      });
    }

    await withRetry(`PUT ${r2Key}`, async () => {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: r2Key,
          Body: payload!.buf,
          ContentType: contentType,
          CacheControl: CACHE_CONTROL,
        }),
      );
    });

    return {
      sourceUrl: url,
      r2Key,
      publicUrl,
      bytes: payload.bytes,
      contentType,
      status: 'uploaded',
    };
  } catch (err) {
    return {
      sourceUrl: url,
      r2Key,
      publicUrl,
      bytes: 0,
      contentType,
      status: 'error',
      error: (err as Error)?.message ?? String(err),
    };
  }
}

async function pool<T, R>(
  items: T[],
  size: number,
  worker: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const total = items.length;
  async function run() {
    while (true) {
      const i = cursor++;
      if (i >= total) return;
      results[i] = await worker(items[i], i);
      done++;
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`  …${done}/${total}\n`);
      }
    }
  }
  const runners = Array.from({ length: Math.min(size, total) }, () => run());
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log('→ Walking page JSON for WP upload URLs…');
  const urls = await walkPagesForUrls();
  console.log(`  found ${urls.length} unique URLs`);

  console.log(
    `→ Processing with concurrency=${CONCURRENCY}, retry=${MAX_RETRIES}`,
  );
  const items = await pool(urls, CONCURRENCY, (u, i) => {
    return processOne(u).then((r) => {
      const tag = r.status === 'error' ? `ERR ${r.error}` : r.status;
      console.log(`  [${i + 1}/${urls.length}] ${tag.padEnd(10)} ${r.r2Key}`);
      return r;
    });
  });

  const counts: Record<Status, number> = {
    uploaded: 0,
    skipped: 0,
    existing: 0,
    sermon: 0,
    error: 0,
  };
  let totalBytes = 0;
  for (const it of items) {
    counts[it.status]++;
    if (it.status === 'uploaded') totalBytes += it.bytes;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    bucket: BUCKET,
    publicUrl: PUBLIC_URL,
    count: items.length,
    counts,
    totalUploadedBytes: totalBytes,
    items,
  };
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written: ${MANIFEST_PATH}`);

  console.log('\n=== Summary ===');
  console.log(`  found:    ${items.length}`);
  console.log(`  uploaded: ${counts.uploaded}`);
  console.log(`  existing: ${counts.existing}`);
  console.log(`  sermon:   ${counts.sermon}`);
  console.log(`  errors:   ${counts.error}`);
  console.log(`  bytes:    ${totalBytes.toLocaleString()} (${(totalBytes / 1024 / 1024).toFixed(1)} MiB) uploaded`);

  const errors = items.filter((i) => i.status === 'error');
  if (errors.length) {
    console.log('\n=== Errors ===');
    for (const e of errors) console.log(`  ${e.sourceUrl} → ${e.error}`);
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
