import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook handler.
 *
 * Configures in Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *   URL:   https://ydministries.ca/api/stripe/webhook
 *   Events:
 *     - checkout.session.completed   (new subscription started)
 *     - invoice.paid                 (recurring monthly charge succeeded)
 *     - invoice.payment_failed       (recurring charge failed — donor may be lapsing)
 *     - customer.subscription.deleted (donor canceled)
 *
 * Copy the signing secret into env as STRIPE_WEBHOOK_SECRET.
 *
 * Persistence:
 * - On checkout.session.completed: insert a donations row tied to the
 *   stripe_session_id. Status='succeeded' for the first monthly charge
 *   (Checkout completes only after the first invoice is paid).
 * - On invoice.paid: insert a NEW donations row for the recurring charge
 *   (one per month — gives bishop a clean ledger of recurring giving).
 * - On invoice.payment_failed: update the matching subscription's most
 *   recent row to status='failed' (donor will retry per Stripe's smart
 *   retry schedule).
 * - On subscription.deleted: log a 'canceled' row so admin sees the
 *   gap immediately.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.warn(
      "[stripe/webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing — webhook disabled",
    );
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Stripe needs the RAW body for signature verification.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    const msg = err instanceof Error ? err.message : "Bad signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;
        const amountCad = session.amount_total ?? 0; // in cents
        const currency = (session.currency ?? "cad").toUpperCase();
        const email =
          session.customer_details?.email ?? session.customer_email ?? null;
        const name = session.customer_details?.name ?? null;

        const { error } = await sb.from("donations").insert({
          stripe_session_id: session.id,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          donor_name: name,
          donor_email: email,
          amount_cad: amountCad,
          currency,
          is_recurring: true,
          interval: "month",
          status: "succeeded",
          method: "stripe",
        });
        if (error)
          console.error("[stripe/webhook] insert (checkout) failed:", error);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // Skip the FIRST invoice — that's already captured by
        // checkout.session.completed (Stripe fires both for new
        // subscriptions). billing_reason='subscription_create' identifies
        // the first one.
        if (invoice.billing_reason === "subscription_create") break;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;
        const amountCad = invoice.amount_paid ?? 0;
        const currency = (invoice.currency ?? "cad").toUpperCase();
        const email = invoice.customer_email ?? null;
        const name = invoice.customer_name ?? null;

        const { error } = await sb.from("donations").insert({
          stripe_session_id: `invoice_${invoice.id}`, // unique-enough placeholder
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          donor_name: name,
          donor_email: email,
          amount_cad: amountCad,
          currency,
          is_recurring: true,
          interval: "month",
          status: "succeeded",
          method: "stripe",
        });
        if (error)
          console.error("[stripe/webhook] insert (invoice.paid) failed:", error);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (!subscriptionId) break;

        // Mark the most recent donation row for this subscription as failed.
        const { error } = await sb
          .from("donations")
          .update({ status: "failed" })
          .eq("stripe_subscription_id", subscriptionId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (error)
          console.error(
            "[stripe/webhook] update (payment_failed) failed:",
            error,
          );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Log a zero-amount 'canceled' marker so admin sees the cancel
        // event in the donations history.
        const { error } = await sb.from("donations").insert({
          stripe_session_id: `canceled_${sub.id}`,
          stripe_subscription_id: sub.id,
          stripe_customer_id:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          amount_cad: 0,
          currency: "CAD",
          is_recurring: true,
          interval: "month",
          status: "refunded", // closest existing enum value to "canceled"
          method: "stripe",
        });
        if (error)
          console.error(
            "[stripe/webhook] insert (subscription deleted) failed:",
            error,
          );
        break;
      }

      default:
        // Unhandled event type — just ack so Stripe doesn't retry.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler crashed:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
