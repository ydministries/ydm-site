import { fetchPageContent } from "@/lib/content";
import { ContentProviderWrapper } from "@/components/ContentProviderWrapper";
import { EditableContent } from "@/components/EditableContent";

export default async function HomePage() {
  const content = await fetchPageContent("home");
  const entries = Array.from(content.values());

  return (
    <ContentProviderWrapper pageKey="home" entries={entries}>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center bg-ydm-ink px-6 text-center text-white">
        <EditableContent
          fieldKey="hero.title"
          as="h1"
          className="font-display text-7xl uppercase tracking-wide text-ydm-gold sm:text-8xl"
        />
        <EditableContent
          fieldKey="hero.subtitle"
          as="p"
          className="mt-4 max-w-2xl text-xl text-white/80"
        />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <EditableContent
            fieldKey="hero.cta_primary.label"
            as="span"
            className="inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
          />
          <EditableContent
            fieldKey="hero.cta_secondary.label"
            as="span"
            className="inline-block rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          />
          <EditableContent
            fieldKey="hero.cta_tertiary.label"
            as="span"
            className="inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
          />
        </div>
      </section>

      {/* ── Welcome ── */}
      <section className="bg-ydm-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="welcome.eyebrow"
            as="span"
            className="text-sm font-semibold uppercase tracking-widest text-ydm-gold"
          />
          <EditableContent
            fieldKey="welcome.title"
            as="h2"
            className="mt-2 font-display text-5xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="welcome.body"
            as="div"
            className="mt-6 text-lg leading-relaxed text-ydm-ink/80"
          />
          <EditableContent
            fieldKey="welcome.kicker"
            as="p"
            className="mt-6 text-xl font-semibold italic text-ydm-gold"
          />
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section className="bg-ydm-off px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
          <div className="text-center">
            <EditableContent
              fieldKey="mission.title"
              as="h3"
              className="font-display text-3xl text-ydm-ink"
            />
            <EditableContent
              fieldKey="mission.body"
              as="div"
              className="mt-4 text-ydm-ink/70"
            />
          </div>
          <div className="text-center">
            <EditableContent
              fieldKey="vision.title"
              as="h3"
              className="font-display text-3xl text-ydm-ink"
            />
            <EditableContent
              fieldKey="vision.body"
              as="div"
              className="mt-4 text-ydm-ink/70"
            />
          </div>
          <div className="text-center">
            <EditableContent
              fieldKey="values.title"
              as="h3"
              className="font-display text-3xl text-ydm-ink"
            />
            <EditableContent
              fieldKey="values.body"
              as="div"
              className="mt-4 text-ydm-ink/70"
            />
          </div>
        </div>
      </section>

      {/* ── Tagline ── */}
      <section className="bg-ydm-ink px-6 py-16 text-center">
        <EditableContent
          fieldKey="tagline.line"
          as="p"
          className="font-display text-4xl text-ydm-gold"
        />
      </section>

      {/* ── Service Promo ── */}
      <section className="bg-ydm-cream px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <EditableContent
            fieldKey="service_promo.time"
            as="p"
            className="font-display text-4xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="service_promo.venue"
            as="p"
            className="mt-2 text-lg text-ydm-ink/70"
          />
          <EditableContent
            fieldKey="service_promo.cta.label"
            as="span"
            className="mt-6 inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
          />
        </div>
      </section>

      {/* ── Leaders ── */}
      <section className="bg-ydm-off px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="leaders.eyebrow"
            as="span"
            className="text-sm font-semibold uppercase tracking-widest text-ydm-gold"
          />
          <EditableContent
            fieldKey="leaders.title"
            as="h2"
            className="mt-2 font-display text-5xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="leaders.subtitle"
            as="p"
            className="mt-4 text-xl text-ydm-ink/70"
          />
          <EditableContent
            fieldKey="leaders.cta.label"
            as="span"
            className="mt-8 inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
          />
        </div>
      </section>

      {/* ── Ministries Grid ── */}
      <section className="bg-ydm-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="ministries_grid.title"
            as="h2"
            className="font-display text-5xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="ministries_grid.subtitle"
            as="p"
            className="mt-4 text-lg text-ydm-ink/70"
          />
          <EditableContent
            fieldKey="ministries_grid.cta.label"
            as="span"
            className="mt-8 inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
          />
        </div>
      </section>

      {/* ── Events ── */}
      <section className="bg-ydm-off px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="events.title"
            as="h2"
            className="font-display text-5xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="events.cta.label"
            as="span"
            className="mt-8 inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
          />
        </div>
      </section>

      {/* ── Featured Sermons ── */}
      <section className="bg-ydm-ink px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="featured_sermons.title"
            as="h2"
            className="font-display text-5xl text-ydm-gold"
          />
          <EditableContent
            fieldKey="featured_sermons.cta.label"
            as="span"
            className="mt-8 inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
          />
        </div>
      </section>

      {/* ── Get Involved ── */}
      <section className="bg-ydm-off px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <EditableContent
            fieldKey="get_involved.title"
            as="h2"
            className="text-center font-display text-5xl text-ydm-ink"
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Partner */}
            <div className="rounded-2xl border border-ydm-gold/20 bg-ydm-cream p-8 text-center">
              <EditableContent
                fieldKey="get_involved.card_partner.title"
                as="h3"
                className="font-display text-2xl text-ydm-ink"
              />
              <EditableContent
                fieldKey="get_involved.card_partner.body"
                as="div"
                className="mt-4 text-ydm-ink/70"
              />
              <EditableContent
                fieldKey="get_involved.card_partner.cta.label"
                as="span"
                className="mt-6 inline-block text-sm font-semibold text-ydm-gold"
              />
            </div>
            {/* Pray */}
            <div className="rounded-2xl border border-ydm-gold/20 bg-ydm-cream p-8 text-center">
              <EditableContent
                fieldKey="get_involved.card_pray.title"
                as="h3"
                className="font-display text-2xl text-ydm-ink"
              />
              <EditableContent
                fieldKey="get_involved.card_pray.body"
                as="div"
                className="mt-4 text-ydm-ink/70"
              />
              <EditableContent
                fieldKey="get_involved.card_pray.cta.label"
                as="span"
                className="mt-6 inline-block text-sm font-semibold text-ydm-gold"
              />
            </div>
            {/* Serve */}
            <div className="rounded-2xl border border-ydm-gold/20 bg-ydm-cream p-8 text-center">
              <EditableContent
                fieldKey="get_involved.card_serve.title"
                as="h3"
                className="font-display text-2xl text-ydm-ink"
              />
              <EditableContent
                fieldKey="get_involved.card_serve.body"
                as="div"
                className="mt-4 text-ydm-ink/70"
              />
              <EditableContent
                fieldKey="get_involved.card_serve.cta.label"
                as="span"
                className="mt-6 inline-block text-sm font-semibold text-ydm-gold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Campaign Promo ── */}
      <section className="bg-ydm-gold px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <EditableContent
            fieldKey="campaign_promo.title"
            as="h2"
            className="font-display text-5xl text-ydm-ink"
          />
          <EditableContent
            fieldKey="campaign_promo.body"
            as="div"
            className="mt-4 text-lg text-ydm-ink/80"
          />
          <EditableContent
            fieldKey="campaign_promo.cta.label"
            as="span"
            className="mt-8 inline-block rounded-full bg-ydm-ink px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-ink/90"
          />
        </div>
      </section>

      {/* ── Support Banner ── */}
      <section className="bg-ydm-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <EditableContent
            fieldKey="support_banner.eyebrow"
            as="span"
            className="text-sm font-semibold uppercase tracking-widest text-ydm-gold"
          />
          <EditableContent
            fieldKey="support_banner.body"
            as="div"
            className="mt-4 text-lg text-ydm-ink/80"
          />
          <EditableContent
            fieldKey="support_banner.ways_label"
            as="p"
            className="mt-6 font-semibold text-ydm-ink"
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <EditableContent
              fieldKey="support_banner.cta_online.label"
              as="span"
              className="inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
            />
            <EditableContent
              fieldKey="support_banner.cta_inperson.label"
              as="span"
              className="inline-block rounded-full border-2 border-ydm-gold px-8 py-3 font-semibold text-ydm-gold transition hover:bg-ydm-gold/10"
            />
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-ydm-ink px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <EditableContent
            fieldKey="newsletter.title"
            as="h2"
            className="font-display text-5xl text-ydm-gold"
          />
          <EditableContent
            fieldKey="newsletter.prompt"
            as="p"
            className="mt-4 text-lg text-white/80"
          />
          <EditableContent
            fieldKey="newsletter.cta"
            as="span"
            className="mt-8 inline-block rounded-full bg-ydm-gold px-8 py-3 font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
          />
        </div>
      </section>
    </ContentProviderWrapper>
  );
}
