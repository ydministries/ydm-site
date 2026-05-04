import { createServerClient } from "./supabase";

export interface Campaign {
  slug: string;
  title: string;
  excerpt: string;
}

/**
 * Returns ALL give/campaign detail pages, excluding the index. Alphabetical.
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "give.%")
    .neq("page_key", "give.index")
    .in("field_key", ["meta.title", "excerpt"]);
  if (error) {
    console.error("[campaigns] getAllCampaigns failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const out: Campaign[] = [];
  for (const [pageKey, fields] of byPage) {
    out.push({
      slug: pageKey.replace(/^give\./, ""),
      title: fields["meta.title"] ?? "",
      excerpt: fields["excerpt"] ?? "",
    });
  }
  out.sort((a, b) => a.title.localeCompare(b.title));
  return out;
}

export async function getOtherCampaigns(
  currentSlug: string,
  limit = 1,
): Promise<Campaign[]> {
  const all = await getAllCampaigns();
  return all.filter((c) => c.slug !== currentSlug).slice(0, limit);
}
