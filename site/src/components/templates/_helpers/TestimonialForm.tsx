"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function TestimonialForm() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          relationship,
          email,
          message,
          honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong — please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setRelationship("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("[TestimonialForm] submit failed:", err);
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-ydm-line bg-ydm-cream p-6 text-center">
        <p className="m-0 mb-2 font-display text-xl uppercase tracking-wide text-ydm-ink">
          Thank you
        </p>
        <p className="m-0 font-serif text-base text-ydm-text">
          Your testimony has been received. Bishop Wilson will review it soon,
          and once approved it'll appear here for the YDM family to read.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Honeypot */}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="t-name"
            className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
          >
            Your name
          </label>
          <input
            id="t-name"
            type="text"
            name="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "submitting"}
            className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="t-rel"
            className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
          >
            Your relationship to YDM (optional)
          </label>
          <input
            id="t-rel"
            type="text"
            name="relationship"
            maxLength={120}
            placeholder="e.g. Member, visitor, online congregation"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            disabled={status === "submitting"}
            className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="t-email"
          className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
        >
          Your email (optional, won't be displayed)
        </label>
        <input
          id="t-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="t-message"
          className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
        >
          Your testimony
        </label>
        <textarea
          id="t-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "submitting"}
          className="w-full rounded border border-ydm-line bg-white px-3 py-2 font-serif text-base leading-relaxed text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
        />
        <p className="m-0 mt-1 text-xs text-ydm-muted">
          {message.length} / 2000
        </p>
      </div>

      {status === "error" && errorMsg ? (
        <p
          role="alert"
          className="m-0 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorMsg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink transition hover:bg-ydm-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? "Submitting…" : "Share my testimony"}
      </button>

      <p className="m-0 mt-2 font-serif text-xs text-ydm-muted">
        All testimonies are reviewed before appearing publicly. Your email
        won't be shown.
      </p>
    </form>
  );
}
