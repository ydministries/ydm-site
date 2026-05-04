"use client";

import { useState, type FormEvent } from "react";

const TO = "YDMinistries48@gmail.com";

const REASON_GROUPS: { group: string; options: string[] }[] = [
  {
    group: "Spiritual & Personal Care",
    options: [
      "Prayer Request",
      "Pastoral Care & Counseling",
      "Testimony",
      "Baptism & Membership",
    ],
  },
  {
    group: "Ministry & Discipleship",
    options: [
      "Bible Study Question",
      "Volunteer / Serve",
      "Sunday Service",
      "Ministry Question",
    ],
  },
  {
    group: "Partnership & Legacy",
    options: [
      "Donations & Partnership",
      "Sponsor an Event",
      "Media / Press",
      "Building Fund",
    ],
  },
  {
    group: "General & Technical",
    options: ["Website Feedback", "General Inquiry"],
  },
];

const PLACEHOLDERS: Record<string, string> = {
  "Prayer Request": "How can we pray for you today?",
  "Testimony": "Tell us how God has worked in your life through YDM…",
  "Volunteer / Serve": "Tell us about your gifts and how you'd like to serve…",
  "Pastoral Care & Counseling": "Share what's on your heart, in confidence…",
};
const DEFAULT_PLACEHOLDER = "Your message…";

const SUCCESS_MESSAGES: Record<string, string> = {
  "Prayer Request":
    "Thank you for sharing your heart with us. Bishop, the elders, and the YDM prayer team will lift your request before the Lord.",
  "Testimony":
    "Thank you for your testimony! A member of our team will reach out soon.",
  "Volunteer / Serve":
    "Thank you for your willingness to serve! Our team will be in touch.",
  "Pastoral Care & Counseling":
    "Thank you for reaching out. Bishop or one of the elders will follow up personally and confidentially.",
  "Donations & Partnership":
    "Thank you for your generosity. Our partnership team will respond shortly.",
};
const DEFAULT_SUCCESS = "Thank you for contacting YDM. We'll be in touch soon.";

const inputClass =
  "w-full rounded-sm border border-ydm-line bg-white px-4 py-3 font-serif text-base text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:outline-none focus:ring-2 focus:ring-ydm-gold/30";
const labelClass =
  "mb-2 block font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const placeholder = PLACEHOLDERS[form.reason] ?? DEFAULT_PLACEHOLDER;

  const reset = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", reason: "", message: "" });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    const reason = form.reason || "General Inquiry";
    const subject = `Contact: ${reason} — ${form.name}`;
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      `Reason: ${reason}`,
      "",
      "Message:",
      form.message,
    ].filter(Boolean);
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    const successMsg = SUCCESS_MESSAGES[form.reason] ?? DEFAULT_SUCCESS;
    return (
      <div className="mt-4 rounded-sm border border-ydm-gold bg-ydm-gold/10 p-10 text-center">
        <div className="mb-4 text-4xl" aria-hidden>
          ✉️
        </div>
        <h3 className="m-0 mb-2 font-display text-2xl uppercase text-ydm-ink">
          Message Sent!
        </h3>
        <p className="m-0 mb-6 font-serif text-base leading-relaxed text-ydm-text">
          {successMsg}
        </p>
        <button
          type="button"
          onClick={reset}
          className="font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold hover:text-ydm-amber"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5" noValidate>
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name <span className="text-ydm-gold">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email <span className="text-ydm-gold">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          Phone Number
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-reason" className={labelClass}>
          Reason for Contact
        </label>
        <select
          id="contact-reason"
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%231d1d1d%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] bg-[length:18px_18px] bg-[right_14px_center] bg-no-repeat pr-10`}
        >
          <option value="">Select a reason…</option>
          {REASON_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-ydm-gold">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          required
          placeholder={placeholder}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink transition-colors hover:bg-ydm-gold-light disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
