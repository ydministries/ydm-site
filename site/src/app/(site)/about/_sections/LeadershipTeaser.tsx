import { EditableContent } from "@/components/EditableContent";
import { EditableLink } from "@/components/EditableLink";
import { EditableRichText } from "@/components/EditableRichText";

export function LeadershipTeaser() {
  return (
    <section className="bg-ydm-ink px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <svg
          viewBox="0 0 48 2"
          className="mx-auto h-px w-12 text-ydm-gold"
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
        <EditableContent
          fieldKey="leadership_teaser.title"
          as="h2"
          className="mt-6 font-display text-5xl text-ydm-gold sm:text-6xl"
        />
        <EditableRichText
          fieldKey="leadership_teaser.body"
          className="mt-6 text-lg leading-relaxed text-ydm-cream/80"
        />
        <EditableLink
          fieldKey="leadership_teaser.cta"
          className="mt-10 inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
        />
      </div>
    </section>
  );
}
