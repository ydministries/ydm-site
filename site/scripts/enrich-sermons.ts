/**
 * Build-time scripture enrichment for sermon page_keys.
 *
 *   1. Read body_html for each sermons.* page (excluding sermons.index / .cat.*)
 *   2. Regex-extract scripture refs (66 books + common abbreviations)
 *   3. Normalize to canonical form ("1 Cor. 13:4-7" → "1 Corinthians 13:4-7")
 *   4. Dedupe within a sermon
 *   5. Fetch each ref's text from bible-api.com (translation=web, public domain)
 *   6. Store as page_content row (field_key='scripture_refs', value_type='json',
 *      value=JSON.stringify([{ ref, text, translation, url }, ...]))
 *
 * Idempotency: a sermon that already has a scripture_refs row is skipped.
 *
 * Network: 3 retries with 1s linear backoff per ref. Failures are logged and
 * skipped — they don't fail the whole run.
 *
 * Usage: npm run enrich:sermons
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
loadEnv({ path: join(SITE_DIR, '.env.local') });

// ── Bible book table (66 books, with common abbreviations) ────────────────
type Book = { full: string; abbrev: string[] };
const BIBLE_BOOKS: Book[] = [
  // OT
  { full: 'Genesis', abbrev: ['Gen', 'Gn'] },
  { full: 'Exodus', abbrev: ['Exod', 'Exo', 'Ex'] },
  { full: 'Leviticus', abbrev: ['Lev', 'Lv'] },
  { full: 'Numbers', abbrev: ['Num', 'Nm', 'Nu'] },
  { full: 'Deuteronomy', abbrev: ['Deut', 'Deu', 'Dt'] },
  { full: 'Joshua', abbrev: ['Josh', 'Jos'] },
  { full: 'Judges', abbrev: ['Judg', 'Jdg', 'Jgs'] },
  { full: 'Ruth', abbrev: ['Ru', 'Rth'] },
  { full: '1 Samuel', abbrev: ['1 Sam', '1 Sm', '1Sam', 'I Sam', 'I Samuel'] },
  { full: '2 Samuel', abbrev: ['2 Sam', '2 Sm', '2Sam', 'II Sam', 'II Samuel'] },
  { full: '1 Kings', abbrev: ['1 Kgs', '1 Ki', '1Kgs', 'I Kgs', 'I Kings'] },
  { full: '2 Kings', abbrev: ['2 Kgs', '2 Ki', '2Kgs', 'II Kgs', 'II Kings'] },
  { full: '1 Chronicles', abbrev: ['1 Chr', '1 Ch', '1Chr', 'I Chr'] },
  { full: '2 Chronicles', abbrev: ['2 Chr', '2 Ch', '2Chr', 'II Chr'] },
  { full: 'Ezra', abbrev: ['Ezr'] },
  { full: 'Nehemiah', abbrev: ['Neh', 'Ne'] },
  { full: 'Esther', abbrev: ['Est', 'Esth'] },
  { full: 'Job', abbrev: ['Jb'] },
  { full: 'Psalms', abbrev: ['Psalm', 'Ps', 'Psa', 'Psm'] },
  { full: 'Proverbs', abbrev: ['Prov', 'Pr', 'Prv'] },
  { full: 'Ecclesiastes', abbrev: ['Eccl', 'Ecc', 'Qoh'] },
  { full: 'Song of Solomon', abbrev: ['Song', 'SS', 'Cant'] },
  { full: 'Isaiah', abbrev: ['Isa', 'Is'] },
  { full: 'Jeremiah', abbrev: ['Jer', 'Je'] },
  { full: 'Lamentations', abbrev: ['Lam', 'La'] },
  { full: 'Ezekiel', abbrev: ['Ezek', 'Eze', 'Ezk'] },
  { full: 'Daniel', abbrev: ['Dan', 'Dn'] },
  { full: 'Hosea', abbrev: ['Hos'] },
  { full: 'Joel', abbrev: ['Jl'] },
  { full: 'Amos', abbrev: ['Am'] },
  { full: 'Obadiah', abbrev: ['Obad', 'Ob'] },
  { full: 'Jonah', abbrev: ['Jon'] },
  { full: 'Micah', abbrev: ['Mic', 'Mi'] },
  { full: 'Nahum', abbrev: ['Nah', 'Na'] },
  { full: 'Habakkuk', abbrev: ['Hab'] },
  { full: 'Zephaniah', abbrev: ['Zeph', 'Zep'] },
  { full: 'Haggai', abbrev: ['Hag'] },
  { full: 'Zechariah', abbrev: ['Zech', 'Zec'] },
  { full: 'Malachi', abbrev: ['Mal'] },
  // NT
  { full: 'Matthew', abbrev: ['Matt', 'Mt'] },
  { full: 'Mark', abbrev: ['Mk', 'Mrk'] },
  { full: 'Luke', abbrev: ['Lk'] },
  { full: 'John', abbrev: ['Jn', 'Jhn'] },
  { full: 'Acts', abbrev: ['Ac'] },
  { full: 'Romans', abbrev: ['Rom', 'Ro'] },
  { full: '1 Corinthians', abbrev: ['1 Cor', '1Cor', 'I Cor', 'I Corinthians'] },
  { full: '2 Corinthians', abbrev: ['2 Cor', '2Cor', 'II Cor', 'II Corinthians'] },
  { full: 'Galatians', abbrev: ['Gal'] },
  { full: 'Ephesians', abbrev: ['Eph'] },
  { full: 'Philippians', abbrev: ['Phil', 'Php'] },
  { full: 'Colossians', abbrev: ['Col'] },
  { full: '1 Thessalonians', abbrev: ['1 Thess', '1 Thes', '1Thess', 'I Thess', 'I Thessalonians'] },
  { full: '2 Thessalonians', abbrev: ['2 Thess', '2 Thes', '2Thess', 'II Thess', 'II Thessalonians'] },
  { full: '1 Timothy', abbrev: ['1 Tim', '1Tim', 'I Tim', 'I Timothy'] },
  { full: '2 Timothy', abbrev: ['2 Tim', '2Tim', 'II Tim', 'II Timothy'] },
  { full: 'Titus', abbrev: ['Tit'] },
  { full: 'Philemon', abbrev: ['Phlm', 'Phm'] },
  { full: 'Hebrews', abbrev: ['Heb'] },
  { full: 'James', abbrev: ['Jas', 'Jms'] },
  { full: '1 Peter', abbrev: ['1 Pet', '1Pet', 'I Pet', 'I Peter'] },
  { full: '2 Peter', abbrev: ['2 Pet', '2Pet', 'II Pet', 'II Peter'] },
  { full: '1 John', abbrev: ['1 Jn', '1John', 'I John', 'I Jn'] },
  { full: '2 John', abbrev: ['2 Jn', '2John', 'II John', 'II Jn'] },
  { full: '3 John', abbrev: ['3 Jn', '3John', 'III John', 'III Jn'] },
  { full: 'Jude', abbrev: ['Jud'] },
  { full: 'Revelation', abbrev: ['Rev', 'Re', 'Apoc'] },
];

// Map every recognized name (full + abbrev, lowercased) to canonical full name.
const NAME_TO_FULL = new Map<string, string>();
for (const b of BIBLE_BOOKS) {
  NAME_TO_FULL.set(b.full.toLowerCase(), b.full);
  for (const a of b.abbrev) NAME_TO_FULL.set(a.toLowerCase(), b.full);
}

// Build the regex. Sort tokens by length DESC so e.g. "Philippians" wins over "Phil".
function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const allTokens = BIBLE_BOOKS.flatMap((b) => [b.full, ...b.abbrev])
  .sort((a, b) => b.length - a.length)
  .map(esc)
  .join('|');
// Captures:
//   1: optional ordinal prefix ("1 ", "2 ", "3 ", "I ", "II ", "III ") consumed
//      already if part of a multi-word book name token; this group is here for
//      cases where the book name was matched as just "Cor" with prefix detached.
//   2: book token
//   3: chapter
//   4: optional start verse
//   5: optional end verse
const SCRIPTURE_RE = new RegExp(
  String.raw`\b(?:(1|2|3|I|II|III)\s+)?(${allTokens})\.?\s+(\d{1,3})(?::(\d{1,3})(?:[-–](\d{1,3}))?)?\b`,
  'gi',
);

function normalizeRef(prefix: string | undefined, bookToken: string, ch: string, v1?: string, v2?: string): string | null {
  // Combine prefix + book token if needed for resolution. If the matched token
  // already includes its ordinal (e.g. "1 Corinthians" matched whole), prefix
  // will be undefined and bookToken will be the full string.
  const combined = prefix ? `${prefix} ${bookToken}` : bookToken;
  const full = NAME_TO_FULL.get(combined.toLowerCase()) ?? NAME_TO_FULL.get(bookToken.toLowerCase());
  if (!full) return null;
  let out = `${full} ${ch}`;
  if (v1) {
    out += `:${v1}`;
    if (v2 && +v2 > +v1) out += `-${v2}`;
  }
  return out;
}

function extractRefs(html: string): string[] {
  const seen = new Set<string>();
  // Strip tags before scanning so we don't pick up "1" from "h1" etc.
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  for (const m of text.matchAll(SCRIPTURE_RE)) {
    const ref = normalizeRef(m[1], m[2], m[3], m[4], m[5]);
    if (ref) seen.add(ref);
  }
  return [...seen];
}

// ── bible-api.com fetch with retry + cache ────────────────────────────────
const verseCache = new Map<string, { text: string; translation: string } | null>();

async function fetchVerse(ref: string): Promise<{ text: string; translation: string } | null> {
  if (verseCache.has(ref)) return verseCache.get(ref)!;
  const slug = ref.replace(/\s+/g, '+');
  const url = `https://bible-api.com/${encodeURIComponent(slug)}?translation=web`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ydm-enrich/1.0' } });
      if (res.status === 429) {
        // Exponential backoff specifically for rate-limit responses.
        const wait = 2000 * attempt;
        console.warn(`    429 on "${ref}" (attempt ${attempt}); sleeping ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) {
        if (res.status === 404) {
          verseCache.set(ref, null);
          return null;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as { text?: string; translation_name?: string };
      const out = {
        text: (json.text ?? '').trim(),
        translation: json.translation_name ?? 'World English Bible',
      };
      verseCache.set(ref, out);
      return out;
    } catch (err) {
      if (attempt === 5) {
        console.warn(`  ! fetch failed for "${ref}" after 5 attempts: ${(err as Error).message}`);
        verseCache.set(ref, null);
        return null;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

// Throttle: bible-api is community-run; ~3 req/s is the safe ceiling.
async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find sermon detail page_keys (exclude index and category facets).
  const { data: sermonKeys, error: kErr } = await sb
    .from('page_content')
    .select('page_key')
    .like('page_key', 'sermons.%')
    .neq('page_key', 'sermons.index')
    .not('page_key', 'like', 'sermons.cat.%');
  if (kErr) throw kErr;
  const slugSet = new Set<string>();
  for (const r of sermonKeys ?? []) slugSet.add(r.page_key);
  const slugs = [...slugSet].sort();
  console.log(`Found ${slugs.length} sermon page_keys.`);

  let processed = 0;
  let skipped = 0;
  let totalRefs = 0;
  let failedFetches = 0;
  const sample: { slug: string; refs: { ref: string; text: string }[] } | null = null as never;
  let firstSampleSet = false;

  for (const slug of slugs) {
    const { data: rows, error: rErr } = await sb
      .from('page_content')
      .select('field_key, value, value_type')
      .eq('page_key', slug)
      .in('field_key', ['body_html', 'scripture_refs']);
    if (rErr) throw rErr;
    const map = new Map<string, { value: string; value_type: string }>();
    for (const r of rows ?? []) map.set(r.field_key, r as { value: string; value_type: string });

    if (map.has('scripture_refs')) {
      console.log(`  ⤬ skip ${slug} (already has scripture_refs)`);
      skipped++;
      continue;
    }

    const body = map.get('body_html')?.value ?? '';
    if (!body) {
      console.log(`  ⤬ skip ${slug} (no body_html)`);
      skipped++;
      continue;
    }

    const refs = extractRefs(body);
    console.log(`  → ${slug}: ${refs.length} unique refs`);

    const enriched: Array<{ ref: string; text: string; translation: string; url: string }> = [];
    for (const ref of refs) {
      const fetched = await fetchVerse(ref);
      if (!fetched) {
        failedFetches++;
        continue;
      }
      enriched.push({
        ref,
        text: fetched.text,
        translation: fetched.translation,
        url: `/sermons/${slug.replace(/^sermons\./, '')}`,
      });
      await sleep(350); // throttle to stay under bible-api's rate limit
    }

    // Insert the scripture_refs row. The schema CHECK constraint on value_type
    // doesn't include 'json' — JSON-encoded data lives in 'text' rows and is
    // parsed by the consuming template.
    const { error: iErr } = await sb.from('page_content').insert({
      page_key: slug,
      field_key: 'scripture_refs',
      value: JSON.stringify(enriched),
      value_type: 'text',
    });
    if (iErr) {
      console.error(`  ✗ insert failed for ${slug}:`, iErr.message);
      continue;
    }
    processed++;
    totalRefs += enriched.length;

    if (!firstSampleSet && enriched.length > 0) {
      console.log(`\n── sample (${slug}) ──`);
      console.log(JSON.stringify(enriched.slice(0, 3), null, 2));
      console.log('');
      firstSampleSet = true;
    }
  }

  console.log(`\n──── enrichment summary ────`);
  console.log(`  processed:        ${processed}`);
  console.log(`  skipped:          ${skipped}`);
  console.log(`  total refs saved: ${totalRefs}`);
  console.log(`  failed fetches:   ${failedFetches}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
