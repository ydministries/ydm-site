"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

interface NewsletterFormProps {
  /** Where on the site this form is placed — stored on the subscriber row. */
  source?: string;
}

export function NewsletterForm({ source = "home" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bots fill this; humans don't
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setErrorMsg("");
    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(
          data.error ?? "Something went wrong — please try again.",
        );
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("[NewsletterForm] submit failed:", err);
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto mt-6 max-w-md rounded-full bg-ydm-gold/15 px-6 py-4 text-center">
        <p className="m-0 font-serif text-base text-ydm-ink">
          Thank you for subscribing! Watch for a welcome email shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={onSubmit}
      noValidate
    >
      {/* Honeypot — visually hidden, off-screen, never tabbed to. Bots fill it; humans skip it. */}
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
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "submitting"}
        aria-describedby={status === "error" ? "newsletter-error" : undefined}
        className="w-full rounded-full border border-ydm-line bg-ydm-cream px-5 py-3 text-base text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:bg-ydm-surface focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink no-underline transition hover:bg-ydm-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && errorMsg ? (
        <p
          id="newsletter-error"
          role="alert"
          className="m-0 mt-2 w-full text-center font-serif text-sm text-red-700 sm:absolute sm:mt-16"
        >
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
