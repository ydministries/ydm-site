"use client";

import { useState, type FormEvent } from "react";

export interface MailtoFormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  rows?: number;
}

interface Props {
  to: string;
  subjectPrefix: string;
  fields: MailtoFormField[];
  submitLabel: string;
  successLabel: string;
}

const inputBase =
  "block w-full rounded-sm border border-ydm-line bg-white px-4 font-serif text-base text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:outline-none focus:ring-2 focus:ring-ydm-gold/40";

const labelBase =
  "mb-2 block font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink";

export function MailtoForm({ to, subjectPrefix, fields, submitLabel, successLabel }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const subject = `${subjectPrefix} ${fd.get("subject") || fd.get("name") || ""}`.trim();
    const body = fields
      .map((f) => `${f.label}:\n${(fd.get(f.name) ?? "").toString()}`)
      .join("\n\n");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="m-0 text-center font-serif text-base text-ydm-text">
        {successLabel}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {fields.map((f) => {
        const id = `mailto-${f.name}`;
        return (
          <div key={f.name}>
            <label htmlFor={id} className={labelBase}>
              {f.label}
              {f.required ? <span className="ml-1 text-ydm-gold">*</span> : null}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={id}
                name={f.name}
                required={f.required}
                rows={f.rows ?? 6}
                placeholder={f.placeholder}
                className={`${inputBase} py-3 leading-relaxed`}
              />
            ) : f.type === "select" ? (
              <select
                id={id}
                name={f.name}
                required={f.required}
                defaultValue=""
                className={`${inputBase} h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%231a1a1a%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat pr-10`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {f.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
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
      <button
        type="submit"
        className="rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink transition-colors hover:bg-ydm-gold-light"
      >
        {submitLabel}
      </button>
    </form>
  );
}
