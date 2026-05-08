import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { parse, HTMLElement } from 'node-html-parser';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

loadEnv({ path: join(SITE_DIR, '.env.local') });

const ROUTE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/route-map.json');
const PAGES_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages-rewritten');
const PLAN_PATH = join(REPO_DIR, 'archive/wordpress/scrape/seed-plan.json');
const MISSING_ALTS_PATH = join(REPO_DIR, 'archive/wordpress/scrape/missing-alts.json');
const MANUAL_SEED_PATH = join(REPO_DIR, 'archive/wordpress/scrape/manual-seed.json');

// Types that legitimately have no body — they render from child queries.
const ZERO_BODY_EXEMPT_TYPES = new Set(['index_filter', 'index', 'home']);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const COMMIT = args.has('--commit');
const OVERWRITE = args.has('--overwrite');
if (!DRY_RUN && !COMMIT) {
  console.error('Usage: tsx scripts/seed-content.ts --dry-run | --commit [--overwrite]');
  process.exit(2);
}
if (OVERWRITE && !COMMIT) {
  console.error('--overwrite requires --commit (no-op on dry-run).');
  process.exit(2);
}

// Schema-allowed value_type values (CHECK constraint). Note: image_ref and
// datetime are NOT allowed — image refs map to 'url', dates to 'date'.
type ValueType =
  | 'text'
  | 'richtext'
  | 'markdown'
  | 'html'
  | 'number'
  | 'url'
  | 'email'
  | 'phone'
  | 'date'
  | 'asset_key';

type ContentRow = {
  page_key: string;
  field_key: string;
  value: string;
  value_type: ValueType;
};

type AssetRow = {
  asset_key: string;
  storage_path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
};

type RouteItem = {
  oldPath: string;
  oldSlug: string;
  newPath: string;
  type: string;
  key: string;
  scrapeFile: string;
  aliases: string[];
};

type RouteMap = { items: RouteItem[] };

type PageJson = {
  url?: string;
  slug?: string;
  title?: string;
  metaDescription?: string;
  og_image?: string;
  excerpt?: string;
  date?: string;
  // Set by Phase E.5 (import-from-xml.ts): the post body imported from
  // wordpress-export.xml, already URL-rewritten.
  html?: string;
  fullHtml?: string;
  sections?: Array<{ html?: string }>;
};

const BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'blockquote', 'img']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3']);

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

// Returns true if the given field_key represents body content (counts
// toward the zero-body acceptance check). Top-level meta/slug/excerpt/date
// and the body_html dump itself don't count.
function isBodyFieldKey(fieldKey: string): boolean {
  if (/^h[1-6]\.\d+/.test(fieldKey)) return true;
  if (/^p\.\d+/.test(fieldKey)) return true;
  if (/^list\.\d+/.test(fieldKey)) return true;
  if (/^quote\.\d+/.test(fieldKey)) return true;
  if (/^block\.\d+/.test(fieldKey)) return true;
  if (/^image\.\d+/.test(fieldKey)) return true;
  if (/^form\./.test(fieldKey)) return true;
  return false;
}

// Pick value_type for a field_key when it didn't come through the extraction
// path. Used by the manual-seed merge.
function inferValueTypeFromFieldKey(fieldKey: string): ValueType {
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
  return 'text';
}

// A "useful" content root must have at least one heading or paragraph with
// actual text. The scraper sometimes emits a 1.6KB sections[0] that is only
// a search-popup widget — we reject those, otherwise empty per-item pages
// (sermons, ministries, blog posts) appear to have content when they don't.
function rootHasUsefulContent(root: HTMLElement): boolean {
  const candidates = root.querySelectorAll('h1, h2, h3, p, blockquote, li');
  for (const c of candidates) {
    if (c.text.trim().length >= 12) return true;
  }
  return false;
}

function getInnerHtmlPreserved(el: HTMLElement): string {
  return el.innerHTML.trim();
}

function getOuterHtmlPreserved(el: HTMLElement): string {
  return el.outerHTML.trim();
}

