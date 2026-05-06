import { type NextRequest, NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";
import { getProductById, isPrintfulConfigured } from "@/lib/printful";

interface CheckoutPayload {
  syncVariantId?: number;
  productName?: string;
}

/**
 * Creates a Stripe Checkout Session for a single shop item (one quantity).
 * Cart-of-multiple-items is v2; v1 is one-product-at-a-time Buy Now.
 *
 * Flow:
 * 1. Validate Stripe + Printful are both configured
 * 2. Look up the variant from Printful's sync product API to confirm it
 *    exists and to get the canonical retail price (don't trust client)
 * 3. Create Stripe Checkout Session in `payment` mode (one-time, NOT
 *    subscription) with shipping address collection enabled
 * 4. Return the Stripe URL; client redirects
 *
 * After checkout success, /api/stripe/webhook handles the
 * `checkout.session.completed` event with mode='payment' and creates the
 * Printful order via createPrintfulOrder().
 */
export async function POST(req: NextRequest) {
  // Hard gate — set SHOP_CHECKOUT_ENABLED=false in Vercel Production while
  // Stripe live-mode verification is pending. Defense-in-depth alongside
  // the disabled buy button in /shop/[slug] (see HANDOVER.md "Known issues"
  // for the full re-enable runbook).
  const checkoutEnabled = process.env.SHOP_CHECKOUT_ENABLED !== "false";
  if (!checkoutEnabled) {
    return new Response(
      JSON.stringify({
        error: "Shop checkout is temporarily unavailable. We'll be back soon.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Shop checkout is temporarily disabled. Try again later." },
      { status: 503 },
    );
  }
  if (!isPrintfulConfigured()) {
    return NextResponse.json(
      { error: "Shop is not yet configured." },
      { status: 503 },
    );
  }

  let body: CheckoutPayload;
  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const variantId = Number(body.syncVariantId);
  if (!Number.isFinite(variantId) || variantId <= 0) {
    return NextResponse.json(
      { error: "Invalid product variant." },
      { status: 400 },
    );
  }

  // Find the parent product → confirm the variant exists. We don't have a
  // direct "variant lookup by id" endpoint without the parent, so we list
  // products and search. Small catalogs make this fine.
  // Faster path: try to look up the variant directly by trying products
  // until we find it. Since the catalog is small, list-then-find is OK.
  const { listProducts } = await import("@/lib/printful");
  const products = await listProducts();
  let resolvedProductId: number | null = null;
  for (const p of products) {
    const detail = await getProductById(p.id);
    const variant = detail?.sync_variants.find((v) => v.id === variantId);
    if (variant) {
      resolvedProductId = p.id;
      // Got it. Use this variant's data.
      const unitAmount = Math.round(Number(variant.retail_price) * 100);
      const currency = variant.currency.toLowerCase();
      const productName =
        (body.productName ?? detail!.sync_product.name).slice(0, 200);
      const variantName = variant.name.slice(0, 200);
      const image =
        variant.files.find((f) => f.type === "preview")?.preview_url ??
        variant.product?.image ??
        detail!.sync_product.thumbnail_url;

      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: unitAmount,
                product_data: {
                  name: `${productName} — ${variantName}`,
                  images: image ? [image] : undefined,
                  metadata: {
                    printful_sync_variant_id: String(variantId),
                  },
                },
              },
            },
          ],
          // Stripe handles the shipping rates UI; we configure flat rates
          // in Stripe Dashboard if Bishop wants. For v1 we let Stripe
          // collect address with shipping_address_collection only — the
          // shop owner can add shipping rates later via Stripe.
          shipping_address_collection: {
            allowed_countries: ["CA", "US", "GB", "AU", "NZ"],
          },
          phone_number_collection: { enabled: true },
          success_url: `${SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${SITE_URL}/shop`,
          metadata: {
            ydm_kind: "shop",
            printful_sync_variant_id: String(variantId),
            printful_sync_product_id: String(resolvedProductId),
          },
          payment_intent_data: {
            metadata: {
              ydm_kind: "shop",
              printful_sync_variant_id: String(variantId),
            },
          },
        });

        if (!session.url) {
          return NextResponse.json(
            { error: "Stripe didn't return a checkout URL." },
            { status: 500 },
          );
        }
        return NextResponse.json({ url: session.url });
      } catch (err) {
        console.error("[shop/checkout] Stripe error:", err);
        const message =
          err instanceof Error ? err.message : "Unknown Stripe error";
        return NextResponse.json(
          { error: `Couldn't start checkout — ${message}` },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json(
    { error: "Product not found." },
    { status: 404 },
  );
}
