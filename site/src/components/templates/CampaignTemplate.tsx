import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableRichText } from "@/components/EditableRichText";
import { getOtherCampaigns } from "@/lib/campaigns";

interface Props {
  pageKey: string; // e.g. "give.supportydm"
}

export async function CampaignTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = pageKey.replace(/^give\./, "");

  const title = content.get("meta.title")?.value ?? "";
  const heroImage = content.get("hero_image")?.value ?? "";
  const goalLabel = content.get("goal_label")?.value ?? "Help us reach our goal";
  const ctaLabel = content.get("cta_label")?.value ?? "Give to this Campaign";
  const tagline = content.get("excerpt")?.value ?? "";

  const others = await getOtherCampaigns(slug, 1);

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[60vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        {heroImage ? (
          <div className="absolute inset-0 -z-10">
            <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-ydm-ink/85 via-ydm-ink/65 to-ydm-gold/40" />
          </div>
        ) : null}
        <div className="relative mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            SUPPORT OUR MISSION
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-gold sm:text-5xl">
            Make a difference
          </p>
          <h1 className="m-0 mb-4 font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            {title}
          </h1>
          {tagline ? (
            <p className="m-0 font-serif text-lg leading-relaxed text-white/90 sm:text-xl">
              {tagline}
            </p>
          ) : null}
        </div>
      </section>

      {/* SECTION 2 — Campaign story */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <EditableRichText
            fieldKey="body_html"
            className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:text-ydm-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:uppercase [&_h3]:text-ydm-ink [&_li]:mb-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        </div>
      </section>

      {/* SECTION 3 — Goal block (gold band) */}
      <section className="-mx-4 bg-ydm-gold py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-white/80">
            YOUR IMPACT
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-white sm:text-5xl">
            Together we can
          </p>
          <h2 className="m-0 mb-6 font-display text-3xl uppercase leading-tight text-white sm:text-5xl">
            {goalLabel}
          </h2>
          <p className="m-0 mb-8 font-serif text-lg leading-relaxed text-white/90">
            Every gift &mdash; large or small &mdash; carries the gospel further. Stand with YDM and watch what God can do.
          </p>
          <Link
            href="/give"
            className="inline-block rounded-full bg-white px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-cream"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* SECTION 4 — Other ways to give */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
              OTHER WAYS TO GIVE
            </p>
            <h2 className="m-0 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
              However You Give, It Matters
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <WayCard label="In-Person" body="Drop your gift in the offering plate at any service." />
            <WayCard label="Online" body="Use the secure giving form linked above." />
            <WayCard label="By Mail" body={`Cheques payable to "Yeshua Deliverance Ministries" — P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0`} />
          </div>
        </div>
      </section>

      {/* SECTION 5 — Related campaigns */}
      {others.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                EXPLORE OTHER CAMPAIGNS
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {others.map((c) => (
                <article
                  key={c.slug}
                  className="flex flex-col rounded-sm border border-ydm-line bg-ydm-cream/40 p-8 transition-colors hover:border-ydm-gold/60"
                >
                  <h3 className="m-0 mb-3 font-display text-2xl uppercase text-ydm-ink">{c.title}</h3>
                  {c.excerpt ? (
                    <p className="m-0 mb-6 flex-1 font-serif text-base leading-relaxed text-ydm-text">{c.excerpt}</p>
                  ) : null}
                  <Link
                    href={`/give/${c.slug}`}
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
                  >
                    Give <span aria-hidden>→</span>
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
          <Link href="/give" className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold">
            <span aria-hidden>←</span> All Ways to Give
          </Link>
        </div>
      </section>
    </>
  );
}

function WayCard({ label, body }: { label: string; body: string }) {
  return (
    <article className="rounded-sm bg-ydm-surface p-6 shadow-sm">
      <p className="m-0 mb-3 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">{label}</p>
      <p className="m-0 font-serif text-sm leading-relaxed text-ydm-text">{body}</p>
    </article>
  );
}
