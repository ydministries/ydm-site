import Stripe from "stripe";

/**
 * Server-only Stripe client. Returns null if `STRIPE_SECRET_KEY` is not
 * configured, so callers can gracefully degrade (e.g., the donate page
 * shows the Interac path only and a "monthly recurring setup pending"
 * note when Stripe isn't wired up yet).
 *
 * Never import this from a client component.
 */
let _client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _client = new Stripe(key, {
    // Pin a recent stable API version so behavior is deterministic across
    // SDK upgrades. Update intentionally when Stripe ships breaking changes.
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
  return _client;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Public site URL used for Stripe Checkout success/cancel redirects. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

/**
 * Donation tier presets in CAD. Bishop can adjust copy via admin/content
 * later, but the amounts are wired here for safety (no DB → no risk of
 * tampering with the price the user sees vs the price Stripe charges).
 */
export const DONATION_TIERS_CAD = [
  { amount: 25, label: "$25 / month", note: "A meaningful gift" },
  { amount: 50, label: "$50 / month", note: "Sustains a ministry" },
  { amount: 100, label: "$100 / month", note: "Powers the mission" },
  { amount: 250, label: "$250 / month", note: "Builds the work" },
] as const;

/** Min and max one-shot custom amounts in CAD. */
export const CUSTOM_MIN_CAD = 5;
export const CUSTOM_MAX_CAD = 5000;
