import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { loadRewriteMaps, rewriteString, type RewriteCounters } from './lib/rewrite-urls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

const XML_PATH = join(REPO_DIR, 'archive/wordpress/exports/wordpress-export.xml');
const ROUTE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/route-map.json');
const PAGES_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages-rewritten');
const MANIFEST_PATH = join(REPO_DIR, 'archive/wordpress/scrape/media-manifest.json');
const REPORT_PATH = join(REPO_DIR, 'archive/wordpress/scrape/xml-import-report.json');

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

type WpItem = {
  postType: string;
  postName: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  date: string;
  status: string;
};

const REQUIRED_BODY_TYPES = new Set(['team', 'sermon', 'ministry', 'event', 'campaign', 'blog', 'page', 'location']);
const MIN_BODY_CHARS = 500;
// Don't inject XML body when it's effectively empty — would clobber a richer
// scraped sections[0].html. (Some Elementor pages put their content in
// postmeta rather than content:encoded, so the XML body is just a stub.)
const MIN_INJECT_CHARS = 200;

// route-map type → expected WP post_type. team profiles often live as plain
// pages (e.g. /huelwilsonbio/) rather than cmsms_profile, so we keep the
// matcher tolerant: for "team" we'll try cmsms_profile first, then page.
const TYPE_TO_WP: Record<string, string[]> = {
  team: ['cmsms_profile', 'page'],
  sermon: ['sermon'],
  ministry: ['ministries'],
  event: ['tribe_events'],
  campaign: ['campaigns'],
  blog: ['post'],
  page: ['page'],
  location: ['page'],
  home: ['page'],
  index: ['page'],
};

function parseXml(xml: string): WpItem[] {
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    cdataPropName: '__cdata',
    isArray: (name) => name === 'item' || name === 'wp:postmeta',
  });
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel;
  if (!channel) throw new Error('Invalid XML: missing rss.channel');
  const items = (channel.item ?? []) as Array<Record<string, unknown>>;
  const out: WpItem[] = [];

  const cdataOrText = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && '__cdata' in (v as Record<string, unknown>)) {
      const c = (v as Record<string, unknown>).__cdata;
      return typeof c === 'string' ? c : '';
    }
    return '';
  };

  for (const it of items) {
    const status = cdataOrText(it['wp:status']);
    if (status !== 'publish') continue;
    const postType = cdataOrText(it['wp:post_type']);
    if (!postType) continue;
    const postName = cdataOrText(it['wp:post_name']);
    const title = cdataOrText(it['title']);
    const bodyHtml = cdataOrText(it['content:encoded']);
    const excerpt = cdataOrText(it['excerpt:encoded']);
    const date = cdataOrText(it['wp:post_date_gmt']);
    out.push({ postType, postName, title, bodyHtml, excerpt, date, status });
  }
  return out;
}

function buildIndex(items: WpItem[]) {
  const byTypeSlug = new Map<string, WpItem>();
  const bySlug = new Map<string, WpItem[]>();
  for (const it of items) {
    if (!it.postName) continue;
    byTypeSlug.set(`${it.postType}/${it.postName}`, it);
    if (!bySlug.has(it.postName)) bySlug.set(it.postName, []);
    bySlug.get(it.postName)!.push(it);
  }
  return { byTypeSlug, bySlug };
}

function parseScrapeFileForSlug(scrapeFile: string, type: string): { postType: string | null; slug: string } {
  const f = scrapeFile.replace(/\.json$/, '');
  // Underscore-prefixed forms produced by the scraper for non-page post types.
  const prefixMap: Record<string, string> = {
    sermon_: 'sermon',
    event_: 'tribe_events',
    campaigns_: 'campaigns',
    ministries_: 'ministries',
    cmsms_profile_: 'cmsms_profile',
  };
  for (const [px, pt] of Object.entries(prefixMap)) {
    if (f.startsWith(px)) {
      return { postType: pt, slug: f.slice(px.length) };
    }
  }
  // Plain page or blog post: scrapeFile basename is the slug.
  return { postType: null, slug: f };
}

function matchToWp(
  item: RouteItem,
  index: ReturnType<typeof buildIndex>,
): { wp: WpItem | null; reason: string } {
  const { postType: prefixPt, slug } = parseScrapeFileForSlug(item.scrapeFile, item.type);
  // 1) Strongest signal: scrapeFile prefix tells us the post_type.
  if (prefixPt) {
    const hit = index.byTypeSlug.get(`${prefixPt}/${slug}`);
    if (hit) return { wp: hit, reason: `prefix-match ${prefixPt}/${slug}` };
  }
  // 2) Next: try each post_type the route-map type maps to.
  const candidates = TYPE_TO_WP[item.type] ?? ['page'];
  for (const pt of candidates) {
    const hit = index.byTypeSlug.get(`${pt}/${slug}`);
    if (hit) return { wp: hit, reason: `type-match ${pt}/${slug}` };
  }
  // 3) Fallback: any post_type with that slug.
  const slugMatches = index.bySlug.get(slug) ?? [];
  if (slugMatches.length === 1) return { wp: slugMatches[0], reason: `slug-only ${slug} (${slugMatches[0].postType})` };
  if (slugMatches.length > 1) {
    return { wp: null, reason: `ambiguous slug "${slug}" — multiple post_types: ${slugMatches.map((m) => m.postType).join(', ')}` };
  }
  return { wp: null, reason: `no XML <item> with slug "${slug}"` };
}

