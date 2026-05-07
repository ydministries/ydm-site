import { createServerClient } from "./supabase";

export interface RecentSermon {
  slug: string;
  title: string;
  thumbnail: string;
  date: string;
  scripture: string;
}

/**
 * Fetch the most recent sermons (excluding the current page), ordered by
 * date_published DESC. Pulls meta.title + thumbnail_url + date_published +
 * scripture_primary in a single round-trip and pivots client-side.
 */
export async function getRecentSermons(
  currentSlug: string,
  limit = 3,
): Promise<RecentSermon[]> {
  const sb = createServerClient();
  const currentPageKey = `sermons.${currentSlug}`;

  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "sermons.%")
    .neq("page_key", "sermons.index")
    .not("page_key", "like", "sermons.cat.%")
    .neq("page_key", currentPageKey)
    .in("field_key", ["meta.title", "thumbnail_url", "date_published", "scripture_primary"]);
  if (error) {
    console.error("[sermons] getRecentSermons failed:", error);
    return [];
  }

  // Pivot rows → { [page_key]: { field_key: value } }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }

  const sermons: RecentSermon[] = [];
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

/** A sermon shape that includes optional series_name (for grouped index views). */
export interface SermonListItem extends RecentSermon {
  /** Bishop-edited series name. Sermons sharing a series_name group together
   * on /sermons. Sermons without a value land in the "Standalone" group. */
  series: string;
}

/**
 * Same shape as RecentSermon plus an optional series field — used by the
 * /sermons index. Returns ALL sermon detail pages, not capped, ordered by
 * date_published DESC within each series.
 */
export async function getAllSermons(): Promise<SermonListItem[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "sermons.%")
    .neq("page_key", "sermons.index")
    .not("page_key", "like", "sermons.cat.%")
    .in("field_key", [
      "meta.title",
      "thumbnail_url",
      "date_published",
      "scripture_primary",
      "series_name",
    ]);
  if (error) {
    console.error("[sermons] getAllSermons failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const sermons: SermonListItem[] = [];
  for (const [pageKey, fields] of byPage) {
    sermons.push({
      slug: pageKey.replace(/^sermons\./, ""),
      title: fields["meta.title"] ?? "",
      thumbnail: fields["thumbnail_url"] ?? "",
      date: fields["date_published"] ?? "",
      scripture: fields["scripture_primary"] ?? "",
      series: (fields["series_name"] ?? "").trim(),
    });
  }
  sermons.sort((a, b) => (a.date < b.date ? 1 : -1));
  return sermons;
}

/** Group sermons by series_name. Sermons with no series go into a "" key
 * (rendered as "Standalone messages" in the UI). */
export function groupSermonsBySeries(
  sermons: SermonListItem[],
): { series: string; sermons: SermonListItem[] }[] {
  const groups = new Map<string, SermonListItem[]>();
  for (const s of sermons) {
    const key = s.series || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  // Order: named series first (alpha), then standalone group last.
  const named = [...groups.entries()].filter(([k]) => k !== "");
  named.sort((a, b) => a[0].localeCompare(b[0]));
  const standalone = groups.get("") ?? [];
  const out = named.map(([series, sermons]) => ({ series, sermons }));
  if (standalone.length > 0) out.push({ series: "", sermons: standalone });
  return out;
}

export interface ScriptureRef {
  ref: string;
  text: string;
  translation: string;
  url: string;
}

/**
 * Parse the scripture_refs page_content row (JSON-encoded array stored in a
 * 'text' value_type column) into a typed array. Returns [] for missing/invalid.
 */
export function parseScriptureRefs(raw: string | undefined | null): ScriptureRef[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScriptureRef[]) : [];
  } catch {
    return [];
  }
}
