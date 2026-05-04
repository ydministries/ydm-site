import { createServerClient } from "./supabase";

export interface EventItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  thumbnail: string;
  day: string;   // e.g. "25"
  month: string; // e.g. "MAR"
}

/**
 * Per-event thumbnails — we don't have these as page_content fields yet, so
 * mirror the slug→URL mapping HomeTemplate uses for its events strip. When we
 * eventually seed `thumbnail_url` for events, this map can go.
 */
const EVENT_THUMBNAILS: Record<string, string> = {
  "weekly-bible-study-group":
    "https://media.ydministries.ca/uploads/2025/01/wmremove-transformed.webp",
  "young-adults-connect":
    "https://media.ydministries.ca/uploads/2025/01/d4bd005b-e92d-4db0-a7b6-160c2dc6d22e-e1758157433747.jpg",
};

function dayMonth(iso: string | undefined): { day: string; month: string } {
  if (!iso) return { day: "", month: "" };
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return { day: "", month: "" };
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

/**
 * Returns ALL event detail pages, excluding index + category archives.
 * Ordered by date_published ASC (upcoming first feels right for events).
 */
export async function getAllEvents(): Promise<EventItem[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "events.%")
    .neq("page_key", "events.index")
    .not("page_key", "like", "events.cat.%")
    .in("field_key", ["meta.title", "excerpt", "date_published"]);
  if (error) {
    console.error("[events] getAllEvents failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const events: EventItem[] = [];
  for (const [pageKey, fields] of byPage) {
    const slug = pageKey.replace(/^events\./, "");
    const date = fields["date_published"] ?? "";
    const { day, month } = dayMonth(date);
    events.push({
      slug,
      title: fields["meta.title"] ?? "",
      excerpt: fields["excerpt"] ?? "",
      date,
      thumbnail: EVENT_THUMBNAILS[slug] ?? "",
      day,
      month,
    });
  }
  events.sort((a, b) => (a.date < b.date ? -1 : 1));
  return events;
}

/**
 * Other upcoming events excluding the current page.
 */
export async function getOtherEvents(
  currentSlug: string,
  limit = 1,
): Promise<EventItem[]> {
  const all = await getAllEvents();
  return all.filter((e) => e.slug !== currentSlug).slice(0, limit);
}
