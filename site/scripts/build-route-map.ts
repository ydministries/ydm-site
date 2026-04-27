import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(SITE_DIR, '..');

const PAGES_DIR = join(REPO_DIR, 'archive/wordpress/scrape/pages-rewritten');
const ROUTE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/route-map.json');
const SITE_MAP_PATH = join(REPO_DIR, 'archive/wordpress/scrape/site-map.json');

type RouteItem = {
  oldPath: string;
  oldSlug: string;
  newPath: string;
  type: string;
  key: string;
  scrapeFile: string;
  aliases: string[]; // alternative oldPaths that map to the same canonical
};

type Dropped = { oldPath: string; scrapeFile: string; reason: string };
type Collision = { newPath: string; candidates: { oldPath: string; scrapeFile: string }[] };

type ClassifyOk = { kind: 'route'; newPath: string; type: string; key: string };
type ClassifyDrop = { kind: 'drop'; reason: string };
type ClassifyReview = { kind: 'review' };
type Classification = ClassifyOk | ClassifyDrop | ClassifyReview;

// Old paths that share the same canonical content. The Phase D spec calls
// out about-us + aboutydm explicitly. We register the pair here so the
// collision detector treats them as aliases instead of true collisions.
const KNOWN_ALIAS_NEW_PATHS = new Set<string>(['/about']);

function pathFromUrl(rawUrl: string, slug: string): string {
  // Some scrape entries have malformed URLs like "https://ydministries.ca#comment-29".
  // Trust the slug as a fallback: if slug is the literal "home", treat path as "/".
  let pathname = '';
  try {
    const u = new URL(rawUrl);
    pathname = u.pathname || '/';
  } catch {
    pathname = '/';
  }
  if (!pathname || pathname === '' || pathname === '/') {
    if (slug === 'home') return '/';
    return '/';
  }
  // Normalize to trailing slash for directory-style WP routes.
  if (!pathname.endsWith('/')) pathname += '/';
  return pathname;
}

