import { createServerClient } from "./supabase";

export interface RecentSermon {
  slug: string;
  title: string;
  thumbnail: string;
  date: string;
  scripture: string;
}

/**
 * R2 public URL for a sermon mp3. The original migrate-to-r2 sweep stored
 * sermon audio under the `sermons/` prefix (not `uploads/`).
 */
export function sermonAudioUrl(filename: string): string {
  return `https://media.ydministries.ca/sermons/${filename}`;
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
