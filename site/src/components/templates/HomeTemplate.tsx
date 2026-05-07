import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";
import { NewsletterForm } from "./_helpers/NewsletterForm";
import { CountdownToService } from "./_helpers/CountdownToService";
import { CarouselArrows } from "./_helpers/CarouselArrows";

// Hero photo: AI-generated worship-pose photo (woman, hands raised, eyes
// closed, congregation softly behind). Mapped from the live site's compiled
// Elementor CSS (background-image on the first hero section, element id
// e0a9039) — source URL ydministries.ca/wp-content/uploads/2025/09/a-
// photorealistic-candid-moment-during-a-… The Phase B media migration only
// scraped images referenced via <img>, so this CSS-only background didn't
// land on R2 — self-hosted in /public/brand/ instead. 1312×736.
const HERO_PHOTO_URL = "/brand/hero-worship.jpeg";

// WE ARE YDM portrait — different worship/people scene than the hero. 1024×774
// on R2; cropped to 4:5 via object-cover.
const WE_ARE_YDM_PHOTO =
  "https://media.ydministries.ca/uploads/2025/09/wmremove-transformed-1.jpeg";

// Leader portraits — studio headshots provided directly by the church.
const BISHOP_PHOTO_URL =
  "https://media.ydministries.ca/uploads/2026/04/bishop-huel.png";
const CLEMENTINA_PHOTO_URL =
  "https://media.ydministries.ca/uploads/2026/04/clementina.png";

// Support / countdown background — wide congregation photo, distinct from the
// hero and from the Bishop/Clementina cards above.
const SUPPORT_BG_PHOTO =
  "https://media.ydministries.ca/uploads/2025/01/wmremove-transformed.webp";

// Panoramic candid strip below the Get Involved cards.
const GALLERY_STRIP = [
  "https://media.ydministries.ca/uploads/2025/09/1741721413998-300x204.jpeg",
  "https://media.ydministries.ca/uploads/2025/09/1741721593784-300x196.jpeg",
  "https://media.ydministries.ca/uploads/2025/09/1741721668005-300x201.jpeg",
  "https://media.ydministries.ca/uploads/2025/09/PHOTO-2025-04-11-11-50-46-300x210.jpg",
  "https://media.ydministries.ca/uploads/2025/01/d4bd005b-e92d-4db0-a7b6-160c2dc6d22e-e1758157433747-300x256.jpg",
  "https://media.ydministries.ca/uploads/2025/09/PHOTO-2025-04-11-11-50-51-4-220x300.jpg",
];

// Per-ministry leader photos sourced from the WordPress XML _thumbnail_id
// postmeta and uploaded to R2 (originals weren't part of the first migrate-to-r2
// sweep, which only walked scraped HTML).
const HOME_MINISTRIES = [
  {
    slug: "ask-bishop",
    title: "Ask Bishop",
    blurb: "Submit your faith questions to Bishop Wilson.",
    photo: "https://media.ydministries.ca/uploads/2025/09/FastFoto_0017_a.jpg",
  },
  {
    slug: "worship",
    title: "Worship Ministry",
    blurb: "Encounter God through music and praise.",
    photo: "https://media.ydministries.ca/uploads/2023/12/pexels-jibarofoto-2014775-scaled-e1758244273295.jpg",
  },
  {
    slug: "outreach",
    title: "Compassion & Outreach",
    blurb: "Serving our community with the love of Christ.",
    photo: "https://media.ydministries.ca/uploads/2023/12/ChatGPT-Image-Sep-21-2025-10_33_09-PM.png",
  },
  {
    slug: "family",
    title: "Family Ministry",
    blurb: "Strengthening homes and raising children in faith.",
    photo: "https://media.ydministries.ca/uploads/2023/12/istockphoto-1456111870-612x612-1-e1758243411865.jpg",
  },
  {
    slug: "leadership",
    title: "Leadership",
    blurb: "Equipping leaders to serve and shepherd God's people.",
    photo: "https://media.ydministries.ca/uploads/2023/12/360_F_1226027780_lEOLyeTK87dfMWN2KCXkOjeVx7RlmzE8.jpg",
  },
  {
    slug: "partnership",
    title: "Partnership",
    blurb: "Walking with us to spread the gospel through giving and prayer.",
    photo: "https://media.ydministries.ca/uploads/2023/12/partner.jpg",
  },
  {
    slug: "wordwide",
    title: "Worldwide",
    blurb: "Carrying Christ's love across borders and cultures.",
    photo: "https://media.ydministries.ca/uploads/2023/12/35bb24c2-2640-40c9-9d8b-a8012e14fcae-e1758243636977.jpg",
  },
];

