// HAND-AUTHORED — product detail page. Slug-routed; resolves via Printful
// product list at request time. Server component delegates the interactive
// 2-column block (image + variant select + buy) to ProductView.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, isPrintfulConfigured } from "@/lib/printful";
import { ProductView } from "./ProductView";

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

  return (
    <section className="bg-ydm-surface py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
        <Link
          href="/shop"
          className="inline-block font-accent text-xs uppercase tracking-wider text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← Back to shop
        </Link>

        <ProductView product={product} />
      </div>
    </section>
  );
}
