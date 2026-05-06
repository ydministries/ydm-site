import Link from "next/link";
import { getAllCampaigns } from "@/lib/campaigns";
import { isStripeConfigured } from "@/lib/stripe";
import { StripeRecurringForm } from "./_helpers/StripeRecurringForm";

const DONATE_EMAIL = "donate@ydministries.ca";

export async function GiveIndexTemplate(_props: { pageKey?: string } = {}) {
  const campaigns = await getAllCampaigns();
  const stripeOn = isStripeConfigured();

  return (
    <>
      {/* HERO */}
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            SUPPORT THE MISSION
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Partner with us
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Give
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Your generosity fuels every YDM ministry — from outreach and
            discipleship to worldwide gospel work. Choose the way that works
            best for you.
          </p>
        </div>
      </section>

      {/* TWO-WAY GIVING */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* LEFT — INTERAC */}
            <article className="rounded-lg border-2 border-ydm-gold bg-ydm-cream/50 p-8 sm:p-10">
              <p className="m-0 mb-2 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
                Easiest · zero fees
              </p>
              <h2 className="m-0 mb-4 font-display text-3xl uppercase tracking-wide text-ydm-ink sm:text-4xl">
                Interac e-Transfer
              </h2>
              <p className="m-0 mb-6 font-serif text-base leading-relaxed text-ydm-text">
                Send any amount, any time, directly from your bank app. No
                fees for you and no fees for us — every dollar reaches the
                mission.
              </p>

              <div className="mb-6 rounded-md border border-ydm-line bg-white p-5">
                <p className="m-0 mb-1 font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                  Send your gift to
                </p>
                <p className="m-0 mb-3 select-all font-mono text-xl font-semibold text-ydm-ink">
                  {DONATE_EMAIL}
                </p>
                <p className="m-0 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                  Auto-deposit enabled · no security question needed
                </p>
              </div>

              <ol className="m-0 mb-6 list-decimal space-y-2 pl-5 font-serif text-sm leading-relaxed text-ydm-text">
                <li>
                  Open your bank's mobile app and choose &ldquo;Send
                  e-Transfer&rdquo;
                </li>
                <li>
                  Enter{" "}
                  <span className="font-mono font-semibold text-ydm-ink">
                    {DONATE_EMAIL}
                  </span>{" "}
                  as the recipient
                </li>
                <li>Enter the amount you want to give</li>
                <li>
                  In the message field, write your name and (optionally) which
                  ministry you'd like to support
                </li>
                <li>Send</li>
              </ol>

              <p className="m-0 font-serif text-xs leading-relaxed text-ydm-muted">
                You'll receive confirmation from your bank as soon as the
                deposit clears. Bishop Wilson personally reviews each gift and
                gives thanks.
              </p>
            </article>

            {/* RIGHT — STRIPE RECURRING */}
            <article className="rounded-lg border border-ydm-line bg-ydm-surface p-8 sm:p-10">
              <p className="m-0 mb-2 font-accent text-xs uppercase tracking-[0.3em] text-ydm-gold">
                Recurring · automatic
              </p>
              <h2 className="m-0 mb-4 font-display text-3xl uppercase tracking-wide text-ydm-ink sm:text-4xl">
                Monthly partnership
              </h2>
              <p className="m-0 mb-6 font-serif text-base leading-relaxed text-ydm-text">
                Set up automatic monthly giving with your card. Predictable
                support helps Bishop Wilson plan ministry seasons, missions
                trips, and outreach with confidence.
              </p>

              {stripeOn ? (
                <StripeRecurringForm />
              ) : (
                <div className="rounded border border-ydm-line bg-ydm-cream p-5 text-center font-serif text-sm leading-relaxed text-ydm-text">
                  <p className="m-0 mb-2 font-display text-base uppercase tracking-wide text-ydm-ink">
                    Coming soon
                  </p>
                  <p className="m-0">
                    Card-based monthly giving is being set up. In the meantime,
                    please use Interac e-Transfer on the left — same impact,
                    zero fees.
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      {campaigns.length > 0 ? (
        <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <header className="mb-10 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                Specific causes
              </p>
              <h2 className="m-0 font-display text-4xl uppercase tracking-wide text-ydm-ink sm:text-5xl">
                Active campaigns
              </h2>
            </header>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {campaigns.map((c) => (
                <article
                  key={c.slug}
                  className="flex flex-col rounded-sm border border-ydm-line bg-ydm-surface p-8 transition-colors hover:border-ydm-gold/60"
                >
                  <h3 className="m-0 mb-3 font-display text-2xl uppercase text-ydm-ink">
                    {c.title}
                  </h3>
                  {c.excerpt ? (
                    <p className="m-0 mb-6 flex-1 font-serif text-base leading-relaxed text-ydm-text">
                      {c.excerpt}
                    </p>
                  ) : null}
                  <Link
                    href={`/give/${c.slug}`}
                    className="mt-auto inline-flex items-center gap-1 font-accent text-sm font-semibold text-ydm-gold no-underline hover:underline"
                  >
                    Learn more <span aria-hidden>→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CHARITY STATUS NOTE */}
      <section className="bg-ydm-surface py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 font-serif text-sm leading-relaxed text-ydm-muted">
            Yeshua Deliverance Ministries is a non-profit ministry.
            Tax-receipt eligibility depends on YDM's current charity status —
            please check with us at{" "}
            <a
              href="mailto:donate@ydministries.ca"
              className="text-ydm-ink underline"
            >
              donate@ydministries.ca
            </a>{" "}
            if you need a receipt for a specific gift.
          </p>
        </div>
      </section>
    </>
  );
}
