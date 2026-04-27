import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

const PAGES_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages');
const OUT_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages-rewritten');
const MANIFEST_PATH = join(
  REPO_DIR,
  'archive/wordpress/scrape/media-manifest.json',
);
const REPORT_PATH = join(
  REPO_DIR,
  'archive/wordpress/scrape/rewrite-report.json',
);

type ManifestItem = {
  sourceUrl: string;
  r2Key: string;
  publicUrl: string;
  status: string;
};

type Manifest = { items: ManifestItem[] };

// Same regex as Phase B — captures absolute and protocol-relative WP upload
// URLs inside any string value (post-JSON.parse, escapes are already decoded).
const WP_UPLOAD_RE =
  /(?:https?:)?\/\/(?:www\.)?ydministries\.ca\/wp-content\/uploads\/[^\s"'<>\\)\]]+/gi;

function canonicalize(url: string): string {
  let u = url;
  if (u.startsWith('//')) u = 'https:' + u;
  // drop trailing punctuation that often clings in HTML/JSON
  u = u.replace(/[.,;:!?]+$/g, '');
  // drop query + fragment
  const qi = u.indexOf('?');
  if (qi >= 0) u = u.slice(0, qi);
  const hi = u.indexOf('#');
  if (hi >= 0) u = u.slice(0, hi);
  // strip www.
  u = u.replace(/^https?:\/\/www\./i, 'https://');
  // force https
  u = u.replace(/^http:\/\//i, 'https://');
  return u;
}

function basenameFromUrl(url: string): string {
  try {
    const path = decodeURIComponent(new URL(canonicalize(url)).pathname);
    return basename(path);
  } catch {
    return basename(url.split('?')[0]);
  }
}

async function loadManifest(): Promise<{
  byCanonical: Map<string, string>;
  byBasename: Map<string, string>;
}> {
  const m: Manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const byCanonical = new Map<string, string>();
  const byBasename = new Map<string, string>();
  for (const it of m.items) {
    byCanonical.set(canonicalize(it.sourceUrl), it.publicUrl);
    const bn = basenameFromUrl(it.sourceUrl);
    // First-write wins for basename collisions; multiple sourceUrls can share
    // a basename (e.g. resized variants). We only fall back to this map when
    // the canonical lookup misses, so collisions are unlikely to cause harm —
    // but we deliberately do not overwrite to keep behavior deterministic.
    if (!byBasename.has(bn)) byBasename.set(bn, it.publicUrl);
  }
  return { byCanonical, byBasename };
}

async function walkJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile() && e.name.endsWith('.json')) out.push(p);
    }
  }
  await walk(dir);
  return out;
}

type RewriteState = {
  replacements: number;
  unmatched: Set<string>;
};

function rewriteString(
  s: string,
  byCanonical: Map<string, string>,
  byBasename: Map<string, string>,
  state: RewriteState,
): string {
  return s.replace(WP_UPLOAD_RE, (match) => {
    const canon = canonicalize(match);
    const exact = byCanonical.get(canon);
    if (exact) {
      state.replacements++;
      return exact;
    }
    const bn = basenameFromUrl(match);
    const fallback = byBasename.get(bn);
    if (fallback) {
      state.replacements++;
      return fallback;
    }
    state.unmatched.add(canon);
    return match;
  });
}

function rewriteValue(
  v: unknown,
  byCanonical: Map<string, string>,
  byBasename: Map<string, string>,
  state: RewriteState,
): unknown {
  if (typeof v === 'string') {
    return rewriteString(v, byCanonical, byBasename, state);
  }
  if (Array.isArray(v)) {
    return v.map((x) => rewriteValue(x, byCanonical, byBasename, state));
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = rewriteValue(val, byCanonical, byBasename, state);
    }
    return out;
  }
  return v;
}

async function main() {
  console.log('→ Loading manifest…');
  const { byCanonical, byBasename } = await loadManifest();
  console.log(
    `  ${byCanonical.size} canonical entries, ${byBasename.size} unique basenames`,
  );

  console.log('→ Walking page JSON…');
  const files = await walkJsonFiles(PAGES_DIR);
  console.log(`  ${files.length} files`);

  await mkdir(OUT_DIR, { recursive: true });

  const byFile: { file: string; replacements: number }[] = [];
  const allUnmatched = new Set<string>();
  let totalReplacements = 0;

  for (const file of files) {
    const text = await readFile(file, 'utf8');
    const json = JSON.parse(text);
    const state: RewriteState = { replacements: 0, unmatched: new Set() };
    const rewritten = rewriteValue(json, byCanonical, byBasename, state);
    // Mirror the relative path under OUT_DIR (single-level for now since
    // pages/ is flat, but supports nesting if it ever changes).
    const rel = file.slice(PAGES_DIR.length + 1);
    const outPath = join(OUT_DIR, rel);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, JSON.stringify(rewritten, null, 2) + '\n');
    byFile.push({ file: rel, replacements: state.replacements });
    totalReplacements += state.replacements;
    for (const u of state.unmatched) allUnmatched.add(u);
  }

  byFile.sort((a, b) => b.replacements - a.replacements);

  const report = {
    generatedAt: new Date().toISOString(),
    filesProcessed: files.length,
    totalReplacements,
    byFile,
    unmatchedUrls: [...allUnmatched].sort(),
    unmatchedCount: allUnmatched.size,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  console.log(`\n✓ Report: ${REPORT_PATH}`);
  console.log('\n=== Summary ===');
  console.log(`  files processed:    ${report.filesProcessed}`);
  console.log(`  total replacements: ${report.totalReplacements}`);
  console.log(`  unmatched URLs:     ${report.unmatchedCount}`);

  if (allUnmatched.size > 0) {
    console.error('\n✗ ACCEPTANCE FAILED — unmatched WP upload URLs:');
    for (const u of [...allUnmatched].sort()) console.error(`  ${u}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
