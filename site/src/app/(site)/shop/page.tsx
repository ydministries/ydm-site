// HAND-AUTHORED — public shop catalog. Fetches the YDM Printful catalog
// at request time with 5-min revalidation; gracefully degrades when
// PRINTFUL_API_KEY is unset or the catalog is empty.
import type { Metadata } from "next";
import Link from "next/link";
import {
  isPrintfulConfigured,
  listProducts,
  slugifyName,
} from "@/lib/printful";

export const metadata: Metadata = {
  title: "Shop — Yeshua Deliverance Ministries",
  description:
    "Apparel and merchandise from Yeshua Deliverance Ministries. Wear your faith.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const configured = isPrintfulConfigured();
  const products = configured ? await listProducts() : [];

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            APPAREL & MERCH
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Wear your faith
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Shop
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Each item is made-to-order on demand by Printful, then shipped
            directly to you. Proceeds support the ministry.
          </p>
        </div>
      </section>

      <div
        role="status"
        className="-mx-4 border-y-2 border-ydm-gold bg-ydm-cream py-4 sm:-mx-6"
      >
        <p className="m-0 mx-auto max-w-4xl px-4 text-center font-serif text-sm leading-relaxed text-ydm-ink sm:px-6 sm:text-base">
          Our online shop is taking a brief pause while we finalize payment
          setup. Browse our products below — purchasing will be available
          again soon.
        </p>
      </div>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {!configured ? (
            <div className="mx-auto max-w-2xl rounded-lg border border-ydm-line bg-ydm-cream p-10 text-center">
              <p className="m-0 mb-3 font-display text-2xl uppercase tracking-wide text-ydm-ink">
                Shop opening soon
              </p>
              <p className="m-0 font-serif text-base leading-relaxed text-ydm-text">
                We're getting the YDM apparel and merchandise store ready.
                Check back shortly, or sign up for the newsletter at the
                bottom of any page and we'll let you know when it goes live.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-lg border border-ydm-line bg-ydm-cream p-10 text-center">
              <p className="m-0 mb-3 font-display text-2xl uppercase tracking-wide text-ydm-ink">
                No products yet
              </p>
              <p className="m-0 font-serif text-base leading-relaxed text-ydm-text">
                Items are being designed. Watch this page — new pieces drop
                regularly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const slug = slugifyName(p.name);
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${slug}`}
                    className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                  >
                    {p.thumbnail_url ? (
                      <div className="relative aspect-square w-full overflow-hidden bg-ydm-ink/10">
                        {/* Printful URLs use various hosts; allow them. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.thumbnail_url}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-square w-full bg-gradient-to-br from-ydm-gold/40 to-ydm-amber/30"
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                        {p.name}
                      </h3>
                      <p className="m-0 mt-auto font-accent text-xs uppercase tracking-wider text-ydm-muted">
                        {p.variants} variant{p.variants === 1 ? "" : "s"}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 font-accent text-sm font-semibold text-ydm-gold no-underline group-hover:underline">
                        View <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
