import { EditableContent } from "@/components/EditableContent";
import { EditableImage } from "@/components/EditableImage";

export function Hero() {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-ydm-ink">
      <EditableImage
        fieldKey="hero.bg_image"
        className="pointer-events-none absolute inset-0 opacity-20"
      />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <div className="flex items-center gap-4 text-ydm-gold">
          <svg
            viewBox="0 0 48 2"
            className="h-px w-12"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="1"
              x2="48"
              y2="1"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-[0.4em]">
            About
          </span>
        </div>
        <EditableContent
          fieldKey="hero.title"
          as="h1"
          className="mt-6 font-display text-5xl uppercase tracking-wide text-ydm-cream sm:text-6xl md:text-7xl"
        />
        <EditableContent
          fieldKey="hero.subtitle"
          as="p"
          className="mt-6 max-w-2xl text-lg text-ydm-cream/80"
        />
      </div>
    </section>
  );
}
