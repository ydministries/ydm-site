import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";
import { unsubscribeAction, resubscribeAction } from "./actions";

export const dynamic = "force-dynamic";

interface SubscriberRow {
  id: string;
  email: string;
  status: string;
  source: string | null;
  resend_contact_id: string | null;
  created_at: string;
  updated_at: string | null;
}

const PAGE_SIZE = 200;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SubscribersPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await props.searchParams;
  const filterStatus =
    rawStatus && ["subscribed", "unsubscribed", "all"].includes(rawStatus)
      ? rawStatus
      : "subscribed";

  const profile = await getCurrentProfile();
  const isBishop = profile?.role === "bishop";

  const supabase = await createServerClient();
  let query = supabase
    .from("newsletter_subscribers")
    .select(
      "id, email, status, source, resend_contact_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }
  const { data: rows, error } = await query;

  // Get counts for filter chips, independent of the active filter.
  const { data: statusAgg } = await supabase
    .from("newsletter_subscribers")
    .select("status");
  const counts = { subscribed: 0, unsubscribed: 0, all: 0 };
  for (const r of statusAgg ?? []) {
    counts.all += 1;
    if (r.status === "subscribed") counts.subscribed += 1;
    else if (r.status === "unsubscribed") counts.unsubscribed += 1;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
          >
            ← {isBishop ? "Home" : "Dashboard"}
          </Link>
          <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
            {isBishop ? "Newsletter" : "Subscribers"}
          </h1>
          <p className="mt-1 text-sm text-ydm-muted">
            {isBishop
              ? `${counts.subscribed} people subscribed to YDM email updates.`
              : `${counts.subscribed} active · ${counts.unsubscribed} unsubscribed`}
          </p>
        </div>
        <a
          href={`/admin/subscribers/export?status=${filterStatus}`}
          className="rounded-full border border-ydm-line bg-ydm-surface px-4 py-2 text-sm font-medium text-ydm-ink no-underline hover:bg-ydm-cream"
        >
          {isBishop ? "Download list" : "Export CSV"}
        </a>
      </header>

      {/* Filter chips */}
      <nav className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          href="/admin/subscribers"
          label={isBishop ? "Active" : "Subscribed"}
          count={counts.subscribed}
          active={filterStatus === "subscribed"}
        />
        <FilterChip
          href="/admin/subscribers?status=unsubscribed"
          label="Unsubscribed"
          count={counts.unsubscribed}
          active={filterStatus === "unsubscribed"}
        />
        <FilterChip
          href="/admin/subscribers?status=all"
          label="All"
          count={counts.all}
          active={filterStatus === "all"}
        />
      </nav>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      {!error && (rows?.length ?? 0) === 0 ? (
        <div className="rounded border border-dashed border-ydm-line p-10 text-center text-sm text-ydm-muted">
          {filterStatus === "subscribed"
            ? "No active subscribers yet."
            : filterStatus === "unsubscribed"
              ? "No one has unsubscribed."
              : "No subscribers yet."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ydm-line bg-ydm-cream/40">
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Status
                </th>
                {!isBishop && (
                  <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Source
                  </th>
                )}
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Signed up
                </th>
                <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((s: SubscriberRow) => (
                <tr
                  key={s.id}
                  className="border-b border-ydm-line/60 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs text-ydm-ink">
                    {s.email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  {!isBishop && (
                    <td className="px-4 py-3 text-xs text-ydm-muted">
                      {s.source ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-ydm-muted">
                    {fmtDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "subscribed" ? (
                      <form action={unsubscribeAction} className="inline">
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-ydm-line bg-ydm-cream px-3 py-1 font-accent text-[10px] uppercase tracking-wider text-ydm-ink hover:border-ydm-ink"
                        >
                          Remove
                        </button>
                      </form>
                    ) : s.status === "unsubscribed" ? (
                      <form action={resubscribeAction} className="inline">
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-ydm-line bg-ydm-cream px-3 py-1 font-accent text-[10px] uppercase tracking-wider text-ydm-muted hover:border-ydm-gold hover:text-ydm-ink"
                        >
                          Re-add
                        </button>
                      </form>
                    ) : (
                      <span className="font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  const cls = active
    ? "border-ydm-ink bg-ydm-ink text-white"
    : "border-ydm-line bg-ydm-surface text-ydm-text hover:border-ydm-ink hover:text-ydm-ink";
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium no-underline transition-colors ${cls}`}
    >
      <span>{label}</span>
      <span className="font-accent text-[10px] opacity-70">({count})</span>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    subscribed: {
      label: "Active",
      cls: "bg-emerald-100 text-emerald-800",
    },
    unsubscribed: {
      label: "Unsubscribed",
      cls: "bg-ydm-cream text-ydm-muted",
    },
    bounced: {
      label: "Bounced",
      cls: "bg-red-100 text-red-800",
    },
  };
  const m = map[status] ?? { label: status, cls: "bg-ydm-cream text-ydm-muted" };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