function getCleanText(el: HTMLElement): string {
  // Collapse whitespace, decode entities via node-html-parser's .text getter.
  return el.text.replace(/\s+/g, ' ').trim();
}

type Counters = Record<string, number>;

function nextSeq(counters: Counters, kind: string): string {
  counters[kind] = (counters[kind] ?? 0) + 1;
  return pad2(counters[kind]);
}

// Walk children of `root` in document order. When we hit a block tag, emit a
// row and DO NOT recurse into it (prevents double-counting nested content).
// Otherwise, recurse into the child's children.
function decomposeBlocks(
  root: HTMLElement,
  pageKey: string,
): { rows: ContentRow[]; rootImageCount: number } {
  const rows: ContentRow[] = [];
  const counters: Counters = {};
  let rootImageCount = 0;

  function visit(el: HTMLElement) {
    for (const child of el.childNodes) {
      if (child.nodeType !== 1) continue; // skip text/comment nodes at this level
      const c = child as HTMLElement;
      const tag = (c.rawTagName || c.tagName || '').toLowerCase();
      if (!tag) {
        visit(c);
        continue;
      }

      if (HEADING_TAGS.has(tag)) {
        const text = getCleanText(c);
        if (text) {
          const seq = nextSeq(counters, tag);
          rows.push({
            page_key: pageKey,
            field_key: `${tag}.${seq}`,
            value: text,
            value_type: 'text',
          });
        }
        continue; // do not recurse — heading is a leaf
      }

      if (tag === 'p') {
        const inner = getInnerHtmlPreserved(c);
        if (inner) {
          const seq = nextSeq(counters, 'p');
          rows.push({
            page_key: pageKey,
            field_key: `p.${seq}`,
            value: inner,
            value_type: 'html',
          });
        }
        continue;
      }

      if (tag === 'ul' || tag === 'ol') {
        const outer = getOuterHtmlPreserved(c);
        if (outer) {
          const seq = nextSeq(counters, 'list');
          rows.push({
            page_key: pageKey,
            field_key: `list.${seq}`,
            value: outer,
            value_type: 'html',
          });
        }
        continue;
      }

      if (tag === 'blockquote') {
        const outer = getOuterHtmlPreserved(c);
        if (outer) {
          const seq = nextSeq(counters, 'quote');
          rows.push({
            page_key: pageKey,
            field_key: `quote.${seq}`,
            value: outer,
            value_type: 'html',
          });
        }
        continue;
      }

      if (tag === 'img') {
        // Root-level image at this depth — emit an image content row pointing
        // at the URL. Per-image asset rows are produced separately via a
        // global walk so we don't duplicate.
        const src = c.getAttribute('src') ?? '';
        if (src && /^https?:\/\//i.test(src)) {
          rootImageCount++;
          const seq = nextSeq(counters, 'image');
          rows.push({
            page_key: pageKey,
            field_key: `image.${seq}`,
            value: src,
            value_type: 'url',
          });
        }
        continue;
      }

      // Non-block element — descend into its children.
      visit(c);
    }
  }

  visit(root);
  return { rows, rootImageCount };
}

