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
