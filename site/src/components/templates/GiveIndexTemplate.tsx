import Link from "next/link";
import { getAllCampaigns } from "@/lib/campaigns";

export async function GiveIndexTemplate(_props: { pageKey?: string } = {}) {
  const campaigns = await getAllCampaigns();

  return (
    <>
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            SUPPORT OUR MISSION
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Make a difference
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Give
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Your generosity fuels every YDM ministry — from outreach to discipleship to worldwide gospel work.
          </p>
        </div>
      </section>

      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {campaigns.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No active campaigns at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {campaigns.map((c) => (
                <article
                  key={c.slug}
                  className="flex flex-col rounded-sm border border-ydm-line bg-ydm-cream/40 p-8 transition-colors hover:border-ydm-gold/60"
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
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
                  >
                    Give <span aria-hidden>→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Below-grid explainer band */}
          <div className="mt-16 rounded-sm bg-ydm-cream/60 p-8 text-center sm:p-10">
            <p className="m-0 mb-3 font-accent text-xs uppercase tracking-[0.3em] text-ydm-muted">
              ALSO ACCEPTED
            </p>
            <h3 className="m-0 mb-3 font-display text-xl uppercase text-ydm-ink sm:text-2xl">
              In-Person & By Mail
            </h3>
            <p className="m-0 font-serif text-base leading-relaxed text-ydm-text">
              Drop your gift in the offering plate at any service, or mail a cheque payable to <strong>Yeshua Deliverance Ministries</strong>. Receipts available on request.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
