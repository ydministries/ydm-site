import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import { getRelatedMinistries } from "@/lib/ministries";

interface Props {
  pageKey: string; // e.g. "ministries.worship"
}

function initials(name: string): string {
  const parts = name
    .replace(/\(.*?\)/g, "") // strip parenthetical bits
    .split(/\s+/)
    .filter((p) => p && !/^(O\.|Jr\.?|Sr\.?|Bishop|Rev\.?|Pastor)$/i.test(p));
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export async function MinistryTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^ministries\./, "");

  const title = content.get("meta.title")?.value ?? "";
  const heroImage = content.get("hero_image")?.value ?? "";
  const tagline = content.get("tagline")?.value ?? "";
  const leaderName = content.get("leader_name")?.value ?? "";
  const leaderRole = content.get("leader_role")?.value ?? "";
  const leaderBio = content.get("leader_bio")?.value ?? "";

  const related = await getRelatedMinistries(slug, 3);

  return (
    <>
      {/* SECTION 1 — Hero (60vh, hero_image bg + dark overlay) */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[60vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        {heroImage ? (
          <div className="absolute inset-0 -z-10">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-ydm-ink/85" />
          </div>
        ) : null}
        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-12">
          <p className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            OUR MINISTRIES
          </p>
          {tagline ? (
            <p className="m-0 mb-6 -rotate-[3deg] font-script text-4xl text-ydm-gold sm:text-5xl">
              {tagline}
            </p>
          ) : null}
          <h1 className="m-0 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            {title}
          </h1>
        </div>
      </section>

      {/* SECTION 2 — Leader card */}
      {(leaderName || leaderBio) ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="m-0 mb-6 text-center font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              MEET THE LEAD
            </p>
            <article className="grid grid-cols-[auto_1fr] items-center gap-6 rounded-sm bg-ydm-surface p-6 shadow-sm sm:p-8">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-ydm-gold font-display text-2xl uppercase text-ydm-ink sm:h-24 sm:w-24 sm:text-3xl">
                {initials(leaderName)}
              </div>
              <div>
                {leaderName ? (
                  <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink sm:text-2xl">
                    {leaderName}
                  </h3>
                ) : null}
                {leaderRole ? (
                  <p className="m-0 mb-3 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">
                    {leaderRole}
                  </p>
                ) : null}
                {leaderBio ? (
                  <div
                    className="font-serif text-sm leading-relaxed text-ydm-text [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(leaderBio) }}
                  />
                ) : null}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* SECTION 3 — What we do (body_html) */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              WHAT WE DO
            </p>
            <h2 className="m-0 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
              About this Ministry
            </h2>
          </div>
          <EditableRichText
            fieldKey="body_html"
            className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_h6]:mb-4 [&_h6]:font-accent [&_h6]:text-sm [&_h6]:uppercase [&_h6]:tracking-wider [&_h6]:text-ydm-muted [&_li]:mb-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        </div>
      </section>

      {/* SECTION 4 — Get Involved CTA (gold band) */}
      <section className="-mx-4 bg-ydm-gold py-20 sm:-mx-6 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-white/80">
            JOIN THIS MINISTRY
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-white sm:text-5xl">
            We&rsquo;re here for you!
          </p>
          <h2 className="m-0 mb-6 font-display text-3xl uppercase leading-tight text-white sm:text-5xl">
            Want to be part of this?
          </h2>
          <p className="m-0 mb-8 font-serif text-lg leading-relaxed text-white/90">
            Tell us how you&rsquo;d like to serve. Whether it&rsquo;s prayer, time, talent, or
            partnership &mdash; there&rsquo;s a place for you here.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-cream"
          >
            Connect With Us
          </Link>
        </div>
      </section>

      {/* SECTION 5 — Related ministries */}
      {related.length > 0 ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                EXPLORE MORE
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                Get Plugged In
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ministries/${m.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-surface no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {m.hero_image ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ydm-ink/20">
                      <Image
                        src={m.hero_image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {m.title}
                    </h3>
                    {m.tagline ? (
                      <p className="m-0 font-serif text-sm leading-relaxed text-ydm-muted">
                        {m.tagline}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 6 — Back link */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/ministries"
            className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold"
          >
            <span aria-hidden>←</span> All Ministries
          </Link>
        </div>
      </section>
    </>
  );
}
