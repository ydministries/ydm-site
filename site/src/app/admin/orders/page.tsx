import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  stripe_session_id: string | null;
  printful_order_id: string | null;
  customer_email: string;
  customer_name: string | null;
  total_cad: number;
  currency: string;
  status: string;
  fulfillment_status: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
}

const PAGE_SIZE = 200;

function fmtMoney(cents: number, currency: string): string {
  return (cents / 100).toLocaleString("en-CA", {
    style: "currency",
    currency: currency || "CAD",
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

export default async function OrdersAdminPage() {
  const me = await getCurrentProfile();
  const isBishop = me?.role === "bishop";
  const supabase = await createServerClient();

  const { data: rows, count, error } = await supabase
    .from("orders")
    .select(
      "id, stripe_session_id, printful_order_id, customer_email, customer_name, total_cad, currency, status, fulfillment_status, tracking_url, notes, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const totalCents = (rows ?? [])
    .filter((r: OrderRow) => r.status === "paid")
    .reduce((n, r: OrderRow) => n + (r.total_cad ?? 0), 0);

  const orphans = (rows ?? []).filter(
    (r: OrderRow) =>
      r.status === "paid" && !r.printful_order_id,
  );

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
          Orders
        </h1>
        <p className="mt-1 text-sm text-ydm-muted">
          {count ?? 0} total · {fmtMoney(totalCents, "CAD")} captured
          {orphans.length > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold text-red-700">
                {orphans.length} need attention
              </span>
            </>
          ) : null}
        </p>
        {orphans.length > 0 ? (
          <p className="mt-2 rounded border border-red-300 bg-red-50 p-3 text-xs leading-relaxed text-red-800">
            {orphans.length} order{orphans.length === 1 ? "" : "s"} captured
            payment but Printful submission failed. Reconcile manually in the
            Printful dashboard or contact the customer.
          </p>
        ) : null}
      </header>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      {!error && (rows?.length ?? 0) === 0 ? (
        <div className="rounded border border-dashed border-ydm-line p-10 text-center text-sm text-ydm-muted">
          No orders yet. Once a customer completes checkout on{" "}
          <Link href="/shop" className="text-ydm-ink underline">
            /shop
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
                  Customer
                </th>
                <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Fulfillment
                </th>
                {!isBishop && (
                  <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Printful ID
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((o: OrderRow) => (
                <tr
                  key={o.id}
                  className={`border-b border-ydm-line/60 last:border-0 ${
                    o.status === "paid" && !o.printful_order_id
                      ? "bg-red-50/40"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-ydm-muted">
                    {fmtDate(o.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ydm-ink">
                    {o.customer_name ?? "(no name)"}
                    <span className="ml-2 font-mono text-[10px] text-ydm-muted">
                      {o.customer_email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-ydm-ink">
                    {fmtMoney(o.total_cad, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={o.status} kind="payment" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={o.fulfillment_status ?? "—"}
                      kind="fulfillment"
                    />
                  </td>
                  {!isBishop && (
                    <td className="px-4 py-3 font-mono text-[10px] text-ydm-muted">
                      {o.printful_order_id ?? "—"}
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

function StatusPill({
  status,
  kind: _kind,
}: {
  status: string;
  kind: "payment" | "fulfillment";
}) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800" },
    fulfilling: { label: "Fulfilling", cls: "bg-blue-100 text-blue-800" },
    shipped: { label: "Shipped", cls: "bg-blue-100 text-blue-800" },
    delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "Cancelled", cls: "bg-ydm-cream text-ydm-muted" },
    refunded: { label: "Refunded", cls: "bg-ydm-cream text-ydm-muted" },
    submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-800" },
    submission_failed: {
      label: "Failed to submit",
      cls: "bg-red-100 text-red-800",
    },
    "—": { label: "—", cls: "bg-ydm-cream text-ydm-muted" },
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
