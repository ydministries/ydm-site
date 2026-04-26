"use client";

import { EditableContent } from "@/components/EditableContent";
import { EditableList } from "@/components/EditableList";
import { EditableRichText } from "@/components/EditableRichText";

export function Beliefs() {
  return (
    <section className="bg-ydm-off px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-ydm-gold">
            Foundation
          </span>
          <EditableContent
            fieldKey="beliefs.title"
            as="h2"
            className="mt-3 font-display text-5xl text-ydm-ink sm:text-6xl"
          />
          <EditableRichText
            fieldKey="beliefs.intro"
            className="mt-4 text-lg leading-relaxed text-ydm-ink/70"
          />
        </header>

        {/* validate:list-prefix="beliefs" */}
        <EditableList
          itemPrefix="beliefs"
          className="mt-16 grid gap-y-12 gap-x-10 md:grid-cols-2 lg:grid-cols-3"
          render={({ index }) => (
            <article className="relative pl-14">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 font-display text-4xl leading-none text-ydm-gold/60"
              >
                {String(index).padStart(2, "0")}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 2"
                className="absolute left-0 top-12 h-px w-10 text-ydm-gold"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="24"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <EditableContent
                fieldKey="title"
                as="h3"
                className="font-display text-2xl text-ydm-ink"
              />
              <EditableRichText
                fieldKey="body"
                className="mt-3 text-ydm-ink/70"
              />
            </article>
          )}
        />
      </div>
    </section>
  );
}
