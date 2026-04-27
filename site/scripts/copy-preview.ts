#!/usr/bin/env npx tsx
/**
 * Phase G — Step 3: copy every file from site/.codegen-preview/(site)/ into
 * site/src/app/(site)/, creating directories as needed. Then verify that every
 * route-map.json newPath has a corresponding file.
 */

import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

const SOURCE_ROOT = join(SITE_DIR, '.codegen-preview/(site)');
const TARGET_ROOT = join(SITE_DIR, 'src/app/(site)');
const ROUTE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/route-map.json');

async function* walk(root: string): AsyncGenerator<string> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const e of entries) {
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

async function copyTree(): Promise<number> {
  let copied = 0;
  for await (const src of walk(SOURCE_ROOT)) {
    const rel = relative(SOURCE_ROOT, src);
    const dst = join(TARGET_ROOT, rel);
    await mkdir(dirname(dst), { recursive: true });
    const content = await readFile(src);
    await writeFile(dst, content);
    copied++;
  }
  return copied;
}

async function countPageTsx(root: string): Promise<number> {
  let n = 0;
  for await (const f of walk(root)) {
    if (f.endsWith('/page.tsx')) n++;
  }
  return n;
}

type RouteItem = { newPath: string; type: string; oldPath: string; key: string };

function expectedPath(item: RouteItem): string {
  if (item.type === 'index_filter') {
    const segs = item.oldPath.split('/').filter(Boolean);
    return join(TARGET_ROOT, ...segs, 'page.tsx');
  }
  const path = item.newPath.split('?')[0];
  if (path === '/' || path === '') return join(TARGET_ROOT, 'page.tsx');
  const segs = path.split('/').filter(Boolean);
  return join(TARGET_ROOT, ...segs, 'page.tsx');
}

async function exists(p: string): Promise<boolean> {
  try { await stat(p); return true; } catch { return false; }
}

async function main() {
  const copied = await copyTree();
  console.log(`Copied ${copied} files from preview → (site)`);

  const routeMap = JSON.parse(await readFile(ROUTE_MAP_PATH, 'utf8')) as { items: RouteItem[] };
  const missing: string[] = [];
  for (const item of routeMap.items) {
    const p = expectedPath(item);
    if (!(await exists(p))) missing.push(`${item.key} → ${relative(SITE_DIR, p)} (newPath=${item.newPath})`);
  }

  const pageCount = await countPageTsx(TARGET_ROOT);
  console.log(`page.tsx count under (site): ${pageCount}`);
  console.log(`route-map items: ${routeMap.items.length}`);
  console.log(`missing newPaths: ${missing.length}`);
  for (const m of missing) console.log(`  ✗ ${m}`);

  if (pageCount !== 64 || missing.length > 0) {
    console.error('\nVERIFY FAILED — page count or missing routes mismatch.');
    process.exit(2);
  }
  console.log('\nOK: 64 page.tsx files present, every route-map newPath has a file.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
