/**
 * One-time cleanup of WordPress cruft in body_html and meta.title rows.
 *
 *   meta.title (ALL page_keys):
 *     - Strip " – YDM – Yeshua Deliverance Ministries" suffix. The site layout
 *       appends " | Yeshua Deliverance Ministries" via title.template, so the
 *       legacy WP suffix would render twice.
 *
 *   body_html (ALL page_keys):
 *     - Strip <figure>...<img src="...DEMO..."/>...</figure> and naked <img>
 *       tags whose src matches a known demo / placeholder pattern (cmsmasters,
 *       theme-dev, demo., placeholder, lorempixel, localhost, the
 *       58-ministry-gallery- demo theme prefix). Originally ministry-only;
 *       extended in Phase R.1 after audit found leaks across blog, locations,
 *       team, sermons.
 *     - Strip bare <a href="#">text</a> placeholder anchors (no data-*,
 *       onclick, aria-controls/expanded, or role attribute). These are
 *       leftovers from the WP theme's social/share/expand widgets and now
 *       point nowhere.
 *
 *   body_html (sermons.* only):
 *     - Truncate at <h5>Share this Sermon:</h5> (drops the share-link cluster).
 *     - Strip <h6>...Bishop Huel Wilson...</h6> title-repeats (preserves the
 *       useful scripture-label h6s like "Luke 15:11-32 NLT").
 *
 *   body_html (team.* only):
 *     - DELETE rows whose value contains lorem-ipsum filler ("lorem ipsum",
 *       "consectetur adipiscing", "sed do eiusmod"). These are XML-import
 *       defaults that override the real seeded person_bio.
 *
 * Idempotent. Re-runs are no-ops once the markers are gone.
 *
 * Usage: npx tsx scripts/strip-bad-html-from-body.ts
 */
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join } from 'node:path';

