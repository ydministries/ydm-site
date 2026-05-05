import { createServerClient } from "./supabase";

export interface GalleryPhoto {
  key: string;       // asset_key (e.g. "gallery.image.01")
  url: string;       // full R2 URL
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
}

/**
 * Returns all rows from the assets table where asset_key matches `gallery.image.%`,
 * ordered by asset_key ASC so the curated sequence ("01", "02", …) is preserved.
 *
 * Photos are admin-editable (alt + caption) via the existing /admin/assets UI.
 * Bishop can also upload new gallery photos there — they'll appear here on next
 * request as long as their asset_key follows the `gallery.image.NN` convention.
 */
export async function getAllGalleryPhotos(): Promise<GalleryPhoto[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("assets")
    .select("asset_key, storage_path, alt, caption, width, height")
    .like("asset_key", "gallery.image.%")
    .order("asset_key", { ascending: true });
  if (error) {
    console.error("[gallery] getAllGalleryPhotos failed:", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    key: row.asset_key,
    url: row.storage_path,
    alt: row.alt ?? "",
    caption: row.caption ?? "",
    width: row.width ?? null,
    height: row.height ?? null,
  }));
}
