import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import {
  getRecentSermons,
  parseScriptureRefs,
  sermonAudioUrl,
} from "@/lib/sermons";
import { CustomAudioPlayer } from "./_helpers/CustomAudioPlayer";
import { ShareButtons } from "./_helpers/ShareButtons";

interface Props {
  pageKey: string; // e.g. "sermons.gilgal-the-place-of-new-beginnings"
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  // Accepts "YYYY-MM-DD HH:MM:SS" or ISO; render as "FEBRUARY 16, 2025"
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export async function SermonTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^sermons\./, "");

  const title = content.get("meta.title")?.value ?? "";
  const date = fmtDate(content.get("date_published")?.value);
  const thumbnail = content.get("thumbnail_url")?.value ?? "";
  const audioFilename = content.get("audio_filename")?.value ?? "";
  const scripturePrimary = content.get("scripture_primary")?.value ?? "";
  const scriptureRefs = parseScriptureRefs(content.get("scripture_refs")?.value);

  const recent = await getRecentSermons(slug, 3);

  return (
    <>
      {/* SECTION 1 — Hero (60vh, thumbnail bg + dark overlay) */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[60vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        {thumbnail ? (
          <div className="absolute inset-0 -z-10">
            <Image
              src={thumbnail}
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
            FROM THE PULPIT
          </p>
          {scripturePrimary ? (
            <p className="m-0 mb-6 -rotate-[3deg] font-script text-4xl text-ydm-gold sm:text-5xl">
              {scripturePrimary}
            </p>
          ) : null}
          <h1 className="m-0 mb-6 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            {title}
          </h1>
          {date ? (
            <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-white/70">
              {date}
            </p>
          ) : null}
        </div>
      </section>

      {/* SECTION 2 — Audio player */}
      {audioFilename ? (
        <section className="bg-ydm-cream py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="m-0 mb-6 text-center font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              LISTEN
            </p>
            <CustomAudioPlayer src={sermonAudioUrl(audioFilename)} />
          </div>
        </section>
      ) : null}

      {/* SECTION 3 — Sermon body */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <EditableRichText
            fieldKey="body_html"
            className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_h6]:mb-4 [&_h6]:font-accent [&_h6]:text-sm [&_h6]:uppercase [&_h6]:tracking-wider [&_h6]:text-ydm-muted [&_li]:mb-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        </div>
      </section>

      {/* SECTION 4 — Scripture cards */}
      {scriptureRefs.length > 0 ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                SCRIPTURE REFERENCES
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                From the Word
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scriptureRefs.map((s) => (
                <article
                  key={s.ref}
                  className="flex flex-col rounded-sm border border-ydm-line bg-ydm-surface p-6 transition-colors hover:border-ydm-gold/60"
                >
                  <h3 className="m-0 mb-3 font-display text-xl uppercase tracking-wide text-ydm-gold">
                    {s.ref}
                  </h3>
                  <p className="m-0 mb-4 line-clamp-4 flex-1 font-serif text-sm italic leading-relaxed text-ydm-text">
                    {s.text}
                  </p>
                  <span className="font-accent text-xs uppercase tracking-wider text-ydm-muted">
                    {s.translation === "World English Bible" ? "WEB" : s.translation}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 5 — Related sermons */}
      {recent.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                MORE FROM THE PULPIT
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                Keep listening
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sermons/${s.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {s.thumbnail ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/20">
                      <Image
                        src={s.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    {s.scripture ? (
                      <p className="m-0 mb-2 font-accent text-xs uppercase tracking-wider text-ydm-gold">
                        {s.scripture}
                      </p>
                    ) : null}
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {s.title}
                    </h3>
                    {s.date ? (
                      <p className="m-0 mt-auto font-accent text-xs uppercase tracking-wider text-ydm-muted">
                        {fmtDate(s.date)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 6 — Share */}
      <section className="bg-ydm-cream py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-4 font-accent text-xs uppercase tracking-[0.3em] text-ydm-muted">
            SHARE THIS SERMON
          </p>
          <ShareButtons url={`/sermons/${slug}`} title={title} />
        </div>
      </section>

      {/* SECTION 7 — Back link */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold"
          >
            <span aria-hidden>←</span> All Sermons
          </Link>
        </div>
      </section>
    </>
  );
}