loadEnv({ path: join(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TITLE_SUFFIX_RE = /\s*[–-]\s*YDM\s*[–-]\s*Yeshua Deliverance Ministries\s*$/;
const SHARE_HEADER_RE = /<h5[^>]*>\s*Share this Sermon:\s*<\/h5>/i;
const TITLE_REPEAT_H6_RE = /<h6[^>]*>[^<]*Bishop\s*Huel\s*Wilson[^<]*<\/h6>\s*/gi;

const LOREM_PATTERNS = [
  /lorem\s+ipsum/i,
  /consectetur\s+adipiscing/i,
  /sed\s+do\s+eiusmod/i,
];

// Patterns indicating an <img> src is demo/placeholder/broken content.
const BAD_SRC_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'empty src',                   re: /\bsrc\s*=\s*["']\s*["']/i },
  { name: 'cmsmasters',                  re: /cmsmasters/i },
  { name: 'theme-dev',                   re: /theme-dev/i },
  { name: 'demo. host',                  re: /\/\/[^/"' ]*demo\./i },
  { name: 'placeholder',                 re: /placeholder/i },
  { name: 'lorempixel',                  re: /lorempixel/i },
  { name: 'unsplash auto-placeholder',   re: /unsplash\.com\/photos\/-/i },
  { name: 'localhost',                   re: /localhost|127\.0\.0\.1/i },
  { name: '58-ministry-gallery (theme)', re: /58-ministry-gallery-/i },
];

function badSrcReason(imgInner: string): string | null {
  for (const p of BAD_SRC_PATTERNS) {
    if (p.re.test(imgInner)) return p.name;
  }
  return null;
}

function stripBadImages(html: string, matched: Set<string>): string {
  // 1. Strip <figure>...</figure> blocks where the inner <img> has a bad src.
  let out = html.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (full, inner: string) => {
    if (!/<img\s/i.test(inner)) return full;
    const reason = badSrcReason(inner);
    if (reason) {
      matched.add(`figure:${reason}`);
      return '';
    }
    return full;
  });
  // 2. Strip naked <img> tags with bad src (no <figure> wrapper).
  out = out.replace(/<img\s[^>]*\/?>/gi, (tag: string) => {
    const reason = badSrcReason(tag);
    if (reason) {
      matched.add(`img:${reason}`);
      return '';
    }
    return tag;
  });
  return out;
}

// Strip placeholder/dead anchors:
//   - <a href="#">text</a>        (and href="")
//   - <a href="https://...cmsmasters.../...">text</a>  (demo-theme nav links)
// In all cases, unwrap to the inner text/HTML — keep the words, drop only the
// link. Functional anchors with data-*, onclick, aria-controls/expanded, or
// role are preserved for the href="#"/"" case (they're real JS toggles).
// cmsmasters anchors are always unwrapped regardless of attrs (no scenario
// where we want a live link to the demo theme).
function stripBareHashAnchors(html: string, matched: Set<string>): string {
  return html.replace(/<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi, (full, attrs: string, inner: string) => {
    if (/href\s*=\s*["'][^"']*(?:cmsmasters|theme-dev)[^"']*["']/i.test(attrs)) {
      matched.add('anchor:cmsmasters-url');
      return inner;
    }
    const isHashHref = /href\s*=\s*["']#["']/i.test(attrs);
    const isEmptyHref = /href\s*=\s*["']\s*["']/i.test(attrs);
    if (!isHashHref && !isEmptyHref) return full;
    const isFunctional = /\b(data-|onclick\s*=|aria-controls\s*=|aria-expanded\s*=|role\s*=)/i.test(attrs);
    if (isFunctional) return full;
    matched.add(isHashHref ? 'anchor:href="#"' : 'anchor:href=""');
    return inner;
  });
}

function cleanSermonOnly(html: string): string {
  let out = html;
  const shareIdx = out.search(SHARE_HEADER_RE);
  if (shareIdx >= 0) out = out.slice(0, shareIdx);
  out = out.replace(TITLE_REPEAT_H6_RE, '');
  return out;
}

function cleanBody(pageKey: string, html: string): { html: string; matched: Set<string> } {
  const matched = new Set<string>();
  let out = html;

  // Sermon-specific truncation FIRST (drops everything after share header).
  if (pageKey.startsWith('sermons.')) {
    const beforeLen = out.length;
    out = cleanSermonOnly(out);
    if (out.length !== beforeLen) matched.add('sermon-share-truncate');
  }

  out = stripBadImages(out, matched);
  out = stripBareHashAnchors(out, matched);

  // Collapse whitespace runs introduced by stripped blocks.
  out = out.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

  return { html: out, matched };
}

async function fixAllTitles(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .eq('field_key', 'meta.title');
  if (error) throw error;
  let updated = 0;
  for (const r of data ?? []) {
    const before = r.value as string;
    const after = before.replace(TITLE_SUFFIX_RE, '').trim();
    if (before === after) continue;
    console.log(`  ✓ ${r.page_key}: "${before}" → "${after}"`);
    const { error: uErr } = await sb.from('page_content').update({ value: after }).eq('id', r.id);
    if (uErr) {
      console.error(`    ✗ update failed:`, uErr.message);
      continue;
    }
    updated++;
  }
  return updated;
}

async function fixAllBodies(): Promise<{ updated: number; bytesBefore: number; bytesAfter: number }> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .eq('field_key', 'body_html');
  if (error) throw error;

  let updated = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;
  for (const r of data ?? []) {
    const before = r.value as string;
    const { html: after, matched } = cleanBody(r.page_key, before);
    bytesBefore += before.length;
    bytesAfter += after.length;
    if (before === after) continue;
    const saved = before.length - after.length;
    const reasons = matched.size ? ` [${[...matched].join(', ')}]` : '';
    console.log(`  ✓ ${r.page_key}: ${before.length} → ${after.length} B (-${saved})${reasons}`);
    const { error: uErr } = await sb.from('page_content').update({ value: after }).eq('id', r.id);
    if (uErr) {
      console.error(`    ✗ update failed:`, uErr.message);
      continue;
    }
    updated++;
  }
  return { updated, bytesBefore, bytesAfter };
}

async function deleteLoremTeamBodies(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .like('page_key', 'team.%')
    .eq('field_key', 'body_html');
  if (error) throw error;

  let deleted = 0;
  for (const r of data ?? []) {
    const v = r.value as string;
    const hit = LOREM_PATTERNS.find((re) => re.test(v));
    if (!hit) continue;
    console.log(`  ✗ ${r.page_key}: deleting body_html (${v.length} B, matched ${hit})`);
    const { error: dErr } = await sb.from('page_content').delete().eq('id', r.id);
    if (dErr) {
      console.error(`    ✗ delete failed:`, dErr.message);
      continue;
    }
    deleted++;
  }
  return deleted;
}

// Scan ALL rows for lorem patterns in their value (not just body_html).
// Audit found lorem in p.01/p.02 fields on team.clementinawilson — these are
// scraped paragraph blobs that no template renders, but they still hydrate
// into the RSC data blob so they appear in HTML grep.
async function deleteAnyLoremRows(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, field_key, value')
    .or('value.ilike.%lorem ipsum%,value.ilike.%consectetur adipiscing%,value.ilike.%sed do eiusmod%');
  if (error) throw error;

  let deleted = 0;
  for (const r of data ?? []) {
    const v = r.value as string;
    const hit = LOREM_PATTERNS.find((re) => re.test(v));
    if (!hit) continue;
    console.log(`  ✗ ${r.page_key} / ${r.field_key}: deleting (${v.length} B, matched ${hit})`);
    const { error: dErr } = await sb.from('page_content').delete().eq('id', r.id);
    if (dErr) {
      console.error(`    ✗ delete failed:`, dErr.message);
      continue;
    }
    deleted++;
  }
  return deleted;
}

// Scan non-body_html rows for cmsmasters/theme-dev URLs and delete them.
// These are orphan WP-scraped URL fields (image.01..image.04, url, etc.) that
// no template renders, but they still appear in the RSC payload so audit grep
// flags them. body_html rows are excluded because they have valuable article
// text alongside any residual host references — those are scrubbed in
// fixAllBodies via stripBareHashAnchors instead.
async function deleteBadUrlRows(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, field_key, value')
    .neq('field_key', 'body_html')
    .or('value.ilike.%cmsmasters%,value.ilike.%theme-dev%');
  if (error) throw error;

  let deleted = 0;
  for (const r of data ?? []) {
    const v = r.value as string;
    console.log(`  ✗ ${r.page_key} / ${r.field_key}: deleting (${v.length} B)`);
    const { error: dErr } = await sb.from('page_content').delete().eq('id', r.id);
    if (dErr) {
      console.error(`    ✗ delete failed:`, dErr.message);
      continue;
    }
    deleted++;
  }
  return deleted;
}

// The assets table has WP-scraped rows whose storage_path points at the
// cmsmasters demo theme. They aren't migrated to R2 and aren't rendered by
// any current template — but the AssetProvider serializes the full row list
// into the RSC payload so they show up in HTML grep.
async function deleteBadAssetRows(): Promise<number> {
  const { data, error } = await sb
    .from('assets')
    .select('id, asset_key, storage_path')
    .or('storage_path.ilike.%cmsmasters%,storage_path.ilike.%theme-dev%');
  if (error) throw error;

  let deleted = 0;
  for (const r of data ?? []) {
    console.log(`  ✗ ${r.asset_key}: ${r.storage_path}`);
    const { error: dErr } = await sb.from('assets').delete().eq('id', r.id);
    if (dErr) {
      console.error(`    ✗ delete failed:`, dErr.message);
      continue;
    }
    deleted++;
  }
  return deleted;
}

async function main() {
  console.log('── meta.title (all page_keys) ──');
  const titleRows = await fixAllTitles();
  console.log(`  rows updated: ${titleRows}`);

  console.log('\n── body_html (all page_keys: bad images + bare hash-href anchors) ──');
  const bodies = await fixAllBodies();
  console.log(`  rows updated: ${bodies.updated}`);
  console.log(`  bytes before: ${bodies.bytesBefore}; after: ${bodies.bytesAfter}; saved: ${bodies.bytesBefore - bodies.bytesAfter}`);

  console.log('\n── body_html DELETE (team.* with lorem ipsum) ──');
  const loremTeamDeleted = await deleteLoremTeamBodies();
  console.log(`  rows deleted: ${loremTeamDeleted}`);

  console.log('\n── ANY-field DELETE (lorem ipsum across all page_keys) ──');
  const loremAnyDeleted = await deleteAnyLoremRows();
  console.log(`  rows deleted: ${loremAnyDeleted}`);

  console.log('\n── non-body URL DELETE (cmsmasters / theme-dev URLs in image.*, url, etc.) ──');
  const badUrlDeleted = await deleteBadUrlRows();
  console.log(`  rows deleted: ${badUrlDeleted}`);

  console.log('\n── assets table DELETE (cmsmasters / theme-dev storage_path rows) ──');
  const badAssetsDeleted = await deleteBadAssetRows();
  console.log(`  rows deleted: ${badAssetsDeleted}`);

  console.log('\n── done ──');
  console.log(`  titles updated: ${titleRows}`);
  console.log(`  bodies updated: ${bodies.updated} (saved ${bodies.bytesBefore - bodies.bytesAfter} B)`);
  console.log(`  lorem (team body_html) rows deleted: ${loremTeamDeleted}`);
  console.log(`  lorem (any field) rows deleted: ${loremAnyDeleted}`);
  console.log(`  bad URL page_content rows deleted: ${badUrlDeleted}`);
  console.log(`  bad assets rows deleted: ${badAssetsDeleted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
