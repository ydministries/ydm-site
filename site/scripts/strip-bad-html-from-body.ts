/**
 * One-time cleanup of WordPress cruft in body_html and meta.title rows.
 *
 *   Sermon-specific (page_key like 'sermons.%'):
 *     - Truncate body_html at <h5>Share this Sermon:</h5> (drops the share-link
 *       cluster — Facebook/X/LinkedIn/email <a><svg></svg></a> chain that always
 *       runs to end-of-string).
 *     - Strip <h6>...Bishop Huel Wilson...</h6> title-repeats (preserves the
 *       useful scripture-label h6s like "Luke 15:11-32 NLT").
 *
 *   Ministry-specific (page_key like 'ministries.%'):
 *     - Strip <figure>...<img src="...DEMO..."/>...</figure> blocks where the
 *       img src matches a known demo / placeholder pattern. The Faith-Connect
 *       WP theme ships demo gallery images (filenames starting with
 *       "58-ministry-gallery-") that the XML import dragged in. They render as
 *       broken full-bleed boxes in our prose layout.
 *
 *   Both:
 *     - Strip " – YDM – Yeshua Deliverance Ministries" suffix from meta.title.
 *
 * Idempotent. Re-runs are no-ops once the markers are gone.
 *
 * Usage: npx tsx scripts/strip-bad-html-from-body.ts
 */
import { config as loadEnv } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { join } from 'node:path';

loadEnv({ path: join(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TITLE_SUFFIX_RE = /\s*[–-]\s*YDM\s*[–-]\s*Yeshua Deliverance Ministries\s*$/;
const SHARE_HEADER_RE = /<h5[^>]*>\s*Share this Sermon:\s*<\/h5>/i;
const TITLE_REPEAT_H6_RE = /<h6[^>]*>[^<]*Bishop\s*Huel\s*Wilson[^<]*<\/h6>\s*/gi;

// Patterns indicating an <img> src is demo/placeholder/broken content.
const BAD_SRC_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'empty src',                   re: /\bsrc\s*=\s*["']\s*["']/i },
  { name: 'cmsmasters demo',             re: /cmsmasters/i },
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

function cleanSermonBody(html: string): string {
  let out = html;
  const shareIdx = out.search(SHARE_HEADER_RE);
  if (shareIdx >= 0) out = out.slice(0, shareIdx);
  out = out.replace(TITLE_REPEAT_H6_RE, '');
  return out.trimEnd();
}

function cleanMinistryBody(html: string): { html: string; matched: Set<string> } {
  let out = html;
  const matched = new Set<string>();

  // 1. Strip <figure>...</figure> blocks where the inner <img> has a bad src.
  out = out.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (full, inner: string) => {
    if (!/<img\s/i.test(inner)) return full;
    const reason = badSrcReason(inner);
    if (reason) {
      matched.add(reason);
      return '';
    }
    return full;
  });

  // 2. Strip naked <img> tags with bad src (no <figure> wrapper).
  out = out.replace(/<img\s[^>]*\/?>/gi, (tag: string) => {
    const reason = badSrcReason(tag);
    if (reason) {
      matched.add(reason);
      return '';
    }
    return tag;
  });

  // 3. Collapse whitespace runs introduced by the stripped blocks.
  out = out.replace(/\s+/g, ' ').replace(/>\s+</g, '><');
  return { html: out.trim(), matched };
}

async function fixTitles(prefix: string): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .like('page_key', `${prefix}.%`)
    .neq('page_key', `${prefix}.index`)
    .not('page_key', 'like', `${prefix}.cat.%`)
    .eq('field_key', 'meta.title');
  if (error) throw error;
  let updated = 0;
  for (const r of data ?? []) {
    const before = r.value as string;
    const after = before.replace(TITLE_SUFFIX_RE, '').trim();
    if (before === after) continue;
    console.log(`  ✓ ${r.page_key} title: "${before}" → "${after}"`);
    const { error: uErr } = await sb.from('page_content').update({ value: after }).eq('id', r.id);
    if (uErr) {
      console.error(`    ✗ update failed:`, uErr.message);
      continue;
    }
    updated++;
  }
  return updated;
}

async function fixSermonBodies(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .like('page_key', 'sermons.%')
    .neq('page_key', 'sermons.index')
    .not('page_key', 'like', 'sermons.cat.%')
    .eq('field_key', 'body_html');
  if (error) throw error;

  let updated = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;
  for (const r of data ?? []) {
    const before = r.value as string;
    const after = cleanSermonBody(before);
    bytesBefore += before.length;
    bytesAfter += after.length;
    if (before === after) {
      console.log(`  ⤬ ${r.page_key}: clean already (${before.length} B)`);
      continue;
    }
    const saved = before.length - after.length;
    console.log(`  ✓ ${r.page_key}: ${before.length} → ${after.length} B (-${saved})`);
    const { error: uErr } = await sb.from('page_content').update({ value: after }).eq('id', r.id);
    if (uErr) {
      console.error(`    ✗ update failed:`, uErr.message);
      continue;
    }
    updated++;
  }
  console.log(`  bytes before: ${bytesBefore}; after: ${bytesAfter}; saved: ${bytesBefore - bytesAfter}`);
  return updated;
}

async function fixMinistryBodies(): Promise<number> {
  const { data, error } = await sb
    .from('page_content')
    .select('id, page_key, value')
    .like('page_key', 'ministries.%')
    .neq('page_key', 'ministries.index')
    .not('page_key', 'like', 'ministries.cat.%')
    .eq('field_key', 'body_html');
  if (error) throw error;

  let updated = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;
  for (const r of data ?? []) {
    const before = r.value as string;
    const { html: after, matched } = cleanMinistryBody(before);
    bytesBefore += before.length;
    bytesAfter += after.length;
    if (before === after) {
      console.log(`  ⤬ ${r.page_key}: clean already (${before.length} B)`);
      continue;
    }
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
  console.log(`  bytes before: ${bytesBefore}; after: ${bytesAfter}; saved: ${bytesBefore - bytesAfter}`);
  return updated;
}

async function main() {
  console.log('── sermon body_html ──');
  const sBodies = await fixSermonBodies();
  console.log(`  rows updated: ${sBodies}`);

  console.log('\n── ministry body_html (strip demo <figure> + bad <img>) ──');
  const mBodies = await fixMinistryBodies();
  console.log(`  rows updated: ${mBodies}`);

  console.log('\n── sermon meta.title ──');
  const sTitles = await fixTitles('sermons');
  console.log(`  rows updated: ${sTitles}`);

  console.log('\n── ministry meta.title ──');
  const mTitles = await fixTitles('ministries');
  console.log(`  rows updated: ${mTitles}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
