"use client";

export function CarouselArrows({
  targetId,
  color = "white",
}: {
  targetId: string;
  color?: "white" | "ink";
}) {
  const scroll = (dir: "left" | "right") => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };
  const colorClass =
    color === "white"
      ? "text-white border-white/40 hover:bg-white/10"
      : "text-ydm-ink border-ydm-ink/40 hover:bg-ydm-ink/10";
  return (
    <div className="absolute right-0 top-0 hidden -translate-y-16 gap-2 md:flex">
      <button
        onClick={() => scroll("left")}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl leading-none transition-colors ${colorClass}`}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={() => scroll("right")}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl leading-none transition-colors ${colorClass}`}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