const HOME_EVENTS = [
  {
    slug: "weekly-bible-study-group",
    day: "25",
    month: "MAR",
    title: "Weekly Bible Study Group",
    meta: "Thursdays · 7:00 PM · Online + In-Person",
    blurb: "Dive deeper into God's word with a community-led study group focused on growth in faith.",
    photo: "https://media.ydministries.ca/uploads/2025/01/wmremove-transformed.webp",
  },
  {
    slug: "young-adults-connect",
    day: "29",
    month: "MAR",
    title: "Young Adults Connect",
    meta: "Sundays · 1:00 PM · Mississauga Church of God",
    blurb: "A space for young adults to connect, worship, and build relationships rooted in Christ.",
    photo: "https://media.ydministries.ca/uploads/2025/01/d4bd005b-e92d-4db0-a7b6-160c2dc6d22e-e1758157433747.jpg",
  },
];

// Per-sermon thumbnails sourced from WordPress XML _thumbnail_id postmeta.
const FEATURED_SERMONS = [
  {
    slug: "here-am-i-send-me-a-vision-for-mission",
    date: "FEBRUARY 13, 2026",
    title: "Here Am I, Send Me — A Vision for Mission",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-8.26.41-PM.png",
  },
  {
    slug: "jesus-the-ultimate-transformational-leader",
    date: "FEBRUARY 13, 2026",
    title: "Jesus — The Ultimate Transformational Leader",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-8.31.12-PM.png",
  },
  {
    slug: "jesus-is-coming-soon-signs-prophecy-hope",
    date: "MARCH 17, 2026",
    title: "Jesus is Coming Soon — Signs, Prophecy & Hope",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-10.37.58-PM.png",
  },
  {
    slug: "gilgal-the-place-of-new-beginnings",
    date: "FEBRUARY 16, 2026",
    title: "Gilgal — The Place of New Beginnings",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-10.50.38-PM.png",
  },
  {
    slug: "repent-the-kingdom-of-god-is-at-hand",
    date: "FEBRUARY 14, 2026",
    title: "Repent — The Kingdom of God is at Hand",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-11.04.30-PM.png",
  },
  {
    slug: "the-heritage-of-a-godly-mother",
    date: "FEBRUARY 9, 2026",
    title: "The Heritage of a Godly Mother",
    meta: "YDM Admin",
    photo: "https://media.ydministries.ca/uploads/2025/02/Screenshot-2025-09-22-at-11.20.17-PM.png",
  },
];

const HOME_LEADERS = [
  { slug: "bishop-huel-wilson", name: "Bishop Huel O. Wilson", role: "Senior Pastor", photo: BISHOP_PHOTO_URL },
  { slug: "clementina-wilson",  name: "Clementina Wilson",     role: "First Lady",    photo: CLEMENTINA_PHOTO_URL },
];

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ── card components ─────────────────────────────────────────────────────────

interface InvolveCardProps {
  title: string;
  body: string;
  imageUrl?: string;
  cta: string;
}
function InvolveCard({ title, body, imageUrl, cta }: InvolveCardProps) {
  return (
    <Link
      href={cta}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-ydm-surface no-underline shadow-sm ring-1 ring-ydm-line transition hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-ydm-cream">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ydm-gold/30 to-ydm-cream" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="m-0 font-display text-xl font-semibold text-ydm-ink">{title}</h3>
        <p className="mt-2 mb-0 flex-1 text-sm leading-relaxed text-ydm-muted">{body}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ydm-gold no-underline group-hover:underline">
          Learn more <IconArrowRight />
        </span>
      </div>
    </Link>
  );
}

