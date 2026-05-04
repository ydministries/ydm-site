import { createServerClient } from "./supabase";

export interface Location {
  slug: string;
  title: string;
  hero_image: string;
  address: string;
  service_times: string;
}

export async function getAllLocations(): Promise<Location[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "locations.%")
    .neq("page_key", "locations.index")
    .in("field_key", ["meta.title", "hero_image", "address", "service_times"]);
  if (error) {
    console.error("[locations] getAllLocations failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const out: Location[] = [];
  for (const [pageKey, fields] of byPage) {
    out.push({
      slug: pageKey.replace(/^locations\./, ""),
      title: fields["meta.title"] ?? "",
      hero_image: fields["hero_image"] ?? "",
      address: fields["address"] ?? "",
      service_times: fields["service_times"] ?? "",
    });
  }
  out.sort((a, b) => a.title.localeCompare(b.title));
  return out;
}

export async function getOtherLocations(
  currentSlug: string,
  limit = 1,
): Promise<Location[]> {
  const all = await getAllLocations();
  return all.filter((l) => l.slug !== currentSlug).slice(0, limit);
}
