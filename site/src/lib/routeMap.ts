import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface RouteMapItem {
  oldPath: string;
  oldSlug: string;
  newPath: string;
  type: string;
  key: string;
  scrapeFile: string;
  aliases: string[];
}

interface RouteMap {
  generatedAt?: string;
  count?: number;
  items: RouteMapItem[];
}

const CANDIDATE_PATHS = [
  // Dev / local: cwd is site/, archive sits one level up.
  join(process.cwd(), "..", "archive", "wordpress", "scrape", "route-map.json"),
  // Vercel build root === repo root.
  join(process.cwd(), "archive", "wordpress", "scrape", "route-map.json"),
];

function loadRouteMap(): RouteMap {
  for (const p of CANDIDATE_PATHS) {
    try {
      const raw = readFileSync(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // Try the next candidate.
    }
  }
  console.warn(
    "[routeMap] route-map.json not found — admin links + revalidation will degrade gracefully",
  );
  return { items: [] };
}

const ROUTE_MAP = loadRouteMap();

const BY_KEY = new Map<string, RouteMapItem>();
for (const item of ROUTE_MAP.items) BY_KEY.set(item.key, item);

export function getRouteForPageKey(pageKey: string): RouteMapItem | null {
  return BY_KEY.get(pageKey) ?? null;
}

export function listRoutes(): RouteMapItem[] {
  return ROUTE_MAP.items;
}

/**
 * Strip query strings — `revalidatePath` only takes route segments, not full
 * URLs. e.g. `/blog?author=x` → `/blog`.
 */
export function publicRouteForPageKey(pageKey: string): string | null {
  const item = BY_KEY.get(pageKey);
  if (!item) return null;
  const q = item.newPath.indexOf("?");
  return q === -1 ? item.newPath : item.newPath.slice(0, q);
}
