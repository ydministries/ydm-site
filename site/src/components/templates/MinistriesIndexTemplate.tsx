import Link from "next/link";
import Image from "next/image";
import { getAllMinistries } from "@/lib/ministries";
import { EditableFallback } from "./_helpers/EditableFallback";

export async function MinistriesIndexTemplate(_props: { pageKey?: string } = {}) {
  const ministries = await getAllMinistries();

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <EditableFallback
            keys={["hero_eyebrow"]}
            fallback="GET PLUGGED IN"
            as="p"
            className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Get Plugged In"
            as="p"
            className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="How We Serve."
            as="h1"
            className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl"
          />
          <EditableFallback
            keys={["hero_subhead"]}
            fallback="Seven ministries. One mission. Each one a way for the love of Christ to take shape — in worship, in our families, in our city, and around the world."
            as="p"
            className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
          />
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {ministries.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No ministries listed yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ministries.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ministries/${m.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
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
                    {m.tagline ? (
                      <p className="m-0 mb-2 font-script text-xl text-ydm-amber">
                        {m.tagline}
                      </p>
                    ) : null}
                    <h3 className="m-0 mb-3 font-display text-xl uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {m.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-1 font-accent text-sm font-semibold text-ydm-gold no-underline group-hover:underline">
                      Explore <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
