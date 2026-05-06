// HAND-AUTHORED — Stripe Checkout success-redirect destination.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank you — Yeshua Deliverance Ministries",
  description:
    "Thank you for your monthly partnership with Yeshua Deliverance Ministries.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GiveThanksPage(props: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  // We accept session_id but don't currently look it up — the webhook is
  // the source of truth and will record the donation in `donations`. The
  // page is just a confirmation surface.
  await props.searchParams;

  return (
    <section className="-mx-4 bg-ydm-cream py-20 sm:-mx-6 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
          GIFT RECEIVED
        </p>
        <p className="m-0 mb-4 font-script text-5xl text-ydm-amber sm:text-6xl">
          Thank you
        </p>
        <h1 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
          Your monthly partnership has begun
        </h1>
        <div className="mx-auto mb-6 h-1 w-16 bg-ydm-gold" aria-hidden />
        <p className="m-0 mb-4 font-serif text-lg leading-relaxed text-ydm-text">
          Stripe will email you a receipt for your first month's gift, and
          one for every month following. You can manage or cancel your
          subscription anytime from the link in those receipts.
        </p>
        <p className="m-0 mb-8 font-serif text-base leading-relaxed text-ydm-text">
          Bishop Wilson and the YDM family thank you. Your generosity moves
          this mission forward.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sermons"
            className="rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink no-underline transition hover:bg-ydm-gold/90"
          >
            Listen to a recent sermon
          </Link>
          <Link
            href="/"
            className="rounded-full border border-ydm-line bg-ydm-surface px-7 py-3 text-base font-medium text-ydm-ink no-underline transition hover:border-ydm-gold"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
