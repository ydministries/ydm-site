import { EditableContent } from "@/components/EditableContent";
import { EditableRichText } from "@/components/EditableRichText";

export function Story() {
  return (
    <section className="bg-ydm-cream px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-16">
        <header className="md:col-span-5">
          <EditableContent
            fieldKey="story.eyebrow"
            as="p"
            className="text-xs font-semibold uppercase tracking-[0.4em] text-ydm-gold"
          />
          <EditableContent
            fieldKey="story.title"
            as="h2"
            className="mt-4 font-display text-5xl text-ydm-ink sm:text-6xl"
          />
          <svg
            viewBox="0 0 48 2"
            className="mt-6 h-px w-12 text-ydm-gold"
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
        </header>
        <EditableRichText
          fieldKey="story.body"
          className="text-lg leading-relaxed text-ydm-ink/80 md:col-span-7"
        />
      </div>
    </section>
  );
}
