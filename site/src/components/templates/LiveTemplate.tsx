import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";

const FALLBACK_CHANNEL_ID = "UC7JM1kSVzeKSJ5MmiHIE7IA";
const FALLBACK_CHANNEL_URL = "https://www.youtube.com/@YDMWorldwide";

export async function LiveTemplate(_props: { pageKey?: string } = {}) {
  const live = await fetchPageContent("live");

  const heroImage =
    live.get("hero_image")?.value ??
    "https://media.ydministries.ca/uploads/2025/09/man-hands-palm-praying-worship-cross-eucharist-therapy-bless-god-helping-hope-faith-christian-religion-concept-raising-up-162020217.webp";

  const channelId = live.get("youtube_channel_id")?.value ?? FALLBACK_CHANNEL_ID;
  const channelUrl = live.get("youtube_channel_url")?.value ?? FALLBACK_CHANNEL_URL;
  const embedSrc = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;

  return (
    <>
      {/* SECTION 1 — Hero (full-bleed dark) */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[55vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ydm-ink/85 via-ydm-ink/60 to-ydm-ink/95" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6">
          <EditableFallback
            keys={["hero_eyebrow"]}
            fallback="WORSHIP WITH US"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Join us live"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="Watch Live"
            as="h1"
            className="m-0 mb-4 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
          <EditableFallback
            keys={["hero_subtitle"]}
            fallback="Tune in for our worship services and special broadcasts."
            as="p"
            className="m-0 mx-auto max-w-2xl font-serif text-lg text-white/85"
          />
        </div>
      </section>

      {/* SECTION 2 — Live embed */}
      <section className="-mx-4 bg-ydm-ink py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="aspect-video overflow-hidden rounded-sm bg-black shadow-2xl">
            <iframe
              src={embedSrc}
              title="YDM Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <p className="m-0 mt-6 text-center font-serif text-sm leading-relaxed text-white/65">
            Stream may show &ldquo;Offline&rdquo; between services — that&rsquo;s normal.
            Subscribe to be notified when we go live.
          </p>
        </div>
      </section>

      {/* SECTION 3 — Schedule band */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <EditableFallback
            keys={["schedule_eyebrow"]}
            fallback="WHEN WE GO LIVE"
            as="p"
            className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <h2 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
            Streaming Schedule
          </h2>
          <EditableFallback
            keys={["schedule_body"]}
            fallback="Sunday Service streams every 4th Sunday at 1:00 PM Eastern. Bible Study streams Thursdays at 7:00 PM Eastern."
            as="p"
            className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
          />
        </div>
      </section>

      {/* SECTION 4 — Subscribe CTA */}
      <section className="bg-ydm-surface py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-ydm-gold px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
          >
            <EditableFallback keys={["subscribe_label"]} fallback="Subscribe on YouTube" as="span" />
          </a>
        </div>
      </section>

      {/* SECTION 5 — Catch up CTA */}
      <section className="bg-ydm-cream py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-script text-3xl text-ydm-amber sm:text-4xl">
            Missed a service?
          </p>
          <Link
            href="/sermons"
            className="font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink no-underline hover:text-ydm-gold"
          >
            Watch past sermons →
          </Link>
        </div>
      </section>
    </>
  );
}
