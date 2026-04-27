#!/usr/bin/env npx tsx
/**
 * Phase I.3 — seed-fixups (Option A, scoped to home only).
 *
 *   1. Delete the row where page_key='home' AND field_key='body_html'.
 *      (This row is the mangled multi-line concatenated nav HTML blob — codegen
 *      already filters body_html via BODY_SKIP_KEYS, but this also removes it
 *      from the DB so admins don't see/edit it.)
 *   2. UPDATE every page_content row where value LIKE '%Minstries%' to replace
 *      "Minstries" → "Ministries" (parameterized REPLACE).
 *
 * Default: dry-run (prints what would change). Pass --commit to apply.
 *
 * Out of scope:
 *   - body_html on any other page_key (untouched)
 *   - rows whose value is "/campaigns/supportydm" (legitimate CTAs)
 *   - "/campaigns/supportydmGive" / "YDMhome.hero.bg" (no matches anyway)
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');
loadEnv({ path: join(SITE_DIR, '.env.local') });

const MANUAL_SEED_PATH = join(REPO_DIR, 'archive/wordpress/scrape/manual-seed.json');

// Mirrors the inference rule in scripts/seed-content.ts. Manual-seed JSON only
// stores key→string; this picks the right value_type column for new rows.
function inferValueType(fieldKey: string): string {
  if (fieldKey === 'body_html') return 'html';
  if (fieldKey === 'date_published') return 'date';
  if (fieldKey === 'meta.og_image') return 'url';
  if (fieldKey.startsWith('meta.')) return 'text';
  if (fieldKey === 'slug' || fieldKey === 'excerpt') return 'text';
  if (/^h[1-6]\.\d+/.test(fieldKey)) return 'text';
  if (/^p\.\d+/.test(fieldKey)) return 'html';
  if (/^list\.\d+/.test(fieldKey)) return 'html';
  if (/^quote\.\d+/.test(fieldKey)) return 'html';
  if (/^block\.\d+/.test(fieldKey)) return 'html';
  if (/^image\.\d+\.url$/.test(fieldKey)) return 'url';
  if (/^image\.\d+\.alt$/.test(fieldKey)) return 'text';
  if (/^image\.\d+$/.test(fieldKey)) return 'url';
  if (fieldKey.startsWith('form.')) return 'text';
  if (fieldKey === 'thumbnail_url') return 'url';
  if (fieldKey === 'audio_filename') return 'text';
  if (fieldKey === 'scripture_primary') return 'text';
  if (fieldKey === 'scripture_refs') return 'text';
  if (fieldKey === 'hero_image') return 'url';
  if (fieldKey === 'tagline') return 'text';
  if (fieldKey === 'leader_name') return 'text';
  if (fieldKey === 'leader_role') return 'text';
  if (fieldKey === 'leader_bio') return 'html';
  if (fieldKey === 'portrait_url') return 'url';
  if (fieldKey === 'person_name') return 'text';
  if (fieldKey === 'person_title') return 'text';
  if (fieldKey === 'person_bio') return 'html';
  if (fieldKey === 'preaching') return 'text';
  if (fieldKey === 'ministries_led') return 'text';
  return 'text';
}

const COMMIT = process.argv.includes('--commit');

type Row = { id: string; page_key: string; field_key: string; value: string; value_type: string };

function preview(value: string, len = 200): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > len ? flat.slice(0, len - 1) + '…' : flat;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const sb: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`seed-fixups: ${COMMIT ? 'COMMIT' : 'DRY RUN'} mode\n`);

  // ── (1) home.body_html ──
  console.log('─── (1) page_key="home" AND field_key="body_html" ───');
  const { data: bhData, error: bhErr } = await sb
    .from('page_content')
    .select('id, page_key, field_key, value, value_type')
    .eq('page_key', 'home')
    .eq('field_key', 'body_html');
  if (bhErr) throw bhErr;
  const bhRows = (bhData ?? []) as Row[];
  for (const r of bhRows) {
    console.log(`  id=${r.id}  value_type=${r.value_type}  length=${r.value.length}`);
    console.log(`  first 200 chars: "${preview(r.value, 200)}"`);
  }
  console.log(`  matched ${bhRows.length} row(s) to delete.`);

  // ── (2) Minstries typo ──
  console.log('\n─── (2) page_content rows containing "Minstries" ───');
  const { data: tData, error: tErr } = await sb
    .from('page_content')
    .select('id, page_key, field_key, value, value_type')
    .ilike('value', '%Minstries%');
  if (tErr) throw tErr;
  const typoRows = (tData ?? []) as Row[];
  for (const r of typoRows) {
    console.log(`  id=${r.id}  page_key=${r.page_key}  field_key=${r.field_key}`);
    console.log(`    before: "${preview(r.value, 160)}"`);
    console.log(`    after : "${preview(r.value.replace(/Minstries/g, 'Ministries'), 160)}"`);
  }
  console.log(`  matched ${typoRows.length} row(s) to update.`);

  // ── (3) "WIlson" capital-I typo (case-sensitive: must NOT touch legit "Wilson") ──
  console.log('\n─── (3) page_content rows containing "WIlson" (capital I) ───');
  const { data: wData, error: wErr } = await sb
    .from('page_content')
    .select('id, page_key, field_key, value, value_type')
    .like('value', '%WIlson%');
  if (wErr) throw wErr;
  const wilsonRows = (wData ?? []) as Row[];
  for (const r of wilsonRows) {
    console.log(`  id=${r.id}  page_key=${r.page_key}  field_key=${r.field_key}`);
    console.log(`    before: "${preview(r.value, 160)}"`);
    console.log(`    after : "${preview(r.value.replace(/WIlson/g, 'Wilson'), 160)}"`);
  }
  console.log(`  matched ${wilsonRows.length} row(s) to update.`);

  // ── (4) Merge manual-seed home rows ──
  // Reads archive/wordpress/scrape/manual-seed.json's "home" block and upserts
  // each (page_key='home', field_key, value) with ON CONFLICT (page_key,
  // field_key) DO NOTHING. Re-runs are no-ops.
  console.log('\n─── (4) merge manual-seed.json "home" block ───');
  const manualText = await readFile(MANUAL_SEED_PATH, 'utf8');
  const manual = JSON.parse(manualText) as Record<string, Record<string, string>>;
  const manualHome = manual.home ?? {};
  const manualHomeRows = Object.entries(manualHome).map(([field_key, value]) => ({
    page_key: 'home',
    field_key,
    value,
    value_type: inferValueType(field_key),
  }));
  console.log(`  manual-seed home keys: ${manualHomeRows.length}`);
  for (const r of manualHomeRows) {
    console.log(`    ${r.field_key.padEnd(30)} (${r.value_type}) :: "${preview(r.value, 80)}"`);
  }

  // Snapshot current count for delta verification
  const { count: homeBefore } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true })
    .eq('page_key', 'home');
  console.log(`  home rows before merge: ${homeBefore}`);

  // ── (5) Merge manual-seed non-home blocks ──
  // Generic upsert for every non-home page_key block (sermons, ministries, etc.).
  // Same onConflict/ignoreDuplicates semantics as step (4) — re-runs are no-ops.
  console.log('\n─── (5) merge manual-seed.json non-home blocks ───');
  const otherRows = Object.entries(manual)
    .filter(([pk]) => pk !== 'home')
    .flatMap(([pk, fields]) =>
      Object.entries(fields).map(([fk, val]) => ({
        page_key: pk,
        field_key: fk,
        value: val,
        value_type: inferValueType(fk),
      })),
    );
  const otherByPage = new Map<string, number>();
  for (const r of otherRows) otherByPage.set(r.page_key, (otherByPage.get(r.page_key) ?? 0) + 1);
  for (const [pk, n] of otherByPage) console.log(`    ${pk.padEnd(60)} (${n} field${n === 1 ? '' : 's'})`);
  console.log(`  total non-home keys to upsert: ${otherRows.length}`);

  // ── PLAN ──
  console.log('\n═══ PLAN ═══');
  console.log(`  delete  home.body_html:                ${bhRows.length}`);
  console.log(`  update  Minstries → Ministries:        ${typoRows.length}`);
  console.log(`  update  WIlson → Wilson (case-sens):   ${wilsonRows.length}`);
  console.log(`  upsert  manual-seed home rows:         ${manualHomeRows.length}  (existing keys preserved)`);
  console.log(`  upsert  manual-seed non-home rows:     ${otherRows.length}  (existing keys preserved)`);

  if (!COMMIT) {
    console.log('\n— Dry run, nothing changed. Re-run with --commit to apply. —');
    return;
  }

  // ── COMMIT ──
  console.log('\n═══ APPLYING CHANGES ═══');

  if (bhRows.length > 0) {
    const { error, count } = await sb
      .from('page_content')
      .delete({ count: 'exact' })
      .eq('page_key', 'home')
      .eq('field_key', 'body_html');
    if (error) {
      console.error('  ✗ delete home.body_html failed:', error);
      process.exit(1);
    }
    console.log(`  ✓ deleted home.body_html: ${count ?? 0} row(s)`);
  }

  let updated = 0;
  for (const r of typoRows) {
    const newValue = r.value.replace(/Minstries/g, 'Ministries');
    const { error } = await sb.from('page_content').update({ value: newValue }).eq('id', r.id);
    if (error) {
      console.error(`  ✗ update failed for id=${r.id}:`, error.message);
      process.exit(1);
    }
    updated++;
  }
  console.log(`  ✓ updated Minstries rows: ${updated}`);

  let wUpdated = 0;
  for (const r of wilsonRows) {
    const newValue = r.value.replace(/WIlson/g, 'Wilson');
    const { error } = await sb.from('page_content').update({ value: newValue }).eq('id', r.id);
    if (error) {
      console.error(`  ✗ WIlson update failed for id=${r.id}:`, error.message);
      process.exit(1);
    }
    wUpdated++;
  }
  console.log(`  ✓ updated WIlson rows: ${wUpdated}`);

  // ── (4) APPLY: upsert manual-seed home rows ──
  if (manualHomeRows.length > 0) {
    const { error: msErr, count: msInserted } = await sb
      .from('page_content')
      .upsert(manualHomeRows, {
        onConflict: 'page_key,field_key',
        ignoreDuplicates: true,
        count: 'exact',
      });
    if (msErr) {
      console.error('  ✗ manual-seed upsert failed:', msErr);
      process.exit(1);
    }
    console.log(`  ✓ manual-seed upsert: ${msInserted ?? 0} new row(s) inserted (existing preserved)`);
  }

  // ── (5) APPLY: upsert manual-seed non-home rows ──
  if (otherRows.length > 0) {
    const { error: oErr, count: oInserted } = await sb
      .from('page_content')
      .upsert(otherRows, {
        onConflict: 'page_key,field_key',
        ignoreDuplicates: true,
        count: 'exact',
      });
    if (oErr) {
      console.error('  ✗ non-home manual-seed upsert failed:', oErr);
      process.exit(1);
    }
    console.log(`  ✓ non-home manual-seed upsert: ${oInserted ?? 0} new row(s) inserted (existing preserved)`);
  }

  // ── Verify ──
  const { count: remaining, error: vErr } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true })
    .eq('page_key', 'home')
    .eq('field_key', 'body_html');
  if (vErr) throw vErr;
  console.log(`\n  verify: home.body_html rows remaining = ${remaining}`);
  if (remaining !== 0) {
    console.error('  ✗ expected 0 — something went wrong.');
    process.exit(2);
  }

  const { count: homeAfter } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true })
    .eq('page_key', 'home');
  console.log(`  verify: home rows after = ${homeAfter}  (delta from before = ${(homeAfter ?? 0) - (homeBefore ?? 0)})`);

  console.log('\n✓ seed-fixups complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
