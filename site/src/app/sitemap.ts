import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { listProducts, slugifyName } from "@/lib/printful";

// Re-fetch dynamic /shop/[slug] entries from Printful every hour. Static
// entries don't need revalidation — adding a public page already requires
// a deploy, so cold-start regeneration is fine.
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

interface RouteEntry {
  path: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
}

// Authoritative list of public, non-redirected routes.
// Update whenever you add a page.tsx under src/app/(site)/. The drift check
// below this list will warn at build/dev time if you forget.
//
// Deliberately omitted (search engines should index the canonical destination,
// not the redirect source):
//   /guestbook                          308 → /testimonials              (next.config.ts Phase JJ)
//   /team/bishopwilson                  308 → /team/bishop-huel-wilson   (codegen redirectKeys + site-map.json)
//   /team/huel-and-clementina-wilson    308 → /team/bishop-huel-wilson   (next.config.ts Phase CC)
//
// Dynamic /shop/[slug] is expanded from Printful's catalog at request time
// (see end of this file).
const STATIC_ROUTES: RouteEntry[] = [
  // ── Home ───────────────────────────────────────────────────────────────
  { path: "/",                    priority: 1.0, changeFrequency: "weekly" },

  // ── Top-level hubs (fresh content, weekly) ─────────────────────────────
  { path: "/sermons",             priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog",                priority: 0.9, changeFrequency: "weekly" },
  { path: "/events",              priority: 0.9, changeFrequency: "weekly" },
  { path: "/shop",                priority: 0.9, changeFrequency: "weekly" },
  { path: "/testimonials",        priority: 0.9, changeFrequency: "weekly" },
  { path: "/gallery",             priority: 0.8, changeFrequency: "weekly" },

  // ── Top-level hubs (stable, monthly) ───────────────────────────────────
  { path: "/about",               priority: 0.9, changeFrequency: "monthly" },
  { path: "/ministries",          priority: 0.9, changeFrequency: "monthly" },
  { path: "/team",                priority: 0.9, changeFrequency: "monthly" },
  { path: "/give",                priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact",             priority: 0.9, changeFrequency: "monthly" },
  { path: "/live",                priority: 0.8, changeFrequency: "weekly" },
  { path: "/ask",                 priority: 0.7, changeFrequency: "monthly" },
  { path: "/prayer",              priority: 0.7, changeFrequency: "monthly" },

  // ── Derived views ──────────────────────────────────────────────────────
  { path: "/sermons/scripture",   priority: 0.7, changeFrequency: "weekly" },

  // ── Locations ──────────────────────────────────────────────────────────
  { path: "/locations/maltoncog",       priority: 0.7, changeFrequency: "monthly" },
  { path: "/locations/westtoronto",     priority: 0.7, changeFrequency: "monthly" },

  // ── Ministries (7) ─────────────────────────────────────────────────────
  { path: "/ministries/ask-bishop",     priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/family",         priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/leadership",     priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/outreach",       priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/partnership",    priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/wordwide",       priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries/worship",        priority: 0.7, changeFrequency: "monthly" },

  // ── Team (2 canonical; /team/bishopwilson and /team/huel-and-clementina-wilson redirect out) ──
  { path: "/team/bishop-huel-wilson",         priority: 0.7, changeFrequency: "monthly" },
  { path: "/team/clementinawilson",           priority: 0.7, changeFrequency: "monthly" },

  // ── Sermons (6) ────────────────────────────────────────────────────────
  { path: "/sermons/gilgal-the-place-of-new-beginnings",        priority: 0.7, changeFrequency: "monthly" },
  { path: "/sermons/here-am-i-send-me-a-vision-for-mission",    priority: 0.7, changeFrequency: "monthly" },
  { path: "/sermons/jesus-is-coming-soon-signs-prophecy-hope",  priority: 0.7, changeFrequency: "monthly" },
  { path: "/sermons/jesus-the-ultimate-transformational-leader", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sermons/repent-the-kingdom-of-god-is-at-hand",      priority: 0.7, changeFrequency: "monthly" },
  { path: "/sermons/the-heritage-of-a-godly-mother",            priority: 0.7, changeFrequency: "monthly" },

  // ── Blog (9) ───────────────────────────────────────────────────────────
  { path: "/blog/discovering-the-power-of-waiting",                                priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/experiencing-the-freedom-of-gods-presence",                       priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/four-things-our-church-should-still-focus-on",                    priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/how-do-i-intercede-for-family-who-dont-believe-in-jesus",         priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/how-to-develop-a-habit-of-worship",                               priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/i-ruined-my-lifeis-there-hope-for-me",                            priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/whats-your-view-of-marriage",                                     priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/your-mission-should-you-choose-to-accept-it",                     priority: 0.7, changeFrequency: "monthly" },

  // ── Events (2) ─────────────────────────────────────────────────────────
  { path: "/events/weekly-bible-study-group",  priority: 0.7, changeFrequency: "weekly" },
  { path: "/events/young-adults-connect",      priority: 0.7, changeFrequency: "weekly" },

  // ── Give (3 secondary) ─────────────────────────────────────────────────
  { path: "/give/supportydm",     priority: 0.7, changeFrequency: "monthly" },
  { path: "/give/techfund",       priority: 0.7, changeFrequency: "monthly" },

  // ── Conversion / dead-end pages (low priority, infrequent change) ──────
  { path: "/give/thanks",         priority: 0.5, changeFrequency: "yearly" },
  { path: "/shop/success",        priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Expand /shop/[slug] from Printful. Best-effort: if the API is down or
  // PRINTFUL_API_KEY is unset, ship the sitemap with all static routes and
  // skip products — better than 500ing the sitemap.
  let shopProductRoutes: RouteEntry[] = [];
  try {
    const products = await listProducts();
    shopProductRoutes = products.map((p) => ({
      path: `/shop/${slugifyName(p.name)}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch (err) {
    console.warn("[sitemap] Printful enumeration failed; shop products excluded:", err);
  }

  return [...STATIC_ROUTES, ...shopProductRoutes].map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency ?? "monthly",
    priority: r.priority ?? 0.6,
  }));
}

// ── Drift check ────────────────────────────────────────────────────────
// Warn at build/dev time if a page.tsx exists for a route not in
// STATIC_ROUTES. Silently fails on Vercel's production runtime where the
// source tree isn't bundled into the function output.
function _walkRoutes(dir: string, base = ""): string[] {
  try {
    return readdirSync(dir).flatMap((e) => {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) {
        const seg = e.startsWith("(") && e.endsWith(")") ? "" : e;
        return _walkRoutes(full, seg ? `${base}/${seg}` : base);
      }
      return e === "page.tsx" ? [base || "/"] : [];
    });
  } catch { return []; }
}
const _known = new Set([...STATIC_ROUTES.map((r) => r.path), "/shop/[slug]", "/guestbook", "/team/bishopwilson", "/team/huel-and-clementina-wilson"]);
const _missing = _walkRoutes(join(process.cwd(), "src/app/(site)")).filter((p) => !_known.has(p));
if (_missing.length) console.warn(`[sitemap drift] page.tsx not in STATIC_ROUTES:\n  ${_missing.join("\n  ")}`);
