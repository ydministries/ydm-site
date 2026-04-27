import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

loadEnv({ path: join(SITE_DIR, '.env.local') });

const ROUTE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/route-map.json');
const BACKUP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/stale-content-backup.json');
const ASSETS_BACKUP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/stale-assets-backup.json');

const args = new Set(process.argv.slice(2));
const CONFIRM = args.has('--confirm');

type PageContentRow = {
  id?: string;
  page_key: string;
  field_key: string;
  value: string;
  draft_value: string | null;
  value_type: string;
  published_at: string | null;
  updated_at: string;
  updated_by: string | null;
};

type AssetRow = {
  id?: string;
  asset_key: string;
  storage_path: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  updated_at: string;
};

type Thenable<T> = PromiseLike<T>;

async function paginate<T>(
  fetchPage: (from: number, to: number) => Thenable<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await fetchPage(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ---- Load valid keys ----
  const rm = JSON.parse(await readFile(ROUTE_MAP_PATH, 'utf8')) as { items: Array<{ key: string }> };
  const validKeys = new Set(rm.items.map((i) => i.key));
  console.log(`→ Valid page_keys (from route-map): ${validKeys.size}`);
  if (validKeys.size !== 64) {
    console.error(`  expected 64, got ${validKeys.size} — refusing to proceed.`);
    process.exit(1);
  }

  // ---- Inventory current page_content ----
  console.log('→ Fetching all page_content rows for inventory…');
  const pkRows = await paginate<{ page_key: string }>((f, t) =>
    sb.from('page_content').select('page_key').range(f, t),
  );
  const countsByKey = new Map<string, number>();
  for (const r of pkRows) countsByKey.set(r.page_key, (countsByKey.get(r.page_key) ?? 0) + 1);
  const dbKeys = [...countsByKey.keys()];
  const staleKeys = dbKeys.filter((k) => !validKeys.has(k)).sort(
    (a, b) => (countsByKey.get(b) ?? 0) - (countsByKey.get(a) ?? 0),
  );
  const staleRowCount = staleKeys.reduce((sum, k) => sum + (countsByKey.get(k) ?? 0), 0);
  const validRowCount = pkRows.length - staleRowCount;

  console.log(`  total rows in DB:        ${pkRows.length}`);
  console.log(`  distinct page_keys:      ${dbKeys.length}`);
  console.log(`  rows under valid keys:   ${validRowCount}`);
  console.log(`  rows under stale keys:   ${staleRowCount}`);
  console.log(`  stale page_keys:         ${staleKeys.length}`);

  // ---- Safety check 7a: stale ∩ valid == ∅ ----
  const overlap = staleKeys.filter((k) => validKeys.has(k));
  if (overlap.length > 0) {
    console.error(`  ✗ overlap detected — staleKeys contains ${overlap.length} valid keys: ${overlap.join(', ')}`);
    process.exit(1);
  }
  console.log(`  ✓ no overlap between stale and valid key sets`);

  console.log('\n=== Stale page_keys (full list) ===');
  for (const k of staleKeys) {
    console.log(`  ${String(countsByKey.get(k)).padStart(4)}  ${k}`);
  }

  // ---- Pre-snapshot of valid-key counts (parity baseline for post-delete) ----
  const validBefore = new Map<string, number>();
  for (const k of validKeys) validBefore.set(k, countsByKey.get(k) ?? 0);

  // ---- Backup all stale rows (every column) ----
  console.log('\n→ Backing up stale page_content rows (full columns)…');
  const KEY_CHUNK = 30; // keep .in() URL length sane
  const stalePcRows: PageContentRow[] = [];
  for (let i = 0; i < staleKeys.length; i += KEY_CHUNK) {
    const chunk = staleKeys.slice(i, i + KEY_CHUNK);
    const rows = await paginate<PageContentRow>((f, t) =>
      sb.from('page_content').select('*').in('page_key', chunk).range(f, t),
    );
    stalePcRows.push(...rows);
  }
  if (stalePcRows.length !== staleRowCount) {
    console.error(
      `  ✗ backup mismatch: expected ${staleRowCount} rows, got ${stalePcRows.length}. Refusing to proceed.`,
    );
    process.exit(1);
  }
  await writeFile(
    BACKUP_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        staleKeyCount: staleKeys.length,
        staleRowCount: stalePcRows.length,
        staleKeys,
        rows: stalePcRows,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`  backup written: ${BACKUP_PATH}  (${stalePcRows.length} rows)`);

  // ---- Inventory assets ----
  console.log('\n→ Inventory assets…');
  const allAssets = await paginate<AssetRow>((f, t) => sb.from('assets').select('*').range(f, t));
  const staleAssets = allAssets.filter((a) => {
    const idx = a.asset_key.indexOf('.image.');
    const prefix = idx >= 0 ? a.asset_key.slice(0, idx) : a.asset_key.split('.')[0];
    return !validKeys.has(prefix);
  });
  console.log(`  total assets:           ${allAssets.length}`);
  console.log(`  stale assets:           ${staleAssets.length}`);
  if (staleAssets.length > 0) {
    console.log('  stale asset_keys (first 20):');
    for (const a of staleAssets.slice(0, 20)) console.log(`    ${a.asset_key}`);
    await writeFile(
      ASSETS_BACKUP_PATH,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          count: staleAssets.length,
          rows: staleAssets,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(`  backup written: ${ASSETS_BACKUP_PATH}`);
  }

  // ---- Safety check 7b: --confirm gate ----
  if (!CONFIRM) {
    console.log('\n--- DRY (no --confirm) — backups written, nothing deleted. ---');
    console.log('Re-run with --confirm to delete:');
    console.log('  npm run cleanup:stale -- --confirm');
    return;
  }

  // ---- Delete stale page_content rows ----
  console.log('\n→ Deleting stale page_content rows…');
  let pcDeleted = 0;
  for (let i = 0; i < staleKeys.length; i += KEY_CHUNK) {
    const chunk = staleKeys.slice(i, i + KEY_CHUNK);
    const { error, count } = await sb.from('page_content').delete({ count: 'exact' }).in('page_key', chunk);
    if (error) {
      console.error('  ✗ delete failed:', error);
      console.error('  Restore by re-inserting from', BACKUP_PATH);
      process.exit(1);
    }
    pcDeleted += count ?? 0;
  }
  console.log(`  deleted: ${pcDeleted}`);

  // ---- Verify post-delete ----
  console.log('\n→ Re-verifying page_content…');
  const { count: pcTotalAfter, error: e1 } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true });
  if (e1) {
    console.error(e1);
    process.exit(1);
  }
  const pkRowsAfter = await paginate<{ page_key: string }>((f, t) =>
    sb.from('page_content').select('page_key').range(f, t),
  );
  const countsAfter = new Map<string, number>();
  for (const r of pkRowsAfter) countsAfter.set(r.page_key, (countsAfter.get(r.page_key) ?? 0) + 1);

  console.log(`  total page_content rows:   ${pcTotalAfter}  (expected ${validRowCount})`);
  console.log(`  distinct page_keys:        ${countsAfter.size}  (expected 64)`);

  // Parity check: every valid key's count must be unchanged.
  const changed: { key: string; before: number; after: number }[] = [];
  for (const k of validKeys) {
    const before = validBefore.get(k) ?? 0;
    const after = countsAfter.get(k) ?? 0;
    if (before !== after) changed.push({ key: k, before, after });
  }

  if (changed.length > 0) {
    console.error('\n✗ PARITY CHECK FAILED — valid-key row counts changed:');
    for (const c of changed) console.error(`    ${c.key}: ${c.before} → ${c.after}`);
    console.error('\nRolling back: re-inserting backup rows into page_content…');
    let restored = 0;
    for (let i = 0; i < stalePcRows.length; i += 500) {
      const slice = stalePcRows.slice(i, i + 500);
      const { error, count } = await sb.from('page_content').insert(slice, { count: 'exact' });
      if (error) {
        console.error('  ✗ rollback insert failed:', error);
        console.error('  Manual restore required from', BACKUP_PATH);
        process.exit(1);
      }
      restored += count ?? 0;
    }
    console.error(`  restored ${restored} rows. Aborting.`);
    process.exit(2);
  }
  console.log('  ✓ parity check passed: every valid page_key has unchanged row count');

  // ---- Delete stale assets ----
  if (staleAssets.length > 0) {
    console.log('\n→ Deleting stale assets rows…');
    const staleAssetKeys = staleAssets.map((a) => a.asset_key);
    const ASSET_CHUNK = 50;
    let assetsDeleted = 0;
    for (let i = 0; i < staleAssetKeys.length; i += ASSET_CHUNK) {
      const chunk = staleAssetKeys.slice(i, i + ASSET_CHUNK);
      const { error, count } = await sb.from('assets').delete({ count: 'exact' }).in('asset_key', chunk);
      if (error) {
        console.error('  ✗ assets delete failed:', error);
        console.error('  Restore by re-inserting from', ASSETS_BACKUP_PATH);
        process.exit(1);
      }
      assetsDeleted += count ?? 0;
    }
    console.log(`  deleted: ${assetsDeleted}`);

    const { count: assetsTotalAfter } = await sb
      .from('assets')
      .select('*', { count: 'exact', head: true });
    console.log(`  assets total now:         ${assetsTotalAfter}  (expected ${allAssets.length - staleAssets.length})`);
  }

  console.log('\n✓ Cleanup complete');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
