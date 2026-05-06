import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

interface DonationRow {
  id: string;
  stripe_session_id: string | null;
  stripe_subscription_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  amount_cad: number | null;
  currency: string | null;
  is_recurring: boolean | null;
  interval: string | null;
  status: string | null;
  method: string | null;
  campaign_slug: string | null;
  created_at: string;
}

const PAGE_SIZE = 200;

function fmtMoney(cents: number | null | undefined, currency: string | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  const amount = cents / 100;
  return amount.toLocaleString("en-CA", {
    style: "currency",
    currency: currency ?? "CAD",
  });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DonationsAdminPage() {
  const me = await getCurrentProfile();
  const isBishop = me?.role === "bishop";
  const supabase = await createServerClient();

  const { data: rows, count, error } = await supabase
    .from("donations")
    .select(
      "id, stripe_session_id, stripe_subscription_id, donor_name, donor_email, amount_cad, currency, is_recurring, interval, status, method, campaign_slug, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  // Aggregate stats
  const totalCents = (rows ?? [])
    .filter((r: DonationRow) => r.status === "succeeded")
    .reduce((n, r: DonationRow) => n + (r.amount_cad ?? 0), 0);
  const recurringCount = new Set(
    (rows ?? [])
      .filter(
        (r: DonationRow) =>
          r.is_recurring && r.status === "succeeded" && r.stripe_subscription_id,
      )
      .map((r: DonationRow) => r.stripe_subscription_id),
  ).size;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← {isBishop ? "Home" : "Dashboard"}
        </Link>
        <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Donations
        </h1>
        <p className="mt-1 text-sm text-ydm-muted">
          {count ?? 0} total ledger entries · {recurringCount} active monthly partners ·{" "}
          {fmtMoney(totalCents, "CAD")} received via Stripe
        </p>
        <p className="mt-2 rounded border border-ydm-line bg-ydm-cream/60 p-3 text-xs leading-relaxed text-ydm-text">
          Interac e-Transfer donations land in the{" "}
          <a
            href="mailto:donate@ydministries.ca"
            className="text-ydm-ink underline"
          >
            donate@ydministries.ca
          </a>{" "}
          inbox and aren't tracked here. This page shows Stripe-routed gifts
          only.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      {!error && (rows?.length ?? 0) === 0 ? (
        <div className="rounded border border-dashed border-ydm-line p-10 text-center text-sm text-ydm-muted">
          No Stripe donations yet. Once a donor sets up monthly giving on{" "}
          <Link href="/give" className="text-ydm-ink underline">
            /give
          </Link>
          , entries will appear here automatically via webhook.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ydm-line bg-ydm-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ydm-line bg-ydm-cream/40">
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Donor
                </th>
                <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Status
                </th>
                {!isBishop && (
                  <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Subscription
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((d: DonationRow) => (
                <tr
                  key={d.id}
                  className="border-b border-ydm-line/60 last:border-0"
                >
                  <td className="px-4 py-3 text-xs text-ydm-muted">
                    {fmtDate(d.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ydm-ink">
                    {d.donor_name ?? d.donor_email ?? "—"}
                    {d.donor_email && d.donor_name && (
                      <span className="ml-2 font-mono text-[10px] text-ydm-muted">
                        {d.donor_email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-ydm-ink">
                    {fmtMoney(d.amount_cad, d.currency)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ydm-text">
                    {d.is_recurring ? (
                      <span>Monthly</span>
                    ) : (
                      <span>One-time</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={d.status ?? "pending"} />
                  </td>
                  {!isBishop && (
                    <td className="px-4 py-3 font-mono text-[10px] text-ydm-muted">
                      {d.stripe_subscription_id ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    succeeded: { label: "Succeeded", cls: "bg-emerald-100 text-emerald-800" },
    pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-800" },
    failed: { label: "Failed", cls: "bg-red-100 text-red-800" },
    refunded: { label: "Canceled", cls: "bg-ydm-cream text-ydm-muted" },
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
