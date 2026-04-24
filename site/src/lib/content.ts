import { createServerClient } from "./supabase";

export interface ContentRow {
  id: string;
  page_key: string;
  field_key: string;
  value: string;
  draft_value: string | null;
  value_type: string;
  published_at: string | null;
  updated_at: string;
}

/**
 * Fetch all content rows for a given page_key.
 * Returns a Map keyed by field_key for O(1) lookups.
 */
export async function fetchPageContent(
  pageKey: string
): Promise<Map<string, ContentRow>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page_key", pageKey);

  if (error) {
    console.error(`[content] Failed to fetch page_key="${pageKey}":`, error);
    return new Map();
  }

  const map = new Map<string, ContentRow>();
  for (const row of data ?? []) {
    map.set(row.field_key, row);
  }
  return map;
}

export interface AssetRow {
  id: string;
  asset_key: string;
  storage_path: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
}

/**
 * Fetch assets matching a key prefix (e.g. "about." returns all about-page assets).
 * Returns a Map keyed by asset_key.
 */
export async function fetchAssets(
  prefix: string
): Promise<Map<string, AssetRow>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .like("asset_key", `${prefix}%`);

  if (error) {
    console.error(`[assets] Failed to fetch prefix="${prefix}":`, error);
    return new Map();
  }

  const map = new Map<string, AssetRow>();
  for (const row of data ?? []) {
    map.set(row.asset_key, row);
  }
  return map;
}
