"use client";

import { useState, type FormEvent } from "react";

export type BackendFormType = "contact" | "prayer" | "ask" | "guestbook";

export interface BackendFormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: Array<string | { group: string; options: string[] }>;
  placeholder?: string;
  rows?: number;
}

interface Props {
  formType: BackendFormType;
  fields: BackendFormField[];
  submitLabel: string;
  successLabel: string;
}

const inputBase =
  "block w-full rounded-sm border border-ydm-line bg-white px-4 font-serif text-base text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:outline-none focus:ring-2 focus:ring-ydm-gold/40";

const labelBase =
  "mb-2 block font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink";

const SELECT_BG_SVG =
  "bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%231a1a1a%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')]";

export function BackendForm({
  formType,
  fields,
  submitLabel,
  successLabel,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const honeypot = (fd.get("honeypot") as string) ?? "";
    const fieldValues: Record<string, string> = {};
    for (const f of fields) {
      const v = fd.get(f.name);
      if (typeof v === "string") fieldValues[f.name] = v;
    }

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          honeypot,
          fields: fieldValues,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? `Submission failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-ydm-gold bg-ydm-gold/10 p-10 text-center">
        <div className="mb-4 text-4xl" aria-hidden>
          ✉️
        </div>
        <h3 className="m-0 mb-2 font-display text-2xl uppercase text-ydm-ink">
          Message Sent!
        </h3>
        <p className="m-0 font-serif text-base leading-relaxed text-ydm-text">
          {successLabel}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot — must stay empty. Off-screen, no autofill, no tab focus. */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />

      {fields.map((f) => {
        const id = `backend-${formType}-${f.name}`;
        return (
          <div key={f.name}>
            <label htmlFor={id} className={labelBase}>
              {f.label}
              {f.required ? (
                <span className="ml-1 text-ydm-gold">*</span>
              ) : null}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={id}
                name={f.name}
                required={f.required}
                rows={f.rows ?? 6}
                placeholder={f.placeholder}
                className={`${inputBase} resize-none py-3 leading-relaxed`}
              />
            ) : f.type === "select" ? (
              <select
                id={id}
                name={f.name}
                required={f.required}
                defaultValue=""
                className={`${inputBase} h-11 appearance-none ${SELECT_BG_SVG} bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat pr-10`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {(f.options ?? []).map((opt) =>
                  typeof opt === "string" ? (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ) : (
                    <optgroup key={opt.group} label={opt.group}>
                      {opt.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </optgroup>
                  ),
                )}
              </select>
            ) : (
              <input
                id={id}
                name={f.name}
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                className={`${inputBase} h-11`}
              />
            )}
          </div>
        );
      })}

      {error && (
        <p className="m-0 rounded-sm border border-red-300 bg-red-50 p-3 font-serif text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink transition-colors hover:bg-ydm-gold-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
