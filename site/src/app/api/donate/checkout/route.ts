import { type NextRequest, NextResponse } from "next/server";
import {
  CUSTOM_MAX_CAD,
  CUSTOM_MIN_CAD,
  DONATION_TIERS_CAD,
  SITE_URL,
  getStripe,
} from "@/lib/stripe";

interface CheckoutPayload {
  amount?: number; // in CAD whole dollars
  honeypot?: string;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Recurring donations are not yet enabled. Please use the Interac e-Transfer option for now.",
      },
      { status: 503 },
    );
  }

  let body: CheckoutPayload;
  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — silent success for bots
  if (body.honeypot && body.honeypot.length > 0) {
    return NextResponse.json({ url: SITE_URL });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < CUSTOM_MIN_CAD || amount > CUSTOM_MAX_CAD) {
    return NextResponse.json(
      {
        error: `Please choose an amount between $${CUSTOM_MIN_CAD} and $${CUSTOM_MAX_CAD} per month.`,
      },
      { status: 400 },
    );
  }

  // Allow the preset amounts AND any whole-dollar value within range. Bishop
  // wanted custom amounts; we don't restrict to the tier list.
  const allowedAmounts = new Set<number>(
    DONATION_TIERS_CAD.map((t) => t.amount),
  );
  // Always allow custom too, but log if it's not on the tier list (helps
  // spot abnormal spam patterns later).
  if (!allowedAmounts.has(amount)) {
    console.log("[donate/checkout] custom amount used:", amount);
  }

  // Stripe requires `unit_amount` in the smallest currency unit (cents).
  const unitAmount = Math.round(amount * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: unitAmount,
            recurring: { interval: "month" },
            product_data: {
              name: "Monthly support — Yeshua Deliverance Ministries",
              description:
                "Recurring monthly donation to support the YDM mission.",
            },
          },
        },
      ],
      success_url: `${SITE_URL}/give/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/give?canceled=1`,
      // Subscription metadata lets the webhook find/update the row.
      metadata: { ydm_method: "stripe", ydm_amount_cad: String(amount) },
      subscription_data: {
        metadata: { ydm_method: "stripe", ydm_amount_cad: String(amount) },
      },
      // Tax collection / billing address: Canadian charities frequently
      // need address for receipts. Collect on the Stripe side.
      billing_address_collection: "required",
      // Allow promotion codes if Bishop ever runs a campaign.
      allow_promotion_codes: false,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe didn't return a checkout URL." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[donate/checkout] Stripe error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown Stripe error";
    return NextResponse.json(
      { error: `Couldn't start checkout — ${message}` },
      { status: 500 },
    );
  }
}
