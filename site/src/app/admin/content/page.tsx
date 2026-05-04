import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getRouteForPageKey } from "@/lib/routeMap";
import { ContentListFilter } from "./ContentListFilter";

export const dynamic = "force-dynamic";

interface PageRow {
  pageKey: string;
  title: string;
  type: string;
  newPath: string | null;
  fieldCount: number;
  lastEdited: string;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  const wk = 7 * day;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < wk) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function ContentListPage() {
  const supabase = await createServerClient();

  const { data: rows, error } = await supabase
    .from("page_content")
    .select("page_key, field_key, value, updated_at");

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Content
        </h1>
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      </div>
    );
  }

  type Agg = { count: number; max: string; title?: string };
  const agg = new Map<string, Agg>();

  for (const r of rows ?? []) {
    const a = agg.get(r.page_key) ?? { count: 0, max: "" };
    a.count += 1;
    if (r.updated_at > a.max) a.max = r.updated_at;
    if (r.field_key === "meta.title" && r.value) a.title = r.value;
    agg.set(r.page_key, a);
  }

  const pages: PageRow[] = [...agg.entries()]
    .map(([pageKey, a]) => {
      const item = getRouteForPageKey(pageKey);
      return {
        pageKey,
        title: a.title ?? item?.oldSlug ?? pageKey,
        type: item?.type ?? "unknown",
        newPath: item?.newPath ?? null,
        fieldCount: a.count,
        lastEdited: relativeTime(a.max),
      };
    })
    .sort((a, b) => a.pageKey.localeCompare(b.pageKey));

  const types = [...new Set(pages.map((p) => p.type))].sort();
  const totalFields = rows?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-3xl uppercase tracking-wide text-ydm-ink">
            Content
          </h1>
          <p className="mt-1 text-sm text-ydm-muted">
            {pages.length} pages · {totalFields} editable fields
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← Dashboard
        </Link>
      </header>

      <ContentListFilter pages={pages} types={types} />
    </div>
  );
}
