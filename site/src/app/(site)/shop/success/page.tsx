// HAND-AUTHORED — Stripe Checkout success-redirect for shop orders.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order received — Yeshua Deliverance Ministries",
  description: "Thank you for supporting YDM through the shop.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ShopSuccessPage() {
  return (
    <section className="-mx-4 bg-ydm-cream py-20 sm:-mx-6 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
          ORDER RECEIVED
        </p>
        <p className="m-0 mb-4 font-script text-5xl text-ydm-amber sm:text-6xl">
          Thank you
        </p>
        <h1 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
          Your order is on its way
        </h1>
        <div className="mx-auto mb-6 h-1 w-16 bg-ydm-gold" aria-hidden />
        <p className="m-0 mb-4 font-serif text-lg leading-relaxed text-ydm-text">
          Stripe has emailed you a receipt. Printful prints and ships your
          item directly — you'll receive shipping confirmation by email when
          it leaves the warehouse, typically within a few business days.
        </p>
        <p className="m-0 mb-8 font-serif text-base leading-relaxed text-ydm-text">
          Questions about your order? Reply to your receipt email or contact{" "}
          <a
            href="mailto:shop@ydministries.ca"
            className="text-ydm-ink underline"
          >
            shop@ydministries.ca
          </a>
          .
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink no-underline transition hover:bg-ydm-gold/90"
          >
            Continue shopping
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
