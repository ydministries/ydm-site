#!/usr/bin/env npx tsx
/**
 * Phase G — Step 1: insert/upsert the "global" page_content rows.
 *
 * Reads from archive/wordpress/scrape/seed-plan.json (the typed `global` block).
 * Uses the same upsert pattern as seed-content.ts (ON CONFLICT DO NOTHING via
 * ignoreDuplicates), so re-runs are safe.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

loadEnv({ path: join(SITE_DIR, '.env.local') });

const SEED_PLAN_PATH = join(REPO_DIR, 'archive/wordpress/scrape/seed-plan.json');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const plan = JSON.parse(await readFile(SEED_PLAN_PATH, 'utf8')) as {
    global?: { rows?: Array<{ page_key: string; field_key: string; value: string; value_type: string }> };
  };
  const rows = plan.global?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error('seed-plan.json has no global.rows');
    process.exit(1);
  }
  console.log(`Loaded ${rows.length} global rows from seed-plan.json`);

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error, count } = await sb.from('page_content').upsert(rows, {
    onConflict: 'page_key,field_key',
    ignoreDuplicates: true,
    count: 'exact',
  });
  if (error) {
    console.error('upsert failed:', error);
    process.exit(1);
  }
  console.log(`upsert: new rows inserted = ${count ?? 0} (existing rows preserved by ON CONFLICT)`);

  const { count: total, error: e2 } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true })
    .eq('page_key', 'global');
  if (e2) {
    console.error('verify failed:', e2);
    process.exit(1);
  }
  console.log(`verify: select count(*) from page_content where page_key='global' → ${total}`);

  if (total !== 18) {
    console.error(`STOP: expected 18 rows for page_key='global', found ${total}`);
    process.exit(2);
  }
  console.log('OK: 18 global rows present.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
