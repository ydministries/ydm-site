import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import { getRecentBlogPosts } from "@/lib/blog";
import { ShareButtons } from "./_helpers/ShareButtons";

interface Props {
  pageKey: string; // e.g. "blog.discovering-the-power-of-waiting"
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export async function BlogTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^blog\./, "");

  const title = content.get("meta.title")?.value ?? "";
  const heroImage = content.get("hero_image")?.value ?? "";
  const date = content.get("date_published")?.value ?? "";
  const author = content.get("author_name")?.value ?? "YDM Admin";
  const category = content.get("category")?.value ?? "Faith & Reflection";

  const related = await getRecentBlogPosts(slug, 3);

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
        <div className="relative mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            {category}
          </p>
          {date ? (
            <p className="m-0 mb-4 -rotate-[3deg] font-script text-3xl text-ydm-gold sm:text-4xl">
              {fmtDate(date)}
            </p>
          ) : null}
          <h1 className="m-0 mb-4 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-5xl">
            {title}
          </h1>
          <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-white/70">
            By {author}
          </p>
        </div>
      </section>

      {/* SECTION 2 — Article body */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <EditableRichText
            fieldKey="body_html"
            className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:text-ydm-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_li]:mb-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        </div>
      </section>

      {/* SECTION 3 — Author block */}
      <section className="bg-ydm-cream py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <article className="grid grid-cols-[auto_1fr] items-center gap-6 rounded-sm bg-ydm-surface p-6 shadow-sm sm:p-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-ydm-gold font-display text-xl uppercase text-ydm-ink">
              {author.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "Y"}
            </div>
            <div>
              <p className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">By</p>
              <p className="m-0 font-display text-lg uppercase text-ydm-ink">{author}</p>
              <p className="m-0 mt-1 font-serif text-sm leading-relaxed text-ydm-text">
                Yeshua Deliverance Ministries — sharing the gospel through the Word, prayer, and community.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* SECTION 4 — Related posts */}
      {related.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                MORE FROM THE PEN
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                Keep reading
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {p.thumbnail ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/20">
                      <Image src={p.thumbnail} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-ydm-gold/40 to-ydm-amber/30" aria-hidden="true" />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="m-0 mb-2 font-serif text-sm leading-relaxed text-ydm-text">{p.excerpt}</p>
                    ) : null}
                    {p.date ? (
                      <p className="m-0 mt-auto font-accent text-xs uppercase tracking-wider text-ydm-muted">{fmtDate(p.date)}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 5 — Share */}
      <section className="bg-ydm-cream py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-4 font-accent text-xs uppercase tracking-[0.3em] text-ydm-muted">
            SHARE THIS POST
          </p>
          <ShareButtons url={`/blog/${slug}`} title={title} />
        </div>
      </section>

      {/* SECTION 6 — Back link */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold"
          >
            <span aria-hidden>←</span> All Articles
          </Link>
        </div>
      </section>
    </>
  );
}