function classify(oldPath: string, slug: string): Classification {
  // Media stubs: scrape ingested attachments as pages. Their URL field has
  // already been rewritten to media.ydministries.ca/* (Phase C), but the slug
  // still begins with "wp-content/uploads/" — that's the stable detector.
  if (slug.startsWith('wp-content/')) {
    return { kind: 'drop', reason: 'media stub (wp-content/uploads attachment, not a page)' };
  }

  // Theme demo variants — unused per spec.
  if (oldPath === '/home-two/' || oldPath === '/home-three/') {
    return { kind: 'drop', reason: 'theme demo variant — not migrated' };
  }

  // ---- Static (exact-path) routes — must run BEFORE the blog catch-all ----
  const staticRoutes: Record<string, ClassifyOk> = {
    '/':                { kind: 'route', newPath: '/',                                 type: 'home',  key: 'home' },
    '/about-us/':       { kind: 'route', newPath: '/about',                            type: 'page',  key: 'about' },
    '/aboutydm/':       { kind: 'route', newPath: '/about',                            type: 'page',  key: 'about' },
    '/huel-clementina/':{ kind: 'route', newPath: '/team/huel-and-clementina-wilson',  type: 'team',  key: 'team.huel_clementina' },
    '/huelwilsonbio/':  { kind: 'route', newPath: '/team/bishop-huel-wilson',          type: 'team',  key: 'team.huel_wilson' },
    '/our-team/':       { kind: 'route', newPath: '/team',                             type: 'index', key: 'team.index' },
    '/our-ministries/': { kind: 'route', newPath: '/ministries',                       type: 'index', key: 'ministries.index' },
    '/latest-sermons/': { kind: 'route', newPath: '/sermons',                          type: 'index', key: 'sermons.index' },
    '/events-page/':    { kind: 'route', newPath: '/events',                           type: 'index', key: 'events.index' },
    '/our-campaigns/':  { kind: 'route', newPath: '/give',                             type: 'index', key: 'give.index' },
    '/blog-page/':      { kind: 'route', newPath: '/blog',                             type: 'index', key: 'blog.index' },
    '/gallery/':        { kind: 'route', newPath: '/gallery',                          type: 'page',  key: 'gallery' },
    '/live/':           { kind: 'route', newPath: '/live',                             type: 'page',  key: 'live' },
    '/contact/':        { kind: 'route', newPath: '/contact',                          type: 'page',  key: 'contact' },
    '/ask/':            { kind: 'route', newPath: '/ask',                              type: 'page',  key: 'ask' },
    '/prayer-requests/':{ kind: 'route', newPath: '/prayer',                           type: 'page',  key: 'prayer' },
    '/guestbook/':      { kind: 'route', newPath: '/guestbook',                        type: 'page',  key: 'guestbook' },
    '/maltoncog/':      { kind: 'route', newPath: '/locations/maltoncog',              type: 'location', key: 'locations.maltoncog' },
    '/westtoronto/':    { kind: 'route', newPath: '/locations/westtoronto',            type: 'location', key: 'locations.westtoronto' },
  };
  if (staticRoutes[oldPath]) return staticRoutes[oldPath];

  // ---- Pattern routes ----
  // Order matters: more specific (cmsms_profile_category) before less specific (cmsms_profile).
  const patterns: Array<[RegExp, (m: RegExpMatchArray) => ClassifyOk]> = [
    [/^\/cmsms_profile_category\/([^/]+)\/$/, (m) => ({ kind: 'route', newPath: `/team?category=${m[1]}`, type: 'index_filter', key: `team.cat.${m[1]}` })],
    [/^\/cmsms_profile\/([^/]+)\/$/,          (m) => ({ kind: 'route', newPath: `/team/${m[1]}`,         type: 'team',          key: `team.${m[1]}` })],
    [/^\/ministries\/([^/]+)\/$/,             (m) => ({ kind: 'route', newPath: `/ministries/${m[1]}`,    type: 'ministry',      key: `ministries.${m[1]}` })],
    [/^\/sermon\/([^/]+)\/$/,                 (m) => ({ kind: 'route', newPath: `/sermons/${m[1]}`,       type: 'sermon',        key: `sermons.${m[1]}` })],
    [/^\/sermons-category\/([^/]+)\/$/,       (m) => ({ kind: 'route', newPath: `/sermons?category=${m[1]}`, type: 'index_filter', key: `sermons.cat.${m[1]}` })],
    [/^\/event\/([^/]+)\/$/,                  (m) => ({ kind: 'route', newPath: `/events/${m[1]}`,        type: 'event',         key: `events.${m[1]}` })],
    // Both the slash form (/events/category/<slug>/) seen in the scrape and
    // the underscore form (/events_category/<slug>/) named in the spec
    // resolve to the same destination.
    [/^\/events\/category\/([^/]+)\/$/,       (m) => ({ kind: 'route', newPath: `/events?category=${m[1]}`, type: 'index_filter', key: `events.cat.${m[1]}` })],
    [/^\/events_category\/([^/]+)\/$/,        (m) => ({ kind: 'route', newPath: `/events?category=${m[1]}`, type: 'index_filter', key: `events.cat.${m[1]}` })],
    [/^\/campaigns\/([^/]+)\/$/,              (m) => ({ kind: 'route', newPath: `/give/${m[1]}`,           type: 'campaign',      key: `give.${m[1]}` })],
    [/^\/category\/([^/]+)\/$/,               (m) => ({ kind: 'route', newPath: `/blog?category=${m[1]}`,  type: 'index_filter',  key: `blog.cat.${m[1]}` })],
    [/^\/tag\/([^/]+)\/$/,                    (m) => ({ kind: 'route', newPath: `/blog?tag=${m[1]}`,       type: 'index_filter',  key: `blog.tag.${m[1]}` })],
    [/^\/author\/([^/]+)\/$/,                 (m) => ({ kind: 'route', newPath: `/blog?author=${m[1]}`,    type: 'index_filter',  key: `blog.author.${m[1]}` })],
  ];
  for (const [re, fn] of patterns) {
    const m = oldPath.match(re);
    if (m) return fn(m);
  }

  // ---- Catch-all: single-segment root path → blog post ----
  const m = oldPath.match(/^\/([^/]+)\/$/);
  if (m) {
    const slugPart = m[1];
    return { kind: 'route', newPath: `/blog/${slugPart}`, type: 'blog', key: `blog.${slugPart}` };
  }

  return { kind: 'review' };
}

async function fileSize(p: string): Promise<number> {
  const s = await stat(p);
  return s.size;
}

