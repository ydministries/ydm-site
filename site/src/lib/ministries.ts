import { createServerClient } from "./supabase";

export interface RelatedMinistry {
  slug: string;
  title: string;
  hero_image: string;
  tagline: string;
}

/**
 * Fetch ministries other than the current one, alphabetical (no date_published
 * on ministries). Pulls meta.title + hero_image + tagline in a single
 * round-trip and pivots client-side. Excludes the index page and category
 * archives.
 */
export async function getRelatedMinistries(
  currentSlug: string,
  limit = 3,
): Promise<RelatedMinistry[]> {
  const sb = createServerClient();
  const currentPageKey = `ministries.${currentSlug}`;

  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "ministries.%")
    .neq("page_key", "ministries.index")
    .not("page_key", "like", "ministries.cat.%")
    .neq("page_key", currentPageKey)
    .in("field_key", ["meta.title", "hero_image", "tagline"]);
  if (error) {
    console.error("[ministries] getRelatedMinistries failed:", error);
    return [];
  }

  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }

  const ministries: RelatedMinistry[] = [];
  for (const [pageKey, fields] of byPage) {
    ministries.push({
      slug: pageKey.replace(/^ministries\./, ""),
      title: fields["meta.title"] ?? "",
      hero_image: fields["hero_image"] ?? "",
      tagline: fields["tagline"] ?? "",
    });
  }
  ministries.sort((a, b) => a.title.localeCompare(b.title));
  return ministries.slice(0, limit);
}
