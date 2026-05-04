import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { RestoreButton } from "./RestoreButton";

export const dynamic = "force-dynamic";

interface VersionRow {
  id: string;
  field_key: string;
  old_value: string | null;
  new_value: string | null;
  value_type: string | null;
  changed_at: string;
  changed_by: string | null;
}

interface Props {
  params: Promise<{ pageKey: string }>;
}

export default async function HistoryPage({ params }: Props) {
  const { pageKey: raw } = await params;
  const pageKey = decodeURIComponent(raw);

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: versions, error } = await supabase
    .from("content_versions")
    .select(
      "id, field_key, old_value, new_value, value_type, changed_at, changed_by",
    )
    .eq("page_key", pageKey)
    .order("changed_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-ydm-line pb-4">
        <div className="min-w-0">
          <Link
            href={`/admin/content/${encodeURIComponent(pageKey)}`}
            className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
          >
            ← Back to editor
          </Link>
          <p className="mt-2 font-accent text-[11px] uppercase tracking-[0.2em] text-ydm-muted">
            History
          </p>
          <h1 className="m-0 mt-1 truncate font-display text-2xl uppercase tracking-wide text-ydm-ink">
            {pageKey}
          </h1>
          <p className="mt-1 text-sm text-ydm-muted">
            {versions?.length ?? 0} edits recorded
          </p>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      {!error && (!versions || versions.length === 0) ? (
        <p className="italic text-ydm-muted">No edits yet for this page.</p>
      ) : (
        <ul className="space-y-4">
          {(versions ?? []).map((v: VersionRow) => (
            <VersionItem key={v.id} v={v} currentUserId={user.id} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VersionItem({
  v,
  currentUserId,
}: {
  v: VersionRow;
  currentUserId: string;
}) {
  const editorLabel =
    v.changed_by === null
      ? "system"
      : v.changed_by === currentUserId
        ? "you"
        : "another editor";

  return (
    <li className="rounded border border-ydm-line bg-ydm-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 truncate font-mono text-xs text-ydm-muted">
            {v.field_key}
          </p>
          <p className="mt-1 text-xs text-ydm-muted">
            {new Date(v.changed_at).toLocaleString()} · {editorLabel}
            {v.value_type ? (
              <span className="ml-2 rounded-full bg-ydm-cream px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                {v.value_type}
              </span>
            ) : null}
          </p>
        </div>
        <RestoreButton versionId={v.id} disabled={v.old_value === null} />
      </div>
      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="m-0 mb-1 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
            Before
          </p>
          <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 p-3 font-serif text-xs text-ydm-ink">
            {v.old_value ?? "(no prior value)"}
          </pre>
        </div>
        <div>
          <p className="m-0 mb-1 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
            After
          </p>
          <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded border border-emerald-200 bg-emerald-50 p-3 font-serif text-xs text-ydm-ink">
            {v.new_value ?? ""}
          </pre>
        </div>
      </div>
    </li>
  );
}
