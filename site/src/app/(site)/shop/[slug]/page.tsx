// HAND-AUTHORED — product detail page. Slug-routed; resolves via Printful
// product list at request time.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, isPrintfulConfigured } from "@/lib/printful";
import { BuyNow } from "./BuyNow";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isPrintfulConfigured()) {
    return { title: "Shop — Yeshua Deliverance Ministries" };
  }
  const product = await getProductBySlug(slug);
  if (!product)
    return { title: "Product not found — Yeshua Deliverance Ministries" };
  return {
    title: `${product.sync_product.name} — YDM Shop`,
    description: `Order the ${product.sync_product.name} from the YDM apparel collection.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isPrintfulConfigured()) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const heroImage =
    product.sync_variants[0]?.files?.find((f) => f.type === "preview")
      ?.preview_url ??
    product.sync_variants[0]?.product?.image ??
    product.sync_product.thumbnail_url;

  // Gather all unique preview images across variants for the gallery.
  const galleryImages = Array.from(
    new Set(
      product.sync_variants
        .flatMap((v) => v.files)
        .filter((f) => f.type === "preview" && f.preview_url)
        .map((f) => f.preview_url),
    ),
  ).slice(0, 6);

  return (
    <section className="bg-ydm-surface py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
        <Link
          href="/shop"
          className="inline-block font-accent text-xs uppercase tracking-wider text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← Back to shop
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image column */}
          <div>
            {heroImage ? (
              <div className="overflow-hidden rounded-lg bg-ydm-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={product.sync_product.name}
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : (
              <div
                className="aspect-square w-full rounded-lg bg-gradient-to-br from-ydm-gold/40 to-ydm-amber/30"
                aria-hidden
              />
            )}
            {galleryImages.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {galleryImages.slice(1, 5).map((src) => (
                  <div
                    key={src}
                    className="overflow-hidden rounded bg-ydm-cream"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Detail column */}
          <div>
            <p className="m-0 mb-2 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
              YDM Apparel
            </p>
            <h1 className="m-0 mb-6 font-display text-4xl uppercase leading-tight tracking-wide text-ydm-ink sm:text-5xl">
              {product.sync_product.name}
            </h1>

            <BuyNow
              productName={product.sync_product.name}
              variants={product.sync_variants}
            />

            <hr className="my-8 border-ydm-line" />

            <h2 className="m-0 mb-3 font-display text-base uppercase tracking-wide text-ydm-ink">
              How it works
            </h2>
            <ol className="m-0 list-decimal space-y-2 pl-5 font-serif text-sm leading-relaxed text-ydm-text">
              <li>
                Choose your size/style and click <strong>Buy now</strong>
              </li>
              <li>
                Pay securely via Stripe (Visa, Mastercard, Amex, Apple Pay,
                Google Pay)
              </li>
              <li>
                Printful prints and ships directly to you. Standard delivery
                is typically 5–10 business days within Canada / US, longer
                international.
              </li>
              <li>
                You'll receive shipping confirmation by email when your order
                leaves the warehouse.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
