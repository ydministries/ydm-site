/**
 * Printful API wrapper — fetches the YDM store's product catalog using
 * Printful's "Sync products" endpoints (these are the products Bishop has
 * actually configured and priced for sale, not the global Printful catalog).
 *
 * Docs: https://www.printful.com/docs/index.php?action=show&cat=products
 *
 * Requires `PRINTFUL_API_KEY` in env. Without it, listProducts returns
 * an empty array and the /shop catalog gracefully degrades to a "Shop
 * coming soon" state.
 *
 * Caching: we use Next.js fetch revalidation (300s = 5 min) so the catalog
 * stays fast without a Supabase sync layer. Bishop can hard-refresh by
 * waiting 5 min after a Printful change.
 */

const PRINTFUL_BASE = "https://api.printful.com";
const REVALIDATE_SECS = 300;

export function isPrintfulConfigured(): boolean {
  return !!process.env.PRINTFUL_API_KEY;
}

interface PrintfulResp<T> {
  code: number;
  result: T;
  error?: { reason: string; message: string };
}

async function pf<T>(path: string): Promise<T | null> {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${PRINTFUL_BASE}${path}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: REVALIDATE_SECS },
    });
    const json = (await res.json()) as PrintfulResp<T>;
    if (!res.ok || json.code !== 200) {
      console.error(`[printful] ${path} failed:`, json.error ?? json);
      return null;
    }
    return json.result;
  } catch (err) {
    console.error(`[printful] ${path} threw:`, err);
    return null;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface SyncProductSummary {
  id: number;
  external_id: string | null;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface SyncVariant {
  id: number;
  external_id: string | null;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number; // Printful catalog variant id
  retail_price: string; // "29.99"
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: Array<{
    id: number;
    type: string;
    preview_url: string;
    thumbnail_url: string;
  }>;
  options: Array<{ id: string; value: string | string[] }>;
}

export interface SyncProductDetail {
  sync_product: SyncProductSummary;
  sync_variants: SyncVariant[];
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * List all sync products configured in the YDM Printful store.
 *
 * Note on filtering: we only filter out products with `synced === 0`
 * (no synced variants — they have nothing to display or sell). We do NOT
 * filter on `is_ignored` because that flag's behavior was inconsistent —
 * some products marked ignored in Printful's UI still belonged in the
 * catalog. Mikey reported "only 4 of multiple products showing" 2026-05-06;
 * relaxing the filter to `synced > 0` solved it.
 *
 * If a product appears here that bishop wants hidden, the cleanest path is
 * to delete (or archive) it in the Printful dashboard rather than relying
 * on `is_ignored`.
 */
export async function listProducts(): Promise<SyncProductSummary[]> {
  if (!isPrintfulConfigured()) return [];
  // /sync/products is the OAuth-token-scope-friendly path. /store/products
  // exists too but requires stores_list/read which isn't on the default
  // store-scoped token Bishop is using.
  const result = await pf<SyncProductSummary[]>("/sync/products?limit=100");
  if (!result) return [];
  return result.filter((p) => p.synced > 0);
}

/** Fetch full product detail (sync_product + variants) by Printful ID. */
export async function getProductById(
  id: number,
): Promise<SyncProductDetail | null> {
  if (!isPrintfulConfigured()) return null;
  return pf<SyncProductDetail>(`/sync/products/${id}`);
}

/**
 * Fetch product by slug. Slug = lowercased, dashed product name. We don't
 * persist slugs in Supabase (no products table sync), so we list all
 * products and find the matching one. With a small catalog this is fine
 * (tens of products max). If the catalog grows, switch to a slug→id map.
 */
export async function getProductBySlug(
  slug: string,
): Promise<SyncProductDetail | null> {
  const all = await listProducts();
  const match = all.find((p) => slugifyName(p.name) === slug);
  if (!match) return null;
  return getProductById(match.id);
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Cheapest variant retail price on the product (used as the "from $X" badge
 * on the catalog grid). Returns null if no variants are available.
 */
export function priceFromCheapestVariant(
  variants: SyncVariant[],
): { amount: number; currency: string } | null {
  if (!variants.length) return null;
  const sorted = [...variants].sort(
    (a, b) => Number(a.retail_price) - Number(b.retail_price),
  );
  return {
    amount: Math.round(Number(sorted[0].retail_price) * 100), // cents
    currency: sorted[0].currency.toUpperCase(),
  };
}

/**
 * Format price for display: 2999 + "USD" → "$29.99 USD"
 */
export function formatMoney(cents: number, currency: string): string {
  const n = (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency,
  });
  return n;
}

/**
 * Create an order in the YDM Printful store. Called from the Stripe webhook
 * after `checkout.session.completed` for a shop session. Uses the recipient
 * info Stripe collected (Stripe collects shipping address; we pass it
 * through). Returns the Printful order id on success, null otherwise.
 *
 * NOTE: this just CREATES the order in 'draft' state. To auto-fulfill,
 * pass `confirm: true` in the body OR use Printful's auto-confirm setting.
 * For v1 we leave them as drafts so Bishop can review in the Printful
 * dashboard before confirming. He can flip auto-confirm on later.
 */
export async function createPrintfulOrder(input: {
  recipient: {
    name: string;
    address1: string;
    address2?: string | null;
    city: string;
    state_code?: string | null;
    country_code: string;
    zip: string;
    email?: string | null;
    phone?: string | null;
  };
  items: Array<{
    sync_variant_id: number;
    quantity: number;
    retail_price?: string;
  }>;
  external_id?: string; // we pass the Stripe session id
}): Promise<{ id: number } | null> {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${PRINTFUL_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: input.external_id,
        recipient: input.recipient,
        items: input.items,
      }),
    });
    const json = (await res.json()) as PrintfulResp<{ id: number }>;
    if (!res.ok || json.code !== 200) {
      console.error("[printful] createOrder failed:", json.error ?? json);
      return null;
    }
    return json.result;
  } catch (err) {
    console.error("[printful] createOrder threw:", err);
    return null;
  }
}
