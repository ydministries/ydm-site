"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface PageRow {
  pageKey: string;
  title: string;
  type: string;
  newPath: string | null;
  fieldCount: number;
  lastEdited: string;
}

interface Props {
  pages: PageRow[];
  types: string[];
}

export function ContentListFilter({ pages, types }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return pages.filter((p) => {
      if (type && p.type !== type) return false;
      if (!needle) return true;
      return (
        p.pageKey.toLowerCase().includes(needle) ||
        p.title.toLowerCase().includes(needle)
      );
    });
  }, [pages, q, type]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or page key…"
          className="min-w-0 flex-1 rounded border border-ydm-line bg-ydm-surface px-3 py-2 text-sm text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border border-ydm-line bg-ydm-surface px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-xs text-ydm-muted">
          {filtered.length} / {pages.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {filtered.map((p) => (
          <li key={p.pageKey}>
            <Link
              href={`/admin/content/${encodeURIComponent(p.pageKey)}`}
              className="group flex items-start justify-between gap-3 rounded-lg border border-ydm-line bg-ydm-surface p-4 no-underline transition-colors hover:border-ydm-gold hover:shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="m-0 truncate font-display text-sm uppercase tracking-wide text-ydm-ink">
                    {p.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-ydm-cream px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                    {p.type}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-xs text-ydm-muted">
                  {p.pageKey}
                </p>
                <p className="mt-1 text-xs text-ydm-muted">
                  {p.fieldCount} fields · edited {p.lastEdited}
                </p>
              </div>
              <span className="shrink-0 text-sm text-ydm-muted group-hover:text-ydm-gold">
                Edit →
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="col-span-full rounded border border-dashed border-ydm-line p-6 text-center text-sm text-ydm-muted">
            No pages match.
          </li>
        )}
      </ul>
    </>
  );
}
