import Link from "next/link";
import Image from "next/image";
import { getAllEvents } from "@/lib/events";

export async function EventsIndexTemplate(_props: { pageKey?: string } = {}) {
  const events = await getAllEvents();

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Come as you are
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Events
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Bible studies, services, and gatherings that bring our church family together.
          </p>
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {events.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No upcoming events listed.
            </p>
          ) : (
            <div className="space-y-6">
              {events.map((e) => (
                <article
                  key={e.slug}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-sm border border-ydm-line bg-ydm-cream/40 p-6 sm:grid-cols-[auto_auto_1fr_auto] sm:p-8"
                >
                  {/* Date square */}
                  <div className="rounded-sm bg-ydm-ink px-4 py-3 text-center text-white">
                    <p className="m-0 font-display text-3xl leading-none text-white">{e.day}</p>
                    <p className="m-0 mt-1 font-accent text-xs uppercase tracking-wider text-white">{e.month}</p>
                  </div>
                  {/* Thumbnail (desktop+) */}
                  {e.thumbnail ? (
                    <div className="relative hidden h-20 w-28 overflow-hidden rounded-sm sm:block">
                      <Image
                        src={e.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  ) : null}
                  {/* Details */}
                  <div>
                    <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">{e.title}</h3>
                    {e.excerpt ? (
                      <p className="m-0 hidden font-serif text-sm text-ydm-text sm:block">{e.excerpt}</p>
                    ) : null}
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
          )}
        </div>
      </section>
    </>
  );
}
