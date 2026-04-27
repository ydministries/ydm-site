"use client";

export function NewsletterForm() {
  return (
    <form
      className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="w-full rounded-full border border-ydm-line bg-ydm-cream px-5 py-3 text-base text-ydm-ink placeholder:text-ydm-muted focus:border-ydm-gold focus:bg-ydm-surface focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink no-underline transition hover:bg-ydm-gold/90"
      >
        Subscribe
      </button>
    </form>
  );
}
