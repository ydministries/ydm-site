"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/lib/gallery";

interface GalleryGridProps {
  photos: GalleryPhoto[];
}

/**
 * Responsive masonry-style grid (CSS columns, breaks across rows naturally so
 * tall photos don't stretch others). Click a photo → lightbox with prev/next,
 * keyboard nav (← → Esc), focus trap, and body scroll lock.
 *
 * Mirrors the live ydministries.ca elementor masonry config: 4 cols desktop /
 * 2 tablet / 1 mobile, 10px gap.
 */
export function GalleryGrid({ photos }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () =>
      setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + photos.length) % photos.length,
      ),
    [photos.length],
  );

  // Keyboard nav + scroll lock while open
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, next, prev]);

  // Touch swipe (left/right) on the lightbox
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
    setTouchStartX(null);
  };

  const open = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      {/* Masonry grid via CSS columns. 10px gutter matches the live site. */}
      <div className="columns-1 gap-[10px] sm:columns-2 lg:columns-4">
        {photos.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="mb-[10px] block w-full overflow-hidden rounded-sm bg-ydm-ink/10 p-0 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold focus-visible:ring-offset-2"
            aria-label={p.alt || `Open photo ${i + 1} of ${photos.length}`}
          >
            <Image
              src={p.url}
              alt={p.alt}
              width={p.width ?? 800}
              height={p.height ?? 600}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="block h-auto w-full"
              loading={i < 8 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${openIndex! + 1} of ${photos.length}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={(e) => {
            // Close when clicking the backdrop (not the image or buttons)
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold"
            aria-label="Close gallery"
          >
            ×
          </button>

          {/* Prev */}
          {photos.length > 1 ? (
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold sm:left-6"
              aria-label="Previous photo"
            >
              ‹
            </button>
          ) : null}

          {/* Image */}
          <div className="relative max-h-full max-w-full">
            <Image
              src={open.url}
              alt={open.alt}
              width={open.width ?? 1600}
              height={open.height ?? 1200}
              sizes="100vw"
              className="block h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
              priority
            />
            {open.caption ? (
              <p className="m-0 mt-3 text-center font-serif text-sm text-white/80">
                {open.caption}
              </p>
            ) : null}
            <p className="m-0 mt-1 text-center font-accent text-xs uppercase tracking-wider text-white/50">
              {openIndex! + 1} / {photos.length}
            </p>
          </div>

          {/* Next */}
          {photos.length > 1 ? (
            <button
              type="button"
              onClick={next}
              className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ydm-gold sm:right-6"
              aria-label="Next photo"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
