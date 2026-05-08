import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";

const ABOUT_LEADERS = [
  {
    slug: "bishop-huel-wilson",
    name: "Bishop Huel O. Wilson",
    role: "Founder & Senior Pastor",
    photo: "https://media.ydministries.ca/uploads/2026/04/bishop-huel.png",
  },
  {
    slug: "clementinawilson",
    name: "Clementina Wilson",
    role: "First Lady",
    photo: "https://media.ydministries.ca/uploads/2026/04/clementina.png",
  },
];

const ABOUT_LOCATIONS = [
  {
    slug: "maltoncog",
    title: "Mississauga (Home Base)",
    address: "2460 The Collegeway\nMississauga, ON L5L 1V3",
    photo: "/brand/mississauga-cog.avif",
  },
];

export async function AboutTemplate(_props: { pageKey?: string } = {}) {
  const about = await fetchPageContent("about");
  const home = await fetchPageContent("home");

  const heroImage =
    about.get("hero_image")?.value ?? "/brand/hero-worship.jpeg";
  const storyBody =
    about.get("who_we_are.body")?.value ??
    about.get("story.body")?.value ??
    about.get("welcome.body")?.value ??
    home.get("founded_in_faith.body")?.value ??
    "";
  const whyNameBody = about.get("why_name.body")?.value ?? "";
  const whatMakesDifferentBody = about.get("what_makes_different.body")?.value ?? "";
  const welcomeStatementBody = about.get("welcome_statement.body")?.value ?? "";
  const closingInvitationBody = about.get("closing_invitation.body")?.value ?? "";
  const storyPhoto =
    "https://media.ydministries.ca/uploads/2025/09/wmremove-transformed-1.jpeg";

  return (
    <>
      {/* SECTION 1 — Hero (full-bleed, dark) */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[60vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ydm-ink/85 via-ydm-ink/65 to-ydm-ink/85" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-4 py-24 text-center sm:px-6">
          <EditableFallback
            keys={["hero_eyebrow"]}
            fallback="ABOUT YDM"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Welcome home"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="About Yeshua Deliverance Ministries"
            as="h1"
            className="m-0 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
          <EditableFallback
            keys={["hero_subhead"]}
            fallback="A Christ-centered family. A worldwide voice. A burden for the lost — fifty years in the making."
            as="p"
            className="m-0 mt-6 font-serif text-lg leading-relaxed text-white/85 sm:text-xl"
          />
        </div>
      </section>

      {/* SECTION 2 — Our Story (split, photo left + body right) */}
      <section className="bg-ydm-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={storyPhoto}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <EditableFallback
                keys={["story_eyebrow"]}
                fallback="WHO WE ARE"
                as="p"
                className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
              />
              <EditableFallback
                keys={["who_we_are.title"]}
                fallback="A Christ-Centered Community"
                as="h2"
                className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
              />
              {storyBody ? (
                <div
                  className="editable-prose font-serif text-lg leading-relaxed text-ydm-text [&_p]:mb-4 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(storyBody) }}
                />
              ) : (
                <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
                  Yeshua Deliverance Ministries was founded by Bishop Huel O. Wilson
                  with a single conviction: every soul deserves a place to encounter
                  Jesus. From our home base inside the Mississauga Church of God, we
                  have grown into a worldwide community committed to teaching the
                  unchanging truth of God&rsquo;s Word, raising up the next generation
                  of disciples, and serving our neighbours in love.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.5 — Why the Name (Yeshua + Deliverance) */}
      {whyNameBody ? (
        <section className="-mx-4 bg-ydm-ink py-20 sm:-mx-6 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12">
            <div className="mb-10 text-center">
              <p className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                THE NAME
              </p>
              <EditableFallback
                keys={["why_name.title"]}
                fallback="Why the Name — Yeshua. Deliverance."
                as="h2"
                className="m-0 font-display text-4xl uppercase leading-none text-white sm:text-5xl"
              />
            </div>
            <div
              className="editable-prose font-serif text-base leading-relaxed text-white/90 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-ydm-gold [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote_p]:text-ydm-gold [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p]:text-white/90 [&_strong]:font-display [&_strong]:uppercase [&_strong]:text-ydm-gold sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(whyNameBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 2.6 — What Makes YDM Different (three pillars) */}
      {whatMakesDifferentBody ? (
        <section className="bg-ydm-surface py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12">
            <div className="mb-10 text-center">
              <p className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                WHAT MAKES YDM DIFFERENT
              </p>
              <EditableFallback
                keys={["what_makes_different.title"]}
                fallback="Three Threads, One Calling"
                as="h2"
                className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
              />
            </div>
            <div
              className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-display [&_strong]:uppercase [&_strong]:text-ydm-gold sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(whatMakesDifferentBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 3 — Mission / Vision / Values 3-col */}
      <section className="-mx-4 bg-ydm-cream py-24 sm:-mx-6 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
          <div className="mb-12 text-center">
            <EditableFallback
              keys={["values_eyebrow"]}
              fallback="WHAT WE BELIEVE"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
            <div>
              <EditableFallback
                keys={["mission.title", "h3.02"]}
                fallback="Our Mission"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["mission.body", "p.04"]} mode="rich" fallback="To make disciples of Jesus Christ — teaching God's word, growing in love, and reaching every soul with the gospel." />
              </div>
            </div>
            <div>
              <EditableFallback
                keys={["vision.title", "h3.04"]}
                fallback="Our Vision"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["vision.body", "p.05"]} mode="rich" fallback="A worldwide family of believers, rooted in scripture and united in worship — living out the Great Commission across every generation and nation." />
              </div>
            </div>
            <div>
              <EditableFallback
                keys={["values.title", "h3.05"]}
                fallback="Our Values"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["values.body", "p.06"]} mode="rich" fallback="Scripture above all. Compassion in every interaction. Excellence in our worship. Integrity in our leadership. Family at the centre." />
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="m-0 inline-block -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl">
              <EditableFallback
                keys={["mission_vision.script"]}
                fallback="You're always welcome here."
              />
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3.5 — Welcome Statement (centered, scripture-style) */}
      {welcomeStatementBody ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <div
              className="editable-prose font-serif text-lg leading-relaxed text-ydm-text [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(welcomeStatementBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 4 — Meet Our Leaders teaser */}
      <section className="bg-ydm-surface py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <EditableFallback
              keys={["leaders_teaser_eyebrow"]}
              fallback="OUR LEADERSHIP"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
              <EditableFallback
                keys={["leaders_teaser_script"]}
                fallback="Meet our leaders"
              />
            </p>
            <h2 className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
              Bishop &amp; Clementina Wilson
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {ABOUT_LEADERS.map((l) => (
              <Link
                key={l.slug}
                href={`/team/${l.slug}`}
                className="group block overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={l.photo}
                    alt={l.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">
                    {l.name}
                  </h3>
                  <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">
                    {l.role}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/team"
              className="inline-block rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              Meet Full Team
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Where we gather (Mississauga + Online) */}
      <section className="bg-ydm-cream py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <EditableFallback
              keys={["locations_teaser_eyebrow"]}
              fallback="FIND US"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
              <EditableFallback
                keys={["locations_teaser_script"]}
                fallback="In person and online"
              />
            </p>
            <h2 className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
              Where We Gather
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {ABOUT_LOCATIONS.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="group block overflow-hidden rounded-sm bg-ydm-surface no-underline shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={loc.photo}
                    alt={loc.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="m-0 mb-2 font-display text-xl uppercase text-ydm-ink">
                    {loc.title}
                  </h3>
                  <p className="m-0 whitespace-pre-line font-serif text-sm leading-relaxed text-ydm-muted">
                    {loc.address}
                  </p>
                  <p className="m-0 mt-3 font-accent text-xs uppercase tracking-wider text-ydm-gold">
                    Get Directions →
                  </p>
                </div>
              </Link>
            ))}
            {/* Online — companion card to the in-person home base */}
            <Link
              href="/live"
              className="group block overflow-hidden rounded-sm bg-ydm-ink no-underline shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="https://media.ydministries.ca/uploads/2025/09/man-hands-palm-praying-worship-cross-eucharist-therapy-bless-god-helping-hope-faith-christian-religion-concept-raising-up-162020217.webp"
                  alt="Worship online with YDM"
                  fill
                  className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ydm-ink via-ydm-ink/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="m-0 mb-2 font-display text-xl uppercase text-white">
                  Online (Worldwide)
                </h3>
                <p className="m-0 font-serif text-sm leading-relaxed text-white/70">
                  Watch every Sunday service and Bible study live, or catch up
                  on the YDM YouTube channel anytime.
                </p>
                <p className="m-0 mt-3 font-accent text-xs uppercase tracking-wider text-ydm-gold">
                  Watch Live →
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5.5 — Closing Invitation */}
      {closingInvitationBody ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <div
              className="editable-prose font-serif text-lg leading-relaxed text-ydm-text [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(closingInvitationBody) }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 6 — CTA band */}
      <section className="-mx-4 bg-ydm-gold py-20 sm:-mx-6 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <EditableFallback
            keys={["cta_title"]}
            fallback="Visit Us This Sunday"
            as="h2"
            className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
          />
          <EditableFallback
            keys={["cta_body"]}
            fallback="Join us in person or online for worship every 4th Sunday at 1:00 PM."
            as="p"
            className="m-0 mb-8 font-serif text-lg leading-relaxed text-ydm-ink/85"
          />
          <Link
            href="/contact"
            className="inline-block rounded-full bg-ydm-surface px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-cream"
          >
            <EditableFallback keys={["cta_label"]} fallback="Plan Your Visit" as="span" />
          </Link>
        </div>
      </section>
    </>
  );
}
