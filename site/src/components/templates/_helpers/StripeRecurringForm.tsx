"use client";

import { useState } from "react";

const PRESETS = [
  { amount: 25, label: "$25 / mo" },
  { amount: 50, label: "$50 / mo" },
  { amount: 100, label: "$100 / mo" },
  { amount: 250, label: "$250 / mo" },
] as const;

type Status = "idle" | "submitting" | "error";

export function StripeRecurringForm() {
  const [selected, setSelected] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setError("");

    const amount = usingCustom ? Number(custom) : selected;
    if (!Number.isFinite(amount) || amount < 5 || amount > 5000) {
      setError("Please enter an amount between $5 and $5000.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, honeypot }),
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
      console.error("[StripeRecurringForm] failed:", err);
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((p) => {
          const active = !usingCustom && selected === p.amount;
          return (
            <button
              key={p.amount}
              type="button"
              onClick={() => {
                setSelected(p.amount);
                setUsingCustom(false);
              }}
              className={`rounded-lg border px-4 py-3 font-display text-lg uppercase tracking-wide transition-colors ${
                active
                  ? "border-ydm-gold bg-ydm-gold text-ydm-ink"
                  : "border-ydm-line bg-ydm-surface text-ydm-ink hover:border-ydm-gold"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div>
        <label
          htmlFor="custom-amount"
          className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
        >
          Or a custom amount
        </label>
        <div className="flex items-stretch gap-2">
          <span className="flex items-center rounded border border-ydm-line bg-ydm-cream px-3 font-display text-base text-ydm-ink">
            CAD $
          </span>
          <input
            id="custom-amount"
            type="number"
            min={5}
            max={5000}
            step={1}
            placeholder="35"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setUsingCustom(true);
            }}
            disabled={status === "submitting"}
            className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-base text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
          />
          <span className="flex items-center rounded border border-ydm-line bg-ydm-cream px-3 font-accent text-xs uppercase tracking-wider text-ydm-muted">
            / month
          </span>
        </div>
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
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink transition hover:bg-ydm-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting"
          ? "Redirecting to checkout…"
          : "Continue to secure checkout"}
      </button>

      <p className="m-0 text-center font-serif text-xs leading-relaxed text-ydm-muted">
        Payments processed securely by{" "}
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noreferrer"
          className="text-ydm-ink underline"
        >
          Stripe
        </a>
        . You can cancel anytime — Stripe will email you a link to manage
        your subscription.
      </p>
    </form>
  );
}