async function main() {
  console.log('→ Loading manifest + route-map + XML…');
  const [maps, rm, xml] = await Promise.all([
    loadRewriteMaps(MANIFEST_PATH),
    readFile(ROUTE_MAP_PATH, 'utf8').then((s) => JSON.parse(s) as RouteMap),
    readFile(XML_PATH, 'utf8'),
  ]);
  const xmlItems = parseXml(xml);
  console.log(`  XML published items: ${xmlItems.length}`);
  console.log(`  route-map items: ${rm.items.length}`);

  const idx = buildIndex(xmlItems);

  const counters: RewriteCounters = { replacements: 0, unmatched: new Set() };
  const unmatched: { key: string; scrapeFile: string; reason: string }[] = [];
  let matched = 0;
  let filesUpdated = 0;
  const acceptanceFailures: { key: string; type: string; bodyChars: number }[] = [];

  for (const it of rm.items) {
    const { wp, reason } = matchToWp(it, idx);
    if (!wp) {
      // For required types, missing is a problem; for index/index_filter/home it's expected.
      if (REQUIRED_BODY_TYPES.has(it.type)) {
        unmatched.push({ key: it.key, scrapeFile: it.scrapeFile, reason });
      }
      continue;
    }
    matched++;

    const filePath = join(PAGES_DIR, it.scrapeFile);
    const pageJson = JSON.parse(await readFile(filePath, 'utf8')) as Record<string, unknown>;

    const rewrittenBody = rewriteString(wp.bodyHtml, maps, counters);
    let didInject = false;
    if (rewrittenBody.trim().length >= MIN_INJECT_CHARS) {
      pageJson.html = rewrittenBody;
      didInject = true;
    }
    if (!pageJson.excerpt && wp.excerpt) pageJson.excerpt = rewriteString(wp.excerpt, maps, counters);
    if (!pageJson.date && wp.date) pageJson.date = wp.date;
    // Don't overwrite scrape's title/slug.

    if (didInject) {
      await writeFile(filePath, JSON.stringify(pageJson, null, 2) + '\n');
      filesUpdated++;
    } else if (!pageJson.excerpt && !pageJson.date) {
      // Nothing changed — skip the write entirely.
    } else {
      await writeFile(filePath, JSON.stringify(pageJson, null, 2) + '\n');
    }

    if (REQUIRED_BODY_TYPES.has(it.type)) {
      // Use whichever body the seeder will actually pick: prefer injected XML,
      // else fall back to sections[0].html size.
      const sec0 = ((pageJson.sections as Array<{ html?: string }> | undefined)?.[0]?.html ?? '').trim();
      const effectiveBody = didInject ? rewrittenBody : sec0;
      const bodyChars = effectiveBody.trim().length;
      if (bodyChars < MIN_BODY_CHARS) {
        acceptanceFailures.push({ key: it.key, type: it.type, bodyChars });
      }
    }
  }

  // Acceptance: every required-type item must end with body > MIN_BODY_CHARS.
  // Items that didn't match XML at all also fail unless type is index/index_filter/home.
  for (const u of unmatched) {
    const it = rm.items.find((x) => x.key === u.key)!;
    acceptanceFailures.push({ key: u.key, type: it.type, bodyChars: 0 });
  }
  // Dedupe by key
  const seenAccept = new Set<string>();
  const acceptanceFailuresUnique = acceptanceFailures.filter((f) =>
    seenAccept.has(f.key) ? false : (seenAccept.add(f.key), true),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    xmlItemsParsed: xmlItems.length,
    routeMapItems: rm.items.length,
    matched,
    unmatched,
    filesUpdated,
    rewritesApplied: counters.replacements,
    wpContentLeaks: counters.unmatched.size,
    unmatchedRewriteUrls: [...counters.unmatched].slice(0, 20),
    acceptanceFailures: acceptanceFailuresUnique,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  console.log('\n=== Import Summary ===');
  console.log(`  XML items parsed:    ${report.xmlItemsParsed}`);
  console.log(`  route-map items:     ${report.routeMapItems}`);
  console.log(`  matched:             ${report.matched}`);
  console.log(`  unmatched (required types): ${report.unmatched.length}`);
  console.log(`  files updated:       ${report.filesUpdated}`);
  console.log(`  url rewrites applied: ${report.rewritesApplied}`);
  console.log(`  wp-content leaks:    ${report.wpContentLeaks}`);
  if (report.unmatched.length) {
    console.log('\n=== Unmatched (required body) ===');
    for (const u of report.unmatched) console.log(`  ${u.key}  (${u.scrapeFile}) — ${u.reason}`);
  }
  if (report.acceptanceFailures.length) {
    console.log('\n=== Acceptance failures (body < 500 chars on required type) ===');
    for (const f of report.acceptanceFailures) console.log(`  ${f.key}  type=${f.type}  bodyChars=${f.bodyChars}`);
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