function extractAssets(root: HTMLElement, pageKey: string): {
  assetRows: AssetRow[];
  imageContentRows: ContentRow[];
  imagesWithoutAlt: number;
} {
  const imgs = root.querySelectorAll('img');
  const assetRows: AssetRow[] = [];
  const imageContentRows: ContentRow[] = [];
  let imagesWithoutAlt = 0;
  const seen = new Set<string>();
  let n = 0;

  for (const img of imgs) {
    const src = img.getAttribute('src') ?? '';
    if (!src || !/^https?:\/\//i.test(src)) continue;
    if (seen.has(src)) continue; // dedupe — same image referenced twice on a page
    seen.add(src);

    n++;
    const seq = pad2(n);
    const assetKey = `${pageKey}.image.${seq}`;
    const alt = img.getAttribute('alt') ?? null;
    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const width = widthAttr && /^\d+$/.test(widthAttr) ? parseInt(widthAttr, 10) : null;
    const height = heightAttr && /^\d+$/.test(heightAttr) ? parseInt(heightAttr, 10) : null;
    const mimeType = (mime.lookup(src.split('?')[0]) || null) as string | null;
    if (!alt) imagesWithoutAlt++;

    assetRows.push({
      asset_key: assetKey,
      storage_path: src,
      alt: alt && alt.trim() ? alt.trim() : null,
      width,
      height,
      mime_type: mimeType,
    });

    imageContentRows.push({
      page_key: pageKey,
      field_key: `image.${seq}.url`,
      value: src,
      value_type: 'url',
    });
    imageContentRows.push({
      page_key: pageKey,
      field_key: `image.${seq}.alt`,
      value: alt ?? '',
      value_type: 'text',
    });
  }

  return { assetRows, imageContentRows, imagesWithoutAlt };
}

async function buildPlan() {
  const rm: RouteMap = JSON.parse(await readFile(ROUTE_MAP_PATH, 'utf8'));
  let allContentRows: ContentRow[] = [];
  const allAssetRows: AssetRow[] = [];
  const perPage: Record<
    string,
    {
      type: string;
      contentRows: number;
      bodyContentRows: number;
      assetRows: number;
      imagesWithoutAlt: number;
      contentRoot: 'xml' | 'sections' | 'main' | 'body' | 'fullHtml-root' | 'none';
    }
  > = {};
  let totalImagesWithoutAlt = 0;

  for (const it of rm.items) {
    const pj: PageJson = JSON.parse(
      await readFile(join(PAGES_DIR, it.scrapeFile), 'utf8'),
    );
    const pageKey = it.key;

    // ---- meta + top-level fields ----
    const topRows: ContentRow[] = [];
    if (pj.title) {
      topRows.push({ page_key: pageKey, field_key: 'meta.title', value: pj.title, value_type: 'text' });
    }
    if (pj.metaDescription) {
      topRows.push({
        page_key: pageKey,
        field_key: 'meta.description',
        value: pj.metaDescription,
        value_type: 'text',
      });
    }
    if (pj.og_image) {
      topRows.push({ page_key: pageKey, field_key: 'meta.og_image', value: pj.og_image, value_type: 'url' });
    }
    if (pj.slug) {
      topRows.push({ page_key: pageKey, field_key: 'slug', value: pj.slug, value_type: 'text' });
    }
    if (pj.excerpt) {
      topRows.push({ page_key: pageKey, field_key: 'excerpt', value: pj.excerpt, value_type: 'text' });
    }
    if (pj.date) {
      topRows.push({ page_key: pageKey, field_key: 'date_published', value: pj.date, value_type: 'date' });
    }

    // ---- content root + body_html + block decomposition + image extraction ----
    let bodyContentRowCount = 0;
    let contentRootKind: 'xml' | 'sections' | 'main' | 'none' = 'none';
    let root: HTMLElement | null = null;
    let bodyHtml = '';

    // 1) Prefer the XML-imported body (set by import-from-xml.ts in Phase E.5).
    if (pj.html && pj.html.length > 0) {
      const cand = parse(pj.html, { lowerCaseTagName: false });
      if (rootHasUsefulContent(cand)) {
        contentRootKind = 'xml';
        bodyHtml = pj.html;
        root = cand;
      }
    }

    // 2) Fall back to the scraper's pre-isolated sections[0].html, but only
    //    if it actually contains real content (not the chrome search widget
    //    that leaks in for empty per-item pages).
    if (!root) {
      const sec = pj.sections?.[0]?.html;
      if (sec && sec.length > 100) {
        const cand = parse(sec, { lowerCaseTagName: false });
        if (rootHasUsefulContent(cand)) {
          contentRootKind = 'sections';
          bodyHtml = sec;
          root = cand;
        }
      }
    }

    // 3) Final fallback: slice <main> out of fullHtml — but only if it has
    //    useful content. We deliberately do NOT fall back to <body>, since
    //    that's just WP chrome (header/footer with wp-content/* asset URLs)
    //    and would pollute body_html with unrewritten URLs.
    if (!root && pj.fullHtml) {
      const full = parse(pj.fullHtml, { lowerCaseTagName: false });
      const main = full.querySelector('main');
      if (main && rootHasUsefulContent(main)) {
        contentRootKind = 'main';
        bodyHtml = main.outerHTML.trim();
        root = main;
      }
    }

    if (bodyHtml) {
      topRows.push({ page_key: pageKey, field_key: 'body_html', value: bodyHtml, value_type: 'html' });
    }

    const blockRows: ContentRow[] = [];
    const assetRows: AssetRow[] = [];
    const imageContentRows: ContentRow[] = [];
    let imagesWithoutAlt = 0;

    if (root) {
      const decomposed = decomposeBlocks(root, pageKey);
      blockRows.push(...decomposed.rows);
      const ex = extractAssets(root, pageKey);
      assetRows.push(...ex.assetRows);
      imageContentRows.push(...ex.imageContentRows);
      imagesWithoutAlt = ex.imagesWithoutAlt;
    }

    bodyContentRowCount = blockRows.length + imageContentRows.length;

    // Aggregate
    allContentRows.push(...topRows, ...blockRows, ...imageContentRows);
    allAssetRows.push(...assetRows);
    perPage[pageKey] = {
      type: it.type,
      contentRows: topRows.length + blockRows.length + imageContentRows.length,
      bodyContentRows: bodyContentRowCount,
      assetRows: assetRows.length,
      imagesWithoutAlt,
      contentRoot: contentRootKind,
    };
    totalImagesWithoutAlt += imagesWithoutAlt;
  }

  // ---- Merge manual seed (canonical strings for forms-only pages, etc.) ----
  // Manual seed wins on conflict: any (page_key, field_key) we emit here
  // displaces a row the extraction may have produced for the same key.
  let manualSeedCount = 0;
  try {
    const manualText = await readFile(MANUAL_SEED_PATH, 'utf8');
    const manual = JSON.parse(manualText) as Record<string, Record<string, string>>;
    const manualKeys = new Set<string>(); // "page_key|field_key"
    const manualRows: ContentRow[] = [];
    for (const [pageKey, fields] of Object.entries(manual)) {
      for (const [fieldKey, value] of Object.entries(fields)) {
        manualKeys.add(`${pageKey}|${fieldKey}`);
        manualRows.push({
          page_key: pageKey,
          field_key: fieldKey,
          value,
          value_type: inferValueTypeFromFieldKey(fieldKey),
        });
      }
    }
    // Drop extracted rows that the manual seed overrides.
    const before = allContentRows.length;
    allContentRows = allContentRows.filter(
      (r) => !manualKeys.has(`${r.page_key}|${r.field_key}`),
    );
    const overridden = before - allContentRows.length;
    allContentRows.push(...manualRows);
    manualSeedCount = manualRows.length;
    if (manualSeedCount > 0) {
      console.log(`  manual-seed merged: +${manualSeedCount} rows (${overridden} extracted overrides)`);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    // No manual seed file — fine, skip.
  }

  // Recompute bodyContentRows from the merged row set so manual-seed h1/p/list
  // rows count toward acceptance. perPage[pageKey].bodyContentRows reflects
  // the post-merge state.
  const bodyCounts = new Map<string, number>();
  for (const r of allContentRows) {
    if (isBodyFieldKey(r.field_key)) {
      bodyCounts.set(r.page_key, (bodyCounts.get(r.page_key) ?? 0) + 1);
    }
  }
  for (const k of Object.keys(perPage)) {
    perPage[k].bodyContentRows = bodyCounts.get(k) ?? 0;
    // contentRows count too (top + body + image refs, post-merge).
    perPage[k].contentRows = allContentRows.filter((r) => r.page_key === k).length;
  }

  // Acceptance: no field_key value should still contain an unrewritten WP URL.
  const leakRe = /ydministries\.ca\/wp-content\//;
  const leakedRows = allContentRows.filter((r) => leakRe.test(r.value));
  // Only non-exempt types must have body content. index_filter/index/home
  // render from child queries or static layout — meta-only is correct for them.
  const zeroBodyPages = Object.entries(perPage)
    .filter(([, v]) => v.bodyContentRows === 0 && !ZERO_BODY_EXEMPT_TYPES.has(v.type))
    .map(([k]) => k);

  // Per-asset missing-alts list — punch list for the admin panel to fix later.
  const missingAlts = allAssetRows
    .filter((a) => !a.alt)
    .map((a) => ({
      page_key: a.asset_key.split('.image.')[0],
      asset_key: a.asset_key,
      storage_path: a.storage_path,
    }));

  return {
    items: rm.items,
    contentRows: allContentRows,
    assetRows: allAssetRows,
    perPage,
    leakedRows,
    zeroBodyPages,
    totalImagesWithoutAlt,
    missingAlts,
  };
}

async function commitPlan(
  contentRows: ContentRow[],
  assetRows: AssetRow[],
) {
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

  // Default: ignoreDuplicates=true so existing edited rows survive.
  // --overwrite flips to false → existing rows get replaced with seed-plan values.
  // Use --overwrite when applying an approved bulk copy pass (e.g. from manual-seed.json).
  console.log(
    `→ Upserting ${contentRows.length} page_content rows… (mode: ${OVERWRITE ? 'OVERWRITE' : 'insert-only'})`,
  );
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < contentRows.length; i += CHUNK) {
    const slice = contentRows.slice(i, i + CHUNK);
    const { error, count } = await sb
      .from('page_content')
      .upsert(slice, {
        onConflict: 'page_key,field_key',
        ignoreDuplicates: !OVERWRITE,
        count: 'exact',
      });
    if (error) {
      console.error('  page_content upsert failed:', error);
      process.exit(1);
    }
    inserted += count ?? 0;
    process.stdout.write(`    ${Math.min(i + CHUNK, contentRows.length)}/${contentRows.length}\n`);
  }
  console.log(`  inserted (new rows only): ${inserted}`);

  console.log(
    `→ Upserting ${assetRows.length} assets rows… (mode: ${OVERWRITE ? 'OVERWRITE' : 'insert-only'})`,
  );
  let assetsInserted = 0;
  for (let i = 0; i < assetRows.length; i += CHUNK) {
    const slice = assetRows.slice(i, i + CHUNK);
    const { error, count } = await sb
      .from('assets')
      .upsert(slice, {
        onConflict: 'asset_key',
        ignoreDuplicates: !OVERWRITE,
        count: 'exact',
      });
    if (error) {
      console.error('  assets upsert failed:', error);
      process.exit(1);
    }
    assetsInserted += count ?? 0;
  }
  console.log(`  inserted (new rows only): ${assetsInserted}`);

  // ---- Post-commit verification ----
  console.log('\n→ Verifying via Supabase…');
  const { count: pcTotal, error: e1 } = await sb
    .from('page_content')
    .select('*', { count: 'exact', head: true });
  if (e1) {
    console.error('  count(page_content) failed:', e1);
    process.exit(1);
  }
  const { count: assetsTotal, error: e2 } = await sb
    .from('assets')
    .select('*', { count: 'exact', head: true });
  if (e2) {
    console.error('  count(assets) failed:', e2);
    process.exit(1);
  }
  // Per-page counts: select all page_key values, group locally.
  // Supabase REST caps default at 1000 rows; explicit range covers up to 10k.
  const { data: pkRows, error: e3 } = await sb
    .from('page_content')
    .select('page_key')
    .range(0, 9999);
  if (e3) {
    console.error('  select(page_key) failed:', e3);
    process.exit(1);
  }
  const counts = new Map<string, number>();
  for (const r of pkRows ?? []) {
    counts.set(r.page_key, (counts.get(r.page_key) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  console.log(`\n  select count(*) from page_content;  → ${pcTotal}`);
  console.log(`  select count(*) from assets;        → ${assetsTotal}`);
  console.log('\n  select page_key, count(*) from page_content group by page_key order by rows desc limit 15;');
  console.log('  ' + 'page_key'.padEnd(60) + 'rows');
  console.log('  ' + '-'.repeat(64));
  for (const [k, v] of sorted.slice(0, 15)) {
    console.log('  ' + k.padEnd(60) + String(v).padStart(4));
  }
  return {
    contentInserted: inserted,
    contentSkipped: contentRows.length - inserted,
    assetsInserted,
    assetsSkipped: assetRows.length - assetsInserted,
    pcTotal,
    assetsTotal,
  };
}

async function main() {
  console.log(`→ Building plan from route-map.json …`);
  const plan = await buildPlan();

  if (DRY_RUN) {
    const planOut = {
      generatedAt: new Date().toISOString(),
      summary: {
        items: plan.items.length,
        contentRows: plan.contentRows.length,
        assetRows: plan.assetRows.length,
        zeroBodyPages: plan.zeroBodyPages,
        leakedCount: plan.leakedRows.length,
        leakedSamples: plan.leakedRows.slice(0, 5).map((r) => ({
          page_key: r.page_key,
          field_key: r.field_key,
          snippet: r.value.slice(0, 200),
        })),
        totalImagesWithoutAlt: plan.totalImagesWithoutAlt,
      },
      perPage: plan.perPage,
      contentRows: plan.contentRows,
      assetRows: plan.assetRows,
    };
    await writeFile(PLAN_PATH, JSON.stringify(planOut, null, 2) + '\n');
    await writeFile(
      MISSING_ALTS_PATH,
      JSON.stringify(
        { generatedAt: new Date().toISOString(), count: plan.missingAlts.length, items: plan.missingAlts },
        null,
        2,
      ) + '\n',
    );

    console.log('\n=== Plan Summary ===');
    console.log(`  routed items:        ${plan.items.length}`);
    console.log(`  page_content rows:   ${plan.contentRows.length}`);
    console.log(`  assets rows:         ${plan.assetRows.length}`);
    console.log(`  zero-body non-exempt pages (must be 0): ${plan.zeroBodyPages.length}`);
    if (plan.zeroBodyPages.length) {
      for (const k of plan.zeroBodyPages) console.log(`    - ${k}`);
    }
    console.log(`  wp-content URL leaks (must be 0):    ${plan.leakedRows.length}`);
    if (plan.leakedRows.length) {
      for (const r of plan.leakedRows.slice(0, 5)) {
        console.log(`    - ${r.page_key} / ${r.field_key}: ${r.value.slice(0, 120)}…`);
      }
    }
    console.log(`  images without alt (warn):           ${plan.totalImagesWithoutAlt}`);
    console.log(`\n  plan written:         ${PLAN_PATH}`);
    console.log(`  missing-alts written: ${MISSING_ALTS_PATH}`);

    if (plan.zeroBodyPages.length || plan.leakedRows.length) {
      process.exitCode = 2; // signal failure but let plan be inspected
    }
    return;
  }

  if (COMMIT) {
    if (plan.zeroBodyPages.length || plan.leakedRows.length) {
      console.error('Refusing to commit — acceptance checks failed:');
      console.error(`  zeroBodyPages=${plan.zeroBodyPages.length}, leakedRows=${plan.leakedRows.length}`);
      process.exit(1);
    }
    const result = await commitPlan(plan.contentRows, plan.assetRows);
    console.log('\n=== Commit Final Report ===');
    console.log(`  page_content rows in plan:     ${plan.contentRows.length}`);
    console.log(`  page_content rows inserted:    ${result.contentInserted}`);
    console.log(`  page_content rows skipped (ON CONFLICT): ${result.contentSkipped}`);
    console.log(`  assets rows in plan:           ${plan.assetRows.length}`);
    console.log(`  assets rows inserted:          ${result.assetsInserted}`);
    console.log(`  assets rows skipped:           ${result.assetsSkipped}`);
    console.log(`  page_content total in DB now:  ${result.pcTotal}`);
    console.log(`  assets total in DB now:        ${result.assetsTotal}`);
    console.log('\n✓ Commit complete');
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