async function main() {
  console.log('→ Walking pages-rewritten/');
  const entries = await readdir(PAGES_DIR);
  const files = entries.filter((f) => f.endsWith('.json')).sort();
  console.log(`  ${files.length} files`);

  type Raw = {
    scrapeFile: string;
    oldPath: string;
    oldSlug: string;
    rawUrl: string;
    classification: Classification;
    fileBytes: number;
  };
  const rawItems: Raw[] = [];
  const dropped: Dropped[] = [];
  const needsReview: { oldPath: string; rawUrl: string; scrapeFile: string }[] = [];

  for (const f of files) {
    const full = join(PAGES_DIR, f);
    const json = JSON.parse(await readFile(full, 'utf8'));
    const rawUrl: string = json.url ?? '';
    const oldSlug: string = json.slug ?? '';
    const oldPath = pathFromUrl(rawUrl, oldSlug);
    const fileBytes = await fileSize(full);
    const c = classify(oldPath, oldSlug);
    if (c.kind === 'drop') {
      dropped.push({ oldPath, scrapeFile: f, reason: c.reason });
      continue;
    }
    if (c.kind === 'review') {
      needsReview.push({ oldPath, rawUrl, scrapeFile: f });
      continue;
    }
    rawItems.push({ scrapeFile: f, oldPath, oldSlug, rawUrl, classification: c, fileBytes });
  }

  // ---- Collision / alias detection ----
  // Group by newPath. >1 item = either a known alias group or a collision.
  const byNewPath = new Map<string, Raw[]>();
  for (const it of rawItems) {
    const np = (it.classification as ClassifyOk).newPath;
    if (!byNewPath.has(np)) byNewPath.set(np, []);
    byNewPath.get(np)!.push(it);
  }

  const items: RouteItem[] = [];
  const collisions: Collision[] = [];

  for (const [newPath, group] of byNewPath) {
    if (group.length === 1) {
      const g = group[0];
      const c = g.classification as ClassifyOk;
      items.push({
        oldPath: g.oldPath,
        oldSlug: g.oldSlug,
        newPath: c.newPath,
        type: c.type,
        key: c.key,
        scrapeFile: g.scrapeFile,
        aliases: [],
      });
      continue;
    }

    if (KNOWN_ALIAS_NEW_PATHS.has(newPath)) {
      // Pick canonical = largest scrape file (richer content).
      const sorted = [...group].sort((a, b) => b.fileBytes - a.fileBytes);
      const canonical = sorted[0];
      const aliases = sorted.slice(1).map((x) => x.oldPath);
      const c = canonical.classification as ClassifyOk;
      items.push({
        oldPath: canonical.oldPath,
        oldSlug: canonical.oldSlug,
        newPath: c.newPath,
        type: c.type,
        key: c.key,
        scrapeFile: canonical.scrapeFile,
        aliases,
      });
      continue;
    }

    collisions.push({
      newPath,
      candidates: group.map((g) => ({ oldPath: g.oldPath, scrapeFile: g.scrapeFile })),
    });
  }

  items.sort((a, b) => a.newPath.localeCompare(b.newPath));

  // ---- Build site-map.json (flat 301 redirects) ----
  type Redirect = { source: string; destination: string; permanent: true };
  const redirects: Redirect[] = [];
  for (const it of items) {
    if (it.oldPath !== it.newPath) {
      redirects.push({ source: it.oldPath, destination: it.newPath, permanent: true });
    }
    for (const alias of it.aliases) {
      if (alias !== it.newPath) {
        redirects.push({ source: alias, destination: it.newPath, permanent: true });
      }
    }
  }
  // Stable order: by source.
  redirects.sort((a, b) => a.source.localeCompare(b.source));

  // ---- Emit ----
  const routeMap = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
    dropped,
    collisions,
    needs_review: needsReview,
  };
  await writeFile(ROUTE_MAP_PATH, JSON.stringify(routeMap, null, 2) + '\n');
  await writeFile(SITE_MAP_PATH, JSON.stringify(redirects, null, 2) + '\n');

  console.log('\n=== Summary ===');
  console.log(`  routed items:   ${items.length}`);
  console.log(`  dropped:        ${dropped.length}`);
  console.log(`  collisions:     ${collisions.length}`);
  console.log(`  needs_review:   ${needsReview.length}`);
  console.log(`  redirects:      ${redirects.length}`);
  console.log(`\n  route-map.json: ${ROUTE_MAP_PATH}`);
  console.log(`  site-map.json:  ${SITE_MAP_PATH}`);

  if (collisions.length) {
    console.log('\n=== Collisions ===');
    for (const c of collisions) {
      console.log(`  ${c.newPath}`);
      for (const cand of c.candidates) console.log(`    - ${cand.oldPath}  (${cand.scrapeFile})`);
    }
  }

  if (needsReview.length) {
    console.error('\n✗ ACCEPTANCE FAILED — needs_review is non-empty:');
    for (const r of needsReview) console.error(`  ${r.oldPath}  (${r.scrapeFile})  raw=${r.rawUrl}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
