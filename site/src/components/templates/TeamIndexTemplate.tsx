import Link from "next/link";
import Image from "next/image";
import { getAllTeam } from "@/lib/team";

export async function TeamIndexTemplate(_props: { pageKey?: string } = {}) {
  const team = await getAllTeam();

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            OUR LEADERSHIP
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Leading with Love
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Our Team
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Meet the leaders who serve and shepherd the YDM family.
          </p>
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {team.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No team profiles yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((p) => (
                <Link
                  key={p.slug}
                  href={`/team/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {p.portrait ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ydm-ink/20">
                      <Image
                        src={p.portrait}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 text-center">
                    <h3 className="m-0 mb-1 font-display text-xl uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {p.name}
                    </h3>
                    {p.title ? (
                      <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">
                        {p.title}
                      </p>
                    ) : null}
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
