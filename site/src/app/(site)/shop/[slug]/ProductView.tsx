"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney, type SyncProductDetail, type SyncVariant } from "@/lib/printful";

interface ProductViewProps {
  product: SyncProductDetail;
}

type Status = "idle" | "submitting" | "error";

/**
 * Two-column product detail UI. Owns the selected-variant state so the
 * hero mockup image and the price both update when the dropdown changes.
 *
 * Hero image priority for a given variant:
 *   1. variant.files[type='preview'].preview_url   — variant-specific mockup
 *   2. variant.product.image                        — variant fallback
 *   3. product.sync_product.thumbnail_url           — product-level fallback
 */
export function ProductView({ product }: ProductViewProps) {
  const variants = product.sync_variants;
  const productName = product.sync_product.name;

  const [variantId, setVariantId] = useState<number | null>(
    variants[0]?.id ?? null,
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  // Lightbox state — null = closed; number = index into the gallery array.
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? null,
    [variants, variantId],
  );

  const heroImage = useMemo(() => imageForVariant(selected, product), [
    selected,
    product,
  ]);

  // Gallery thumbnails: unique preview images across all variants. Clicking
  // a thumb selects the variant it belongs to so customers can browse styles
  // visually instead of by dropdown name.
  const gallery = useMemo(() => collectGallery(variants), [variants]);

  // ── Lightbox controls ─────────────────────────────────────────────────
  const openLightboxForUrl = useCallback(
    (url: string | null) => {
      if (!url) return;
      const idx = gallery.findIndex((g) => g.previewUrl === url);
      setLightboxIdx(idx >= 0 ? idx : 0);
    },
    [gallery],
  );

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const nextLightbox = useCallback(() => {
    setLightboxIdx((i) =>
      i === null || gallery.length === 0 ? null : (i + 1) % gallery.length,
    );
  }, [gallery.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIdx((i) =>
      i === null || gallery.length === 0
        ? null
        : (i - 1 + gallery.length) % gallery.length,
    );
  }, [gallery.length]);

  // While lightbox is open: keyboard nav + body scroll lock + sync
  // selected variant to the lightbox image so closing leaves the user
  // on the same color they were viewing.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const entry = gallery[lightboxIdx];
    if (entry && entry.variantId !== variantId) {
      setVariantId(entry.variantId);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextLightbox();
      else if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, gallery, variantId, closeLightbox, nextLightbox, prevLightbox]);

  async function onBuy() {
    if (!selected) return;
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncVariantId: selected.id,
          productName,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start checkout.");
        setStatus("error");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[ProductView] checkout failed:", err);
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  const lightboxEntry = lightboxIdx !== null ? gallery[lightboxIdx] : null;

  return (
    <>
    <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
      {/* Image column — reactive to selected variant. Click hero or
          thumbs to open a fullscreen lightbox with prev/next/keyboard nav. */}
      <div>
        {heroImage ? (
          <button
            type="button"
            onClick={() => openLightboxForUrl(heroImage)}
            className="block w-full cursor-zoom-in overflow-hidden rounded-lg bg-ydm-cream p-0 transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold focus-visible:ring-offset-2"
            aria-label={`Enlarge ${selected?.name ?? productName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={heroImage}
              src={heroImage}
              alt={selected?.name ?? productName}
              className="block h-auto w-full object-contain"
            />
          </button>
        ) : (
          <div
            className="aspect-square w-full rounded-lg bg-gradient-to-br from-ydm-gold/40 to-ydm-amber/30"
            aria-hidden
          />
        )}
        {gallery.length > 1 ? (
          <>
            <p className="m-0 mt-4 mb-2 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
              Tap a color to switch · double-tap or click hero to enlarge
            </p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {gallery.map((g) => {
                const active = g.previewUrl === heroImage;
                return (
                  <button
                    key={g.previewUrl}
                    type="button"
                    onClick={() => {
                      // First click selects the variant. Second click on
                      // the already-selected thumb opens the lightbox.
                      if (active) {
                        openLightboxForUrl(g.previewUrl);
                      } else {
                        setVariantId(g.variantId);
                      }
                    }}
                    className={`overflow-hidden rounded bg-ydm-cream transition-all ${
                      active
                        ? "ring-2 ring-ydm-gold ring-offset-2"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`Show ${g.variantName}${active ? " — click again to enlarge" : ""}`}
                    title={g.variantName}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* Detail column */}
      <div>
        <p className="m-0 mb-2 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
          YDM Apparel
        </p>
        <h1 className="m-0 mb-6 font-display text-4xl uppercase leading-tight tracking-wide text-ydm-ink sm:text-5xl">
          {productName}
        </h1>

        {variants.length === 0 ? (
          <p className="m-0 rounded border border-ydm-line bg-ydm-cream p-4 text-sm text-ydm-muted">
            No variants available right now.
          </p>
        ) : (
          <div className="space-y-5">
            {variants.length > 1 ? (
              <div>
                <label
                  htmlFor="variant"
                  className="mb-1 block font-accent text-xs uppercase tracking-wider text-ydm-muted"
                >
                  Choose option
                </label>
                <select
                  id="variant"
                  value={variantId ?? ""}
                  onChange={(e) => setVariantId(Number(e.target.value))}
                  disabled={status === "submitting"}
                  className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-base text-ydm-ink focus:border-ydm-gold focus:outline-none disabled:opacity-60"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} —{" "}
                      {formatMoney(
                        Math.round(Number(v.retail_price) * 100),
                        v.currency.toUpperCase(),
                      )}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <p className="m-0 font-accent text-xs uppercase tracking-wider text-ydm-muted">
                Price
              </p>
              <p className="m-0 font-display text-3xl text-ydm-ink">
                {selected
                  ? formatMoney(
                      Math.round(Number(selected.retail_price) * 100),
                      selected.currency.toUpperCase(),
                    )
                  : "—"}
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="m-0 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onBuy}
              disabled={!selected || status === "submitting"}
              className="w-full rounded-full bg-ydm-gold px-7 py-3 text-base font-semibold text-ydm-ink transition hover:bg-ydm-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting"
                ? "Redirecting to checkout…"
                : "Buy now (1 item)"}
            </button>

            <p className="m-0 text-center font-serif text-xs leading-relaxed text-ydm-muted">
              Secure checkout via Stripe · Made-to-order by Printful · Ships
              directly to you
            </p>
          </div>
        )}

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
            Your item is custom made and ships directly to you. Standard
            delivery is typically 5–10 business days within Canada / US,
            longer international.
          </li>
          <li>
            You'll receive shipping confirmation by email when your order
            leaves the warehouse.
          </li>
        </ol>
      </div>
    </div>

    {/* Lightbox overlay */}
    {lightboxEntry ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} — ${lightboxEntry.variantName}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold"
          aria-label="Close"
        >
          ×
        </button>

        {gallery.length > 1 ? (
          <button
            type="button"
            onClick={prevLightbox}
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold sm:left-6"
            aria-label="Previous"
          >
            ‹
          </button>
        ) : null}

        <div className="relative max-h-full max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxEntry.previewUrl}
            alt={lightboxEntry.variantName}
            className="block h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
          />
          <p className="m-0 mt-3 text-center font-display text-base uppercase tracking-wide text-white">
            {lightboxEntry.variantName}
          </p>
          <p className="m-0 mt-1 text-center font-accent text-xs uppercase tracking-wider text-white/60">
            {(lightboxIdx ?? 0) + 1} / {gallery.length}
          </p>
        </div>

        {gallery.length > 1 ? (
          <button
            type="button"
            onClick={nextLightbox}
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold sm:right-6"
            aria-label="Next"
          >
            ›
          </button>
        ) : null}
      </div>
    ) : null}
    </>
  );
}

function imageForVariant(
  variant: SyncVariant | null,
  product: SyncProductDetail,
): string | null {
  if (variant) {
    const preview = variant.files?.find((f) => f.type === "preview")
      ?.preview_url;
    if (preview) return preview;
    if (variant.product?.image) return variant.product.image;
  }
  return product.sync_product.thumbnail_url ?? null;
}

interface GalleryEntry {
  previewUrl: string;
  variantId: number;
  variantName: string;
}

function collectGallery(variants: SyncVariant[]): GalleryEntry[] {
  // De-dupe by previewUrl, keeping the first variant we encounter for each.
  const seen = new Map<string, GalleryEntry>();
  for (const v of variants) {
    const preview = v.files?.find((f) => f.type === "preview")?.preview_url;
    if (!preview) continue;
    if (seen.has(preview)) continue;
    seen.set(preview, {
      previewUrl: preview,
      variantId: v.id,
      variantName: v.name,
    });
  }
  return Array.from(seen.values());
}
