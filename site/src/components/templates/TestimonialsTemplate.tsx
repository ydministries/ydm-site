import { getApprovedTestimonials, type Testimonial } from "@/lib/testimonials";
import { TestimonialForm } from "./_helpers/TestimonialForm";

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

export async function TestimonialsTemplate(_props: { pageKey?: string } = {}) {
  const testimonials = await getApprovedTestimonials();
  const featured = testimonials.filter((t) => t.isFeatured);
  const rest = testimonials.filter((t) => !t.isFeatured);

  return (
    <>
      {/* HERO */}
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            VOICES OF THE FAMILY
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            What God is doing
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Testimonies
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Stories from members and visitors of how God has moved in their
            lives through YDM.
          </p>
        </div>
      </section>

      {/* APPROVED GRID */}
      {testimonials.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            {featured.length > 0 ? (
              <div className="mb-12 space-y-6">
                {featured.map((t) => (
                  <FeaturedCard key={t.id} t={t} />
                ))}
              </div>
            ) : null}
            {rest.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((t) => (
                  <Card key={t.id} t={t} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="m-0 font-serif text-lg text-ydm-muted">
              Be the first to share what God has done in your life through
              YDM.
            </p>
          </div>
        </section>
      )}

      {/* SUBMISSION FORM */}
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <header className="mb-8 text-center">
            <p className="m-0 mb-3 font-script text-3xl text-ydm-amber">
              Share your story
            </p>
            <h2 className="m-0 font-display text-4xl uppercase tracking-wide text-ydm-ink">
              Submit a testimony
            </h2>
          </header>
          <TestimonialForm />
        </div>
      </section>
    </>
  );
}

function FeaturedCard({ t }: { t: Testimonial }) {
  return (
    <article className="rounded-lg border border-ydm-gold bg-ydm-cream/40 p-8 sm:p-10">
      <p className="m-0 mb-3 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
        Featured testimony
      </p>
      <blockquote className="m-0">
        <p className="m-0 mb-6 whitespace-pre-wrap font-serif text-xl leading-relaxed text-ydm-ink sm:text-2xl">
          “{t.message}”
        </p>
        <footer className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <cite className="not-italic font-display text-base uppercase tracking-wide text-ydm-ink">
            {t.name}
          </cite>
          {t.relationship ? (
            <span className="font-serif text-sm italic text-ydm-muted">
              {t.relationship}
            </span>
          ) : null}
          <span className="ml-auto font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
            {fmtDate(t.createdAt)}
          </span>
        </footer>
      </blockquote>
    </article>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <article className="flex flex-col rounded-sm border border-ydm-line bg-ydm-cream/40 p-6">
      <blockquote className="m-0 flex-1">
        <p className="m-0 mb-4 whitespace-pre-wrap font-serif text-base leading-relaxed text-ydm-text">
          “{t.message}”
        </p>
      </blockquote>
      <footer className="mt-auto border-t border-ydm-line/60 pt-3">
        <cite className="not-italic block font-display text-sm uppercase tracking-wide text-ydm-ink">
          {t.name}
        </cite>
        {t.relationship ? (
          <span className="mt-1 block font-serif text-xs italic text-ydm-muted">
            {t.relationship}
          </span>
        ) : null}
      </footer>
    </article>
  );
}
