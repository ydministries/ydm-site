import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import { getOtherLocations } from "@/lib/locations";

interface Props {
  pageKey: string; // e.g. "locations.maltoncog"
}

export async function LocationTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^locations\./, "");

  const title = content.get("title")?.value ?? content.get("meta.title")?.value ?? "";
  const heroImage = content.get("hero_image")?.value ?? "";
  const heroEyebrow = content.get("hero_eyebrow")?.value ?? "";
  const heroScript = content.get("hero_script")?.value ?? "";
  const heroSubhead = content.get("hero_subhead")?.value ?? "";
  const address = content.get("address")?.value ?? "";
  const serviceTimes = content.get("service_times")?.value ?? "";
  const parkingNote = content.get("parking_note")?.value ?? "";

  // Heritage-page narrative fields (optional)
  const storyTitle = content.get("story.title")?.value ?? "";
  const storyBody = content.get("story.body")?.value ?? "";
  const whatItBuiltTitle = content.get("what_it_built.title")?.value ?? "";
  const whatItBuiltBody = content.get("what_it_built.body")?.value ?? "";
  const yearsServed = content.get("years_served")?.value ?? "";
  const visitNoteTitle = content.get("visit_note.title")?.value ?? "";
  const visitNoteBody = content.get("visit_note.body")?.value ?? "";

  const isHeritagePage = !!(storyBody || whatItBuiltBody || yearsServed);

  // Plain-text address: pick a one-line version for the directions URL.
  const addressOneLine = address.replace(/\s*\n+\s*/g, ", ");
  const directionsUrl = addressOneLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOneLine)}`
    : "";

  const others = await getOtherLocations(slug, 1);

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[55vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        {heroImage ? (
          <div className="absolute inset-0 -z-10">
            <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-ydm-ink/85" />
          </div>
        ) : null}
        <div className="relative mx-auto w-full max-w-4xl px-4 pb-24 pt-20 text-center sm:px-6">
          <p className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            {heroEyebrow || "LOCATIONS"}
          </p>
          {heroScript ? (
            <p className="m-0 mb-4 -rotate-[3deg] font-script text-4xl text-ydm-gold sm:text-5xl">
              {heroScript}
            </p>
          ) : null}
          <h1 className="m-0 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            {title}
          </h1>
          {heroSubhead ? (
            <p className="m-0 mt-6 mx-auto max-w-3xl font-serif text-base leading-relaxed text-white/90 sm:text-lg">
              {heroSubhead}
            </p>
          ) : null}
        </div>
      </section>

      {/* HERITAGE — Story */}
      {isHeritagePage && storyBody ? (
        <section className="bg-ydm-surface py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            {storyTitle ? (
              <div className="mb-8 text-center">
                <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                  {storyTitle.toUpperCase()}
                </p>
                <h2 className="m-0 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
                  The Story
                </h2>
              </div>
            ) : null}
            <div
              className="font-serif text-base leading-relaxed text-ydm-text [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-display [&_strong]:text-ydm-ink sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(storyBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* HERITAGE — Years Served pull-quote */}
      {isHeritagePage && yearsServed ? (
        <section className="-mx-4 bg-ydm-ink py-12 sm:-mx-6 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="m-0 mb-2 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
              YEARS SERVED
            </p>
            <p className="m-0 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
              {yearsServed}
            </p>
          </div>
        </section>
      ) : null}

      {/* HERITAGE — What It Built */}
      {isHeritagePage && whatItBuiltBody ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-6 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                {whatItBuiltTitle ? whatItBuiltTitle.toUpperCase() : "WHAT IT BUILT"}
              </p>
            </div>
            <div
              className="font-serif text-base leading-relaxed text-ydm-text [&_p]:mb-4 [&_p:last-child]:mb-0 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(whatItBuiltBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* HERITAGE — Visit Note (YDM currently meets at...) */}
      {isHeritagePage && visitNoteBody ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="rounded-sm bg-ydm-cream p-8 shadow-sm sm:p-10">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                {visitNoteTitle ? visitNoteTitle.toUpperCase() : "A NOTE ON VISITING"}
              </p>
              <div
                className="font-serif text-base leading-relaxed text-ydm-text [&_em]:italic [&_p]:mb-3 [&_p:last-child]:mb-0 sm:text-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(visitNoteBody) }}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 2 — Address card (overlaps hero) */}
      <section className="-mt-12 mb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-sm bg-ydm-cream p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <p className="m-0 mb-3 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
              VISIT US
            </p>
            {address ? (
              <p className="m-0 mb-6 whitespace-pre-line font-serif text-lg leading-relaxed text-ydm-ink">
                {address}
              </p>
            ) : null}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
              >
                Get Directions
              </a>
            ) : null}
            {parkingNote ? (
              <p className="m-0 mt-4 font-accent text-xs uppercase tracking-wider text-ydm-muted">
                {parkingNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Service times */}
      {serviceTimes ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              SERVICE TIMES
            </p>
            <p className="m-0 mb-6 font-script text-4xl text-ydm-amber sm:text-5xl">
              We&rsquo;d love to see you
            </p>
            <ul className="m-0 list-none space-y-3 p-0 text-left">
              {serviceTimes
                .split(/\n+/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <li key={line} className="m-0 rounded-sm bg-ydm-cream/40 p-4 font-serif text-base leading-relaxed text-ydm-ink">
                    {line}
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* SECTION 4 — Description body (only for non-heritage pages) */}
      {!isHeritagePage ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                ABOUT THIS LOCATION
              </p>
            </div>
            <EditableRichText
              fieldKey="body_html"
              className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_p]:mb-4"
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 5 — Plan Your Visit CTA */}
      <section className="-mx-4 bg-ydm-gold py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-white/80">
            PLAN YOUR VISIT
          </p>
          <h2 className="m-0 mb-6 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
            First time? Here&rsquo;s what to expect.
          </h2>
          <p className="m-0 mb-8 font-serif text-lg leading-relaxed text-white/90">
            We&rsquo;ll save you a seat. Reach out and let us know you&rsquo;re coming &mdash; we&rsquo;d love to greet you.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-cream"
          >
            Connect With Us
          </Link>
        </div>
      </section>

      {/* SECTION 6 — Other locations */}
      {others.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                ELSEWHERE
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {others.map((l) => (
                <Link
                  key={l.slug}
                  href={`/locations/${l.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {l.hero_image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/20">
                      <Image src={l.hero_image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <h3 className="m-0 mb-2 font-display text-xl uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {l.title}
                    </h3>
                    {l.address ? (
                      <p className="m-0 whitespace-pre-line font-serif text-sm leading-relaxed text-ydm-muted">
                        {l.address}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 7 — Back link (no /locations index — back to home) */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold">
            <span aria-hidden>←</span> Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
