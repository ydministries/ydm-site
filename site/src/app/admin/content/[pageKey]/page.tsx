import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPageContent, type ContentRow } from "@/lib/content";
import { getRouteForPageKey } from "@/lib/routeMap";
import { EditForm, type FieldData } from "./EditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ pageKey: string }>;
}

export default async function EditPage({ params }: Props) {
  const { pageKey: raw } = await params;
  const pageKey = decodeURIComponent(raw);

  const map = await fetchPageContent(pageKey);
  if (map.size === 0) notFound();

  const route = getRouteForPageKey(pageKey);
  const titleRow = map.get("meta.title");
  const title = titleRow?.value ?? pageKey;

  const fields: FieldData[] = [...map.values()]
    .map((r: ContentRow) => ({
      pageKey: r.page_key,
      fieldKey: r.field_key,
      value: r.value ?? "",
      valueType: r.value_type ?? "text",
      updatedAt: r.updated_at,
    }))
    .sort((a, b) => a.fieldKey.localeCompare(b.fieldKey));

  return (
    <div className="mx-auto max-w-4xl">
      <header className="sticky top-0 z-10 -mx-6 mb-6 border-b border-ydm-line bg-ydm-surface/95 px-6 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/admin/content"
              className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
            >
              ← All content
            </Link>
            <h1 className="m-0 mt-1 truncate font-display text-2xl uppercase tracking-wide text-ydm-ink">
              {title}
            </h1>
            <p className="mt-1 font-mono text-xs text-ydm-muted">
              {pageKey} · {fields.length} fields
              {route?.type ? ` · ${route.type}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/content/${encodeURIComponent(pageKey)}/history`}
              className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-xs text-ydm-ink no-underline hover:border-ydm-gold"
            >
              History →
            </Link>
            {route?.newPath && (
              <a
                href={route.newPath}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-xs text-ydm-ink no-underline hover:border-ydm-gold"
              >
                View public page ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <EditForm fields={fields} />
    </div>
  );
}
