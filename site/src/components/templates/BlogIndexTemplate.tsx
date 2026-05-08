import Link from "next/link";
import Image from "next/image";
import { getAllBlogPosts } from "@/lib/blog";
import { EditableFallback } from "./_helpers/EditableFallback";

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export async function BlogIndexTemplate(_props: { pageKey?: string } = {}) {
  const posts = await getAllBlogPosts();

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <EditableFallback
            keys={["hero_eyebrow"]}
            fallback="READ & REFLECT"
            as="p"
            className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="From the heart of YDM"
            as="p"
            className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="The YDM Blog"
            as="h1"
            className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl"
          />
          <EditableFallback
            keys={["hero_subhead"]}
            fallback="Reflections on faith, scripture, and the walk with Christ — written for the YDM family and anyone seeking the Lord."
            as="p"
            className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
          />
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {posts.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No posts yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {p.thumbnail ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/20">
                      <Image
                        src={p.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-[16/9] w-full bg-gradient-to-br from-ydm-gold/40 to-ydm-amber/30"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="m-0 mb-3 font-serif text-sm leading-relaxed text-ydm-text">
                        {p.excerpt}
                      </p>
                    ) : null}
                    {p.date ? (
                      <p className="m-0 mt-auto font-accent text-xs uppercase tracking-wider text-ydm-muted">
                        {fmtDate(p.date)}
                      </p>
                    ) : null}
                    <span className="mt-3 inline-flex items-center gap-1 font-accent text-sm font-semibold text-ydm-gold no-underline group-hover:underline">
                      Read <span aria-hidden>→</span>
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
