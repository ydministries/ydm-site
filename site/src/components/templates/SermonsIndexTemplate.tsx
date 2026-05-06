import Link from "next/link";
import Image from "next/image";
import { getAllSermons, groupSermonsBySeries, type SermonListItem } from "@/lib/sermons";

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export async function SermonsIndexTemplate(_props: { pageKey?: string } = {}) {
  const sermons = await getAllSermons();
  const groups = groupSermonsBySeries(sermons);
  const hasSeries = groups.some((g) => g.series !== "");

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            FROM THE PULPIT
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Hear the Word
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Sermons
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Recent messages from Bishop Huel Wilson and the YDM pulpit. Listen, share, and grow.
          </p>
          <p className="m-0 mt-6">
            <Link
              href="/sermons/scripture"
              className="font-accent text-sm uppercase tracking-wider text-ydm-gold no-underline hover:text-ydm-amber"
            >
              Browse by scripture →
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {sermons.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No sermons yet — check back soon.
            </p>
          ) : hasSeries ? (
            // Grouped view — at least one series has been assigned.
            <div className="space-y-16">
              {groups.map((g) => (
                <div key={g.series || "standalone"}>
                  {g.series ? (
                    <header className="mb-6 border-b border-ydm-line pb-3">
                      <p className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
                        Series
                      </p>
                      <h2 className="m-0 font-display text-3xl uppercase tracking-wide text-ydm-ink">
                        {g.series}
                      </h2>
                    </header>
                  ) : (
                    <header className="mb-6 border-b border-ydm-line pb-3">
                      <h2 className="m-0 font-display text-3xl uppercase tracking-wide text-ydm-ink">
                        More Sermons
                      </h2>
                    </header>
                  )}
                  <SermonGrid sermons={g.sermons} />
                </div>
              ))}
            </div>
          ) : (
            // Flat view — no series assigned to anything yet.
            <SermonGrid sermons={sermons} />
          )}
        </div>
      </section>
    </>
  );
}

function SermonGrid({ sermons }: { sermons: SermonListItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sermons.map((s) => (
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
            <span className="mt-3 inline-flex items-center gap-1 font-accent text-sm font-semibold text-ydm-gold no-underline group-hover:underline">
              Listen <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
