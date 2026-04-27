#!/usr/bin/env npx tsx
/**
 * Phase I.7 — investigate remaining home garbage rows.
 *
 * Step A: list the 20 longest page_content rows for page_key='home'.
 * Step B: classify each by deletion criteria; print proposal.
 *
 * Read-only — never deletes.
 */

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: join(resolve(__dirname, '..'), '.env.local') });

type Row = { id: string; field_key: string; value_type: string; value: string };

const NAV_TEXT_SUBSTRINGS = [
  '/events-pageAll events',
  '/latest-sermonsSermon Library',
  'Get involved with YDMhome.hero.bg',
  'Ways to give:YDM',
  "Who we areYou're always",
];

function preview(value: string, len: number, side: 'head' | 'tail'): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  if (flat.length <= len) return flat;
  return side === 'head' ? flat.slice(0, len) + '…' : '…' + flat.slice(-len);
}

function classify(r: Row): { action: 'DELETE' | 'KEEP'; reason: string } {
  // a — known WP-nav concatenated substrings
  for (const sub of NAV_TEXT_SUBSTRINGS) {
    if (r.value.includes(sub)) {
      return { action: 'DELETE', reason: `contains nav-text substring "${sub}"` };
    }
  }
  // c — small-text fields shouldn't be giant
  if (r.value_type !== 'html' && r.value.length > 800) {
    return { action: 'DELETE', reason: `value_type=${r.value_type} but length=${r.value.length} > 800 (likely bad extraction)` };
  }
  return { action: 'KEEP', reason: 'no garbage signal' };
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await sb
    .from('page_content')
    .select('id, field_key, value_type, value')
    .eq('page_key', 'home');
  if (error) throw error;

  const rows = (data ?? []) as Row[];
  const sorted = [...rows].sort((a, b) => (b.value?.length ?? 0) - (a.value?.length ?? 0));

  // Step A — table of 20 longest
  console.log('═══ STEP A — 20 longest home rows ═══\n');
  console.log(
    `${'len'.padStart(6)}  ${'field_key'.padEnd(38)}  ${'value_type'.padEnd(10)}  ${'id'.padEnd(36)}  preview`,
  );
  console.log('-'.repeat(180));
  for (const r of sorted.slice(0, 20)) {
    const pv = preview(r.value, 60, 'head');
    console.log(
      `${String(r.value.length).padStart(6)}  ${r.field_key.padEnd(38)}  ${r.value_type.padEnd(10)}  ${r.id}  ${pv}`,
    );
  }

  // Step B — proposal for top 20
  console.log('\n═══ STEP B — deletion proposal ═══\n');
  let proposed = 0;
  for (const r of sorted.slice(0, 20)) {
    const verdict = classify(r);
    console.log(
      `[${verdict.action}]  field_key=${r.field_key}  value_type=${r.value_type}  length=${r.value.length}`,
    );
    console.log(`  id=${r.id}`);
    console.log(`  first 200: "${preview(r.value, 200, 'head')}"`);
    console.log(`  last  100: "${preview(r.value, 100, 'tail')}"`);
    console.log(`  reason: ${verdict.reason}\n`);
    if (verdict.action === 'DELETE') proposed++;
  }

  // Also scan ALL home rows (not just top 20) for the nav substrings, in case
  // garbage is hiding in a shorter row.
  console.log('═══ Substring sweep across ALL home rows ═══\n');
  let extra = 0;
  for (const r of rows) {
    if (sorted.slice(0, 20).some((s) => s.id === r.id)) continue;
    const v = classify(r);
    if (v.action === 'DELETE') {
      extra++;
      console.log(
        `[ADDITIONAL DELETE]  field_key=${r.field_key}  value_type=${r.value_type}  length=${r.value.length}`,
      );
      console.log(`  id=${r.id}`);
      console.log(`  first 200: "${preview(r.value, 200, 'head')}"`);
      console.log(`  last  100: "${preview(r.value, 100, 'tail')}"`);
      console.log(`  reason: ${v.reason}\n`);
    }
  }
  if (extra === 0) console.log('  no additional matches outside top 20.\n');

  console.log(`\nAwaiting greenlight to delete ${proposed + extra} rows.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
