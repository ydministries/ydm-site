import { createServerClient } from "./supabase";

export interface RelatedPerson {
  slug: string;
  name: string;
  title: string;
  portrait: string;
}

/**
 * route-map maps page_keys → newPaths. We hard-code the mapping here so the
 * client-side cards link to the right URLs (without re-reading route-map).
 */
const TEAM_KEY_TO_SLUG: Record<string, string> = {
  "team.huel_wilson":      "bishop-huel-wilson",
  "team.clementinawilson": "clementinawilson",
  "team.huel_clementina":  "huel-and-clementina-wilson",
};

// Reverse: URL slug → page_key.
export function teamSlugToPageKey(slug: string): string | null {
  for (const [k, s] of Object.entries(TEAM_KEY_TO_SLUG)) if (s === slug) return k;
  return null;
}

export async function getOtherTeam(
  currentSlug: string,
  limit = 2,
): Promise<RelatedPerson[]> {
  const sb = createServerClient();
  const currentPageKey = teamSlugToPageKey(currentSlug);

  // Pull all team detail rows we care about, exclude bishopwilson (the
  // redirect duplicate), exclude index/categories.
  const allowedKeys = Object.keys(TEAM_KEY_TO_SLUG).filter(
    (k) => k !== currentPageKey,
  );

  if (allowedKeys.length === 0) return [];

  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .in("page_key", allowedKeys)
    .in("field_key", ["person_name", "person_title", "portrait_url"]);
  if (error) {
    console.error("[team] getOtherTeam failed:", error);
    return [];
  }

  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }

  const out: RelatedPerson[] = [];
  for (const [pageKey, fields] of byPage) {
    const slug = TEAM_KEY_TO_SLUG[pageKey];
    if (!slug) continue;
    out.push({
      slug,
      name: fields["person_name"] ?? "",
      title: fields["person_title"] ?? "",
      portrait: fields["portrait_url"] ?? "",
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out.slice(0, limit);
}

export interface PreachedSermon {
  slug: string;
  title: string;
  thumbnail: string;
  date: string;
  scripture: string;
}

/**
 * For Bishop Wilson's profile: returns the most recent sermons. Every sermon
 * in the catalog is preached by Bishop, so we don't try to filter by speaker —
 * we just return the latest. For other people (preaching=false), the
 * TeamTemplate skips this section entirely.
 */
export async function getSermonsByPerson(limit = 3): Promise<PreachedSermon[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "sermons.%")
    .neq("page_key", "sermons.index")
    .not("page_key", "like", "sermons.cat.%")
    .in("field_key", ["meta.title", "thumbnail_url", "date_published", "scripture_primary"]);
  if (error) {
    console.error("[team] getSermonsByPerson failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const sermons: PreachedSermon[] = [];
  for (const [pageKey, fields] of byPage) {
    sermons.push({
      slug: pageKey.replace(/^sermons\./, ""),
      title: fields["meta.title"] ?? "",
      thumbnail: fields["thumbnail_url"] ?? "",
      date: fields["date_published"] ?? "",
      scripture: fields["scripture_primary"] ?? "",
    });
  }
  sermons.sort((a, b) => (a.date < b.date ? 1 : -1));
  return sermons.slice(0, limit);
}

export interface MinistryRef {
  slug: string;
  title: string;
  hero_image: string;
  tagline: string;
}

/**
 * Parse a comma-separated list of ministry slugs (from the manual-seed
 * `ministries_led` field) and resolve each to its rendering data.
 */
export function parseMinistriesLed(commaString: string | undefined | null): string[] {
  if (!commaString) return [];
  return commaString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getMinistriesByName(slugs: string[]): Promise<MinistryRef[]> {
  if (slugs.length === 0) return [];
  const sb = createServerClient();
  const pageKeys = slugs.map((s) => `ministries.${s}`);
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .in("page_key", pageKeys)
    .in("field_key", ["meta.title", "hero_image", "tagline"]);
  if (error) {
    console.error("[team] getMinistriesByName failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  // Preserve the order the user listed the slugs in.
  const out: MinistryRef[] = [];
  for (const slug of slugs) {
    const fields = byPage.get(`ministries.${slug}`);
    if (!fields) continue;
    out.push({
      slug,
      title: fields["meta.title"] ?? "",
      hero_image: fields["hero_image"] ?? "",
      tagline: fields["tagline"] ?? "",
    });
  }
  return out;
}