// ── main template ───────────────────────────────────────────────────────────
export async function HomeTemplate(_props: { pageKey?: string } = {}) {
  // Fetch home content directly so we can read raw URL values for the hero
  // background and the get-involved card images. The wrapping
  // ContentProviderWrapper has already loaded the same data for client editable
  // components — this is a parallel server-side read.
  const home = await fetchPageContent("home");
  const heroBg =
    home.get("image.01")?.value ?? home.get("image.01.url")?.value ?? "";
  const img2 = home.get("image.02")?.value ?? home.get("image.02.url")?.value ?? "";
  const img3 = home.get("image.03")?.value ?? home.get("image.03.url")?.value ?? "";
  const img4 = home.get("image.04")?.value ?? home.get("image.04.url")?.value ?? "";

  return (
    <>
      {/* SECTION 1 — Hero (full-bleed, ~85vh) ─ left text + 3 CTAs, right navy service card */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[85vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        {/* Background photo */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={HERO_PHOTO_URL}
            alt="Hands raised in worship"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ydm-ink/85 via-ydm-ink/60 to-ydm-ink/30" />
        </div>

        {/* Content grid */}
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-12">
          {/* LEFT — kicker + title + subtitle + 3 CTAs */}
          <div className="text-left lg:col-span-7 lg:mt-40">
            <EditableFallback
              keys={["welcome.kicker"]}
              fallback="YOU'RE ALWAYS WELCOME HERE"
              as="p"
              className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <EditableFallback
              keys={["hero.title_line1"]}
              fallback="Yeshua Deliverance"
              as="h1"
              className="m-0 mb-2 font-display text-5xl uppercase leading-none tracking-wide text-white sm:text-7xl"
            />
            <h1 className="m-0 mb-6 font-display text-6xl uppercase leading-none tracking-wide text-ydm-gold sm:text-8xl">
              Ministries
            </h1>
            <EditableFallback
              keys={["hero.subtitle", "tagline"]}
              fallback="Uniting hearts in faith and fellowship."
              as="p"
              className="mb-8 max-w-xl font-serif text-lg text-white/90 sm:text-xl"
            />
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
              >
                Join Us In Person
              </Link>
              <Link
                href="/live"
                className="rounded-full border-2 border-white px-7 py-3 font-accent text-sm uppercase tracking-wider text-white no-underline transition-colors hover:bg-white hover:text-ydm-ink"
              >
                Watch Live
              </Link>
              <Link
                href="/events"
                className="rounded-full border-2 border-white/50 px-7 py-3 font-accent text-sm uppercase tracking-wider text-white/90 no-underline transition-colors hover:bg-white/10"
              >
                Bible Study
              </Link>
            </div>
          </div>

          {/* RIGHT — floating navy service card */}
          <aside className="lg:col-span-5 lg:mt-40 lg:justify-self-end">
            <div className="w-full max-w-sm rounded-sm bg-ydm-navy p-8 text-white shadow-2xl">
              <p className="m-0 mb-2 font-script text-2xl text-ydm-gold">Join Us</p>
              <p className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-white/70">
                <EditableFallback keys={["service.sunday"]} fallback="EVERY 4TH SUNDAY" />
              </p>
              <p className="m-0 mb-4 font-display text-5xl uppercase leading-none text-white">SUNDAY</p>
              <div className="mt-4 border-t border-white/15 pt-4">
                <p className="m-0 font-accent text-xs uppercase tracking-wider text-white/60">Inside</p>
                <p className="m-0 font-serif text-base text-white">Mississauga Church of God</p>
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 font-accent text-xs uppercase tracking-wider text-ydm-gold no-underline hover:text-ydm-gold-light"
              >
                Plan Your Visit <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* SECTION 2 — Welcome band ("YDM: A HOME FOR YOUR SOUL.") */}
      <section className="relative -mx-4 bg-ydm-cream py-20 sm:-mx-6 sm:py-28">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          {/* Tiny gold cross icon above the headline */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/brand/ydm-logo.png"
              alt=""
              width={72}
              height={72}
              className="opacity-90"
            />
          </div>

          <EditableFallback
            keys={["welcome_band.headline"]}
            fallback="YDM: A Home for Your Soul."
            as="h2"
            className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-amber sm:text-7xl"
          />

          <div className="mx-auto max-w-3xl font-serif text-lg leading-relaxed text-ydm-text">
            <EditableFallback
              keys={["welcome.body", "p.03"]}
              mode="rich"
              fallback="In a world that is constantly changing, some things remain constant. The love of God is one of them."
            />
          </div>

          <p className="m-0 mt-12 inline-block w-full -rotate-[6deg] text-center font-script text-5xl text-ydm-gold sm:text-6xl">
            You belong here.
          </p>
        </div>
      </section>

      {/* SECTION 3 — FOUNDED IN FAITH split (image left, origin narrative right) */}
      <section className="bg-ydm-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* LEFT — image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={WE_ARE_YDM_PHOTO}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* RIGHT — text */}
            <div>
              <EditableFallback
                keys={["founded_in_faith.eyebrow"]}
                fallback="FOUNDED IN FAITH"
                as="p"
                className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
              />
              <EditableFallback
                keys={["founded_in_faith.heading", "welcome.title"]}
                fallback="A Christ-Centered Community for Worship & Growth"
                as="h2"
                className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
              />
              <div className="mb-8 max-w-xl font-serif text-lg leading-relaxed text-ydm-text">
                <EditableFallback keys={["founded_in_faith.body"]} mode="rich" fallback="" />
              </div>
              <Link
                href="/about"
                className="inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
              >
                <EditableFallback keys={["founded_in_faith.cta_label"]} fallback="OUR STORY" as="span" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Mission + Vision + Values (3-col, cursive accent below) */}
      <section className="relative -mx-4 bg-ydm-cream py-24 sm:-mx-6 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
            {/* Mission */}
            <div>
              <EditableFallback
                keys={["mission.title", "h3.02"]}
                fallback="Our Mission"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["mission.body", "p.04"]} mode="rich" />
              </div>
            </div>
            {/* Vision */}
            <div>
              <EditableFallback
                keys={["vision.title", "h3.04"]}
                fallback="Our Vision"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["vision.body", "p.05"]} mode="rich" />
              </div>
            </div>
            {/* Values */}
            <div>
              <EditableFallback
                keys={["values.title", "h3.05"]}
                fallback="Our Values"
                as="h3"
                className="m-0 mb-4 font-display text-2xl uppercase text-ydm-ink"
              />
              <div className="font-serif text-base leading-relaxed text-ydm-text">
                <EditableFallback keys={["values.body", "p.06"]} mode="rich" />
              </div>
            </div>
          </div>
          {/* Cursive accent floating below */}
          <div className="mt-12 text-center">
            <p className="m-0 inline-block -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl">
              <EditableFallback keys={["mission_vision.script"]} fallback="You're always welcome here." />
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — DARK YDM Ministries (horizontal snap carousel on charcoal) */}
      <section className="-mx-4 bg-ydm-ink py-24 sm:-mx-6 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="relative">
            <div className="mb-12 text-center">
              <p className="m-0 mb-4 font-script text-5xl text-ydm-gold sm:text-6xl">
                <EditableFallback keys={["ministries_grid.script"]} fallback="Get Plugged In" />
              </p>
              <EditableFallback
                keys={["ministries_grid.title"]}
                fallback="YDM Ministries"
                as="h2"
                className="m-0 font-display text-4xl uppercase leading-none text-white sm:text-6xl"
              />
            </div>
            <CarouselArrows targetId="ministries-scroll" color="white" />
            <div
              id="ministries-scroll"
              className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
            >
              {HOME_MINISTRIES.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ministries/${m.slug}`}
                  className="group flex w-72 flex-shrink-0 snap-start flex-col overflow-hidden rounded-sm bg-white/5 no-underline transition-colors hover:bg-white/10 sm:w-80"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ydm-ink/40">
                    <Image
                      src={m.photo}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="320px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="m-0 mb-3 font-display text-xl uppercase text-white transition-colors group-hover:text-ydm-gold">
                      {m.title}
                    </h3>
                    <p className="mb-6 flex-1 font-serif text-sm leading-relaxed text-white/70">{m.blurb}</p>
                    <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-wider text-ydm-gold">
                      Learn More <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/ministries"
                className="inline-block rounded-full border-2 border-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-gold no-underline transition-colors hover:bg-ydm-gold hover:text-ydm-ink"
              >
                See All Ministries
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER — between Ministries and Featured Sermons (both bg-ydm-ink) */}
      <div className="-mx-4 bg-ydm-ink py-12 sm:-mx-6">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-12">
          <div className="h-px flex-1 bg-ydm-gold/30" />
          <span className="font-script text-4xl text-ydm-gold sm:text-5xl">Hear the Word</span>
          <div className="h-px flex-1 bg-ydm-gold/30" />
        </div>
      </div>

      {/* SECTION 6 — DARK Featured Sermons (horizontal snap carousel) */}
      <section className="-mx-4 bg-ydm-ink py-24 sm:-mx-6 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="relative">
            <div className="mb-16 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                <EditableFallback keys={["featured_sermons.eyebrow"]} fallback="FROM THE PULPIT" />
              </p>
              <EditableFallback
                keys={["featured_sermons.title"]}
                fallback="Featured Sermons"
                as="h2"
                className="m-0 font-display text-4xl uppercase leading-none text-white sm:text-6xl"
              />
            </div>
            <CarouselArrows targetId="sermons-scroll" color="white" />
            <div
              id="sermons-scroll"
              className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
            >
              {FEATURED_SERMONS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sermons/${s.slug}`}
                  className="group flex w-80 flex-shrink-0 snap-start flex-col overflow-hidden rounded-sm bg-white/5 no-underline transition-colors hover:bg-white/10"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/40">
                    <Image
                      src={s.photo}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="320px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="m-0 mb-2 font-accent text-xs uppercase tracking-wider text-ydm-gold">{s.date}</p>
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-white transition-colors group-hover:text-ydm-gold">
                      {s.title}
                    </h3>
                    <p className="m-0 font-accent text-xs uppercase tracking-wider text-white/50">{s.meta}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/sermons"
                className="inline-block rounded-full border-2 border-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-gold no-underline transition-colors hover:bg-ydm-gold hover:text-ydm-ink"
              >
                <EditableFallback keys={["featured_sermons.cta_label"]} fallback="VIEW ALL SERMONS" as="span" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Upcoming Events (date squares + listings) */}
      <section className="bg-ydm-surface py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="m-0 mb-4 font-script text-5xl text-ydm-amber sm:text-6xl">
              <EditableFallback keys={["events.script"]} fallback="Come as you are" />
            </p>
            <h2 className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-6xl">
              Upcoming Events
            </h2>
          </div>

          <div className="space-y-6">
            {HOME_EVENTS.map((e) => (
              <article
                key={e.slug}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-sm border border-ydm-line bg-ydm-cream/40 p-6 sm:grid-cols-[auto_auto_1fr_auto] sm:p-8"
              >
                {/* Date square — explicit text-white on each <p> because globals.css base layer
                    forces text-ydm-text on every <p>, which would otherwise win over parent inheritance. */}
                <div className="rounded-sm bg-ydm-ink px-4 py-3 text-center text-white">
                  <p className="m-0 font-display text-3xl leading-none text-white">{e.day}</p>
                  <p className="m-0 mt-1 font-accent text-xs uppercase tracking-wider text-white">{e.month}</p>
                </div>
                {/* Thumbnail (desktop+) */}
                <div className="relative hidden h-20 w-28 overflow-hidden rounded-sm sm:block">
                  <Image
                    src={e.photo}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                {/* Details */}
                <div>
                  <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">{e.title}</h3>
                  <p className="m-0 mb-2 font-accent text-xs uppercase tracking-wider text-ydm-muted">{e.meta}</p>
                  <p className="m-0 hidden font-serif text-sm text-ydm-text sm:block">{e.blurb}</p>
                </div>
                {/* CTA */}
                <Link
                  href={`/events/${e.slug}`}
                  className="whitespace-nowrap rounded-full border-2 border-ydm-ink px-5 py-2 font-accent text-xs uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="hover:bg-ydm-text inline-block rounded-full bg-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-white no-underline transition-colors"
            >
              <EditableFallback keys={["events.cta_label"]} fallback="VIEW ALL EVENTS" as="span" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8 — Countdown to next service (photo bg + dark overlay) */}
      <section className="relative -mx-4 isolate overflow-hidden py-24 sm:-mx-6 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <Image src={SUPPORT_BG_PHOTO} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-ydm-ink/85" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <CountdownToService />
          <p className="m-0 mt-12 font-script text-5xl text-ydm-gold sm:text-7xl">
            <EditableFallback keys={["countdown.script"]} fallback="Be the light." />
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
          >
            <EditableFallback keys={["countdown.cta_label"]} fallback="JOIN US" as="span" />
          </Link>
        </div>
      </section>

      {/* SECTION 9 — Meet Our Leaders (cream bg, 2 portrait cards) */}
      <section className="bg-ydm-cream py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              <EditableFallback keys={["leaders.eyebrow"]} fallback="OUR LEADERSHIP" />
            </p>
            <p className="m-0 -mt-2 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
              <EditableFallback keys={["leaders.script"]} fallback="Leading with Love" />
            </p>
            <EditableFallback
              keys={["leaders.title"]}
              fallback="Meet Our Leaders"
              as="h2"
              className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-6xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {HOME_LEADERS.map((l) => (
              <Link
                key={l.slug}
                href={`/team/${l.slug}`}
                className="group block overflow-hidden rounded-sm bg-ydm-surface no-underline shadow-sm transition-shadow hover:shadow-lg"
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
                  <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">{l.name}</h3>
                  <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">{l.role}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/team"
              className="inline-block rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              <EditableFallback keys={["leaders.cta_label"]} fallback="MEET FULL TEAM" as="span" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10 — Get Involved 4-up cards (cream bg, polished header) */}
      <section className="bg-ydm-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="mb-16 text-center">
            <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              <EditableFallback keys={["get_involved.eyebrow"]} fallback="GET INVOLVED" />
            </p>
            <p className="m-0 -mt-2 mb-4 font-script text-3xl text-ydm-amber sm:text-4xl">
              <EditableFallback keys={["get_involved.script"]} fallback="We're here for you!" />
            </p>
            <h2 className="m-0 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-6xl">
              Get Involved With YDM
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-ydm-text">
              Faith is meant to be lived out in community! Discover ways to connect, serve, and grow with us.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <InvolveCard
              title="Pray With Us"
              body="Stand with YDM in prayer for our ministry, our leaders, and the lives we are reaching through the gospel."
              imageUrl={img2}
              cta="/prayer"
            />
            <InvolveCard
              title="Serve With Us"
              body="Volunteer your time and talents in worship, outreach, media, or community service — making an impact for Christ."
              imageUrl={img3}
              cta="/contact"
            />
            <InvolveCard
              title="Partner With Us"
              body="Support the ministry through financial giving or monthly partnership, helping us expand our reach and touch more lives."
              imageUrl={img4}
              cta="/give"
            />
            <InvolveCard
              title="Connect"
              body="Plan a visit or join us for an upcoming service. We'd love to meet you."
              imageUrl={heroBg}
              cta="/contact"
            />
          </div>
          {/* Panoramic candid strip */}
          <div className="mt-16 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {GALLERY_STRIP.map((url) => (
              <div key={url} className="aspect-square overflow-hidden rounded-sm">
                <Image
                  src={url}
                  alt=""
                  width={200}
                  height={200}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11 — Support YDM's Mission (full-width photo bg, gold-tinted overlay) */}
      <section className="relative -mx-4 isolate overflow-hidden py-24 sm:-mx-6 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <Image src={SUPPORT_BG_PHOTO} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-ydm-ink/80 via-ydm-ink/65 to-ydm-gold/40" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            <EditableFallback keys={["support.eyebrow"]} fallback="SUPPORT OUR MISSION" />
          </p>
          <p className="m-0 -mt-2 mb-4 font-script text-3xl text-ydm-gold sm:text-4xl">
            <EditableFallback keys={["support.script"]} fallback="Make a difference" />
          </p>
          <EditableFallback
            keys={["support_banner.title", "h2.10"]}
            fallback="Support YDM's Mission"
            as="h2"
            className="m-0 mb-6 font-display text-4xl uppercase leading-none text-white sm:text-6xl"
          />
          <div className="mx-auto mb-8 max-w-2xl font-serif text-lg text-white/90">
            <EditableFallback keys={["support_banner.body"]} mode="rich" fallback="" />
          </div>
          <Link
            href="/give"
            className="inline-block rounded-full bg-white px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-cream"
          >
            <EditableFallback keys={["support.cta_label"]} fallback="GIVE NOW" as="span" />
          </Link>
        </div>
      </section>

      {/* SECTION 12 — Newsletter (white bg, polished script eyebrow) */}
      <section className="bg-ydm-surface py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="m-0 mb-2 font-script text-2xl text-ydm-gold">
            <EditableFallback keys={["newsletter.script"]} fallback="Stay connected" />
          </p>
          <EditableFallback
            keys={["newsletter.title", "h3.10"]}
            fallback="Subscribe"
            as="h3"
            className="m-0 mb-3 font-display text-3xl uppercase text-ydm-ink"
          />
          <p className="m-0 mb-6 font-serif text-ydm-text">
            <EditableFallback
              keys={["newsletter.prompt"]}
              fallback="Get updates on events and inspiration to your email."
              as="span"
            />
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

