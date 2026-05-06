"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/printful";
import type { SyncVariant } from "@/lib/printful";

interface BuyNowProps {
  productName: string;
  variants: SyncVariant[];
}

type Status = "idle" | "submitting" | "error";

export function BuyNow({ productName, variants }: BuyNowProps) {
  const initial = variants[0]?.id ?? null;
  const [variantId, setVariantId] = useState<number | null>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const selected = variants.find((v) => v.id === variantId);

  async function onBuy() {
    if (!selected) return;
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncVariantId: selected.id,
          productName,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start checkout.");
        setStatus("error");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[BuyNow] failed:", err);
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  if (variants.length === 0) {
    return (
      <p className="m-0 rounded border border-ydm-line bg-ydm-cream p-4 text-sm text-ydm-muted">
        No variants available right now.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {variants.length > 1 ? (
        <div>
          <label
            htmlFor="variant"
            className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
          >
            Choose option
          </label>
          <select
            id="variant"
            value={variantId ?? ""}
            onChange={(e) => setVariantId(Number(e.target.value))}
            disabled={status === "submitting"}
            className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-base text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {formatMoney(Math.round(Number(v.retail_price) * 100), v.currency.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <p className="m-0 font-accent text-xs uppercase tracking-wider text-ydm-muted">
          Price
        </p>
        <p className="m-0 font-display text-3xl text-ydm-ink">
          {selected
            ? formatMoney(
                Math.round(Number(selected.retail_price) * 100),
                selected.currency.toUpperCase(),
              )
            : "—"}
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="m-0 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onBuy}
        disabled={!selected || status === "submitting"}
        className="w-full rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink transition hover:bg-ydm-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting"
          ? "Redirecting to checkout…"
          : "Buy now (1 item)"}
      </button>

      <p className="m-0 text-center font-serif text-xs leading-relaxed text-ydm-muted">
        Secure checkout via Stripe · Made-to-order by Printful · Ships
        directly to you
      </p>
    </div>
  );
}
