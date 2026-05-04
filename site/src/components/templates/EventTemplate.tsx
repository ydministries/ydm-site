import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import { getOtherEvents } from "@/lib/events";

interface Props {
  pageKey: string; // e.g. "events.weekly-bible-study-group"
}

function fmtDateLong(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Build a minimal RFC-5545 .ics file as a data: URL. Single VEVENT with
 * SUMMARY/DTSTART/DTEND/LOCATION/DESCRIPTION. End time defaults to start+90m
 * if duration parsing yields no number.
 */
function buildIcsHref(opts: {
  title: string;
  startIso: string;
  durationMinutes: number;
  locationName: string;
  locationAddr: string;
  description: string;
}): string {
  const fmtZ = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const start = new Date(opts.startIso);
  if (Number.isNaN(start.getTime())) return "#";
  const end = new Date(start.getTime() + opts.durationMinutes * 60_000);
  const esc = (s: string) => s.replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YDM//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@ydministries.ca`,
    `DTSTAMP:${fmtZ(new Date())}`,
    `DTSTART:${fmtZ(start)}`,
    `DTEND:${fmtZ(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `LOCATION:${esc(`${opts.locationName} — ${opts.locationAddr}`)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function parseDuration(s: string): number {
  // Returns minutes. "90 minutes" → 90; "1 hour" → 60; "2 hours" → 120; default 60.
  const min = s.match(/(\d+)\s*(?:m|min|minute)/i);
  if (min) return +min[1]!;
  const hr = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/i);
  if (hr) return Math.round(parseFloat(hr[1]!) * 60);
  return 60;
}

export async function EventTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^events\./, "");

  const title = content.get("meta.title")?.value ?? "";
  const heroImage = content.get("hero_image")?.value ?? "";
  const dateIso = content.get("date_iso")?.value ?? content.get("date_published")?.value ?? "";
  const locationName = content.get("location_name")?.value ?? "";
  const locationAddr = content.get("location_addr")?.value ?? "";
  const duration = content.get("duration")?.value ?? "1 hour";
  const excerpt = content.get("excerpt")?.value ?? "";

  const dateLong = fmtDateLong(dateIso);
  const time = fmtTime(dateIso);
  const directionsUrl = locationAddr
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddr)}`
    : "";
  const icsHref = buildIcsHref({
    title,
    startIso: dateIso,
    durationMinutes: parseDuration(duration),
    locationName,
    locationAddr,
    description: excerpt || `Join us for ${title} at YDM.`,
  });

  const others = await getOtherEvents(slug, 1);

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
            UPCOMING EVENT
          </p>
          <h1 className="m-0 mb-4 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            {title}
          </h1>
          {dateLong || time ? (
            <p className="m-0 font-serif text-lg text-white/90 sm:text-xl">
              {dateLong}
              {time ? ` · ${time}` : ""}
            </p>
          ) : null}
        </div>
      </section>

      {/* SECTION 2 — Quick-info card (overlaps hero) */}
      <section className="-mt-12 mb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-sm bg-ydm-cream p-6 shadow-xl sm:p-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <InfoBlock label="Date" value={dateLong || "TBA"} />
            <InfoBlock label="Time" value={time || "TBA"} />
            <InfoBlock label="Duration" value={duration} />
            <InfoBlock label="Location" value={locationName || "TBA"} />
          </div>
        </div>
      </section>

      {/* SECTION 3 — Description */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <EditableRichText
            fieldKey="body_html"
            className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_li]:mb-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        </div>
      </section>

      {/* SECTION 4 — CTAs */}
      <section className="bg-ydm-cream py-12">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 px-4 sm:px-6">
          <a
            href={icsHref}
            download={`${slug}.ics`}
            className="rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
          >
            Add to Calendar
          </a>
          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              Get Directions
            </a>
          ) : null}
        </div>
      </section>

      {/* SECTION 5 — Other upcoming events */}
      {others.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                MORE TO COME
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                Save the date
              </p>
            </div>
            <div className="space-y-6">
              {others.map((e) => (
                <article key={e.slug} className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-sm border border-ydm-line bg-ydm-cream/40 p-6 sm:grid-cols-[auto_auto_1fr_auto] sm:p-8">
                  <div className="rounded-sm bg-ydm-ink px-4 py-3 text-center text-white">
                    <p className="m-0 font-display text-3xl leading-none text-white">{e.day}</p>
                    <p className="m-0 mt-1 font-accent text-xs uppercase tracking-wider text-white">{e.month}</p>
                  </div>
                  {e.thumbnail ? (
                    <div className="relative hidden h-20 w-28 overflow-hidden rounded-sm sm:block">
                      <Image src={e.thumbnail} alt="" fill className="object-cover" sizes="112px" />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">{e.title}</h3>
                    {e.excerpt ? (
                      <p className="m-0 hidden font-serif text-sm text-ydm-text sm:block">{e.excerpt}</p>
                    ) : null}
                  </div>
                  <Link href={`/events/${e.slug}`} className="whitespace-nowrap rounded-full border-2 border-ydm-ink px-5 py-2 font-accent text-xs uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white">
                    View Details
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 6 — Back link */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link href="/events" className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold">
            <span aria-hidden>←</span> All Events
          </Link>
        </div>
      </section>
    </>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">{label}</p>
      <p className="m-0 font-display text-sm uppercase text-ydm-ink sm:text-base">{value}</p>
    </div>
  );
}
