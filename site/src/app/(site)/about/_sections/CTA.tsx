import { EditableContent } from "@/components/EditableContent";
import { EditableLink } from "@/components/EditableLink";
import { EditableRichText } from "@/components/EditableRichText";

export function CTA() {
  return (
    <section className="bg-ydm-cream px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <EditableContent
          fieldKey="cta.title"
          as="h2"
          className="font-display text-5xl text-ydm-ink sm:text-6xl"
        />
        <EditableRichText
          fieldKey="cta.body"
          className="mt-4 text-lg leading-relaxed text-ydm-ink/70"
        />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <EditableLink
            fieldKey="cta.primary"
            className="inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
          />
          <EditableLink
            fieldKey="cta.secondary"
            className="inline-block rounded-full border-2 border-ydm-ink px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-ink/5"
          />
        </div>
      </div>
    </section>
  );
}
