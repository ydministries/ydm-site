import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { UploadButton } from "./UploadButton";
import { CopyUrlButton } from "./CopyUrlButton";

export const dynamic = "force-dynamic";

interface AssetRow {
  id: string;
  asset_key: string;
  storage_path: string;
  alt: string | null;
  caption: string | null;
  mime_type: string | null;
}

const PAGE_SIZE = 100;

export default async function AssetsPage() {
  const supabase = await createServerClient();

  const [{ count }, { data: rows, error }] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase
      .from("assets")
      .select("id, asset_key, storage_path, alt, caption, mime_type")
      .order("id", { ascending: false })
      .limit(PAGE_SIZE),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
          >
            ← Dashboard
          </Link>
          <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
            Assets
          </h1>
          <p className="mt-1 text-sm text-ydm-muted">
            {count ?? 0} total
            {rows && rows.length < (count ?? 0)
              ? ` · showing latest ${rows.length}`
              : ""}
          </p>
        </div>
        <UploadButton />
      </header>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {(rows ?? []).map((a: AssetRow) => (
          <li
            key={a.id}
            className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface"
          >
            <div className="aspect-square w-full bg-ydm-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.storage_path}
                alt={a.alt ?? ""}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <p
                className="m-0 truncate text-xs text-ydm-ink"
                title={a.caption ?? a.asset_key}
              >
                {a.caption ?? a.asset_key}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                  {a.mime_type?.split("/")[1] ?? "—"}
                </span>
                <CopyUrlButton url={a.storage_path} />
              </div>
            </div>
          </li>
        ))}
        {!error && (rows?.length ?? 0) === 0 && (
          <li className="col-span-full rounded border border-dashed border-ydm-line p-8 text-center text-sm text-ydm-muted">
            No assets yet. Click Upload to add one.
          </li>
        )}
      </ul>
    </div>
  );
}
