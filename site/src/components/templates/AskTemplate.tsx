import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";
import { BackendForm, type BackendFormField } from "./_helpers/BackendForm";

const ASK_FIELDS: BackendFormField[] = [
  { name: "name", label: "Your Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "category",
    label: "Topic",
    type: "select",
    options: [
      "Faith & Doctrine",
      "Scripture Interpretation",
      "Christian Living",
      "Marriage & Family",
      "Prayer & Worship",
      "Other",
    ],
  },
  {
    name: "message",
    label: "Your Question",
    type: "textarea",
    required: true,
    rows: 7,
    placeholder: "Type your question here…",
  },
];

export async function AskTemplate(_props: { pageKey?: string } = {}) {
  const ask = await fetchPageContent("ask");

  const heroImage =
    ask.get("hero_image")?.value ??
    "https://media.ydministries.ca/uploads/2025/09/197d2535-366a-4d08-838f-6ae99ec99188-e1758582608583.jpg";

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="relative -mx-4 -mt-8 isolate flex min-h-[55vh] items-center overflow-hidden bg-ydm-ink sm:-mx-6">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ydm-ink/85 via-ydm-ink/65 to-ydm-ink/90" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-4 py-24 text-center sm:px-6">
          <EditableFallback
            keys={["hero_eyebrow"]}
            fallback="ASK BISHOP"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Got a question?"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="Ask Bishop"
            as="h1"
            className="m-0 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
        </div>
      </section>

      {/* SECTION 2 — Intro band */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
            Bishop reads every question
          </h2>
          <EditableFallback
            keys={["p.01"]}
            fallback="Have a question about faith, scripture, or the Christian walk? Submit it below and Bishop Wilson will share his response in an upcoming message."
            as="p"
            className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
          />
        </div>
      </section>

      {/* SECTION 3 — Form */}
      <section className="bg-ydm-surface py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <EditableFallback
              keys={["form_eyebrow"]}
              fallback="SUBMIT YOUR QUESTION"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <h2 className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
              Submit Your Question
            </h2>
            <EditableFallback
              keys={["form_intro"]}
              fallback="Have a question about faith, scripture, or the Christian walk? Bishop Wilson personally responds to questions submitted by the YDM community."
              as="p"
              className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
            />
          </div>
          <BackendForm
            formType="ask"
            fields={ASK_FIELDS}
            submitLabel="Submit Question"
            successLabel="Thank you! Your question has been received. Bishop will respond personally as soon as possible."
          />
        </div>
      </section>

      {/* SECTION 4 — Response time note */}
      <section className="-mx-4 bg-ydm-cream py-12 sm:-mx-6 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-sm bg-ydm-surface p-8 shadow-sm">
            <h3 className="m-0 mb-3 font-display text-xl uppercase text-ydm-ink">
              When can I expect a response?
            </h3>
            <p className="m-0 font-serif text-base leading-relaxed text-ydm-text">
              Bishop reads every question personally. Responses typically take
              a few days. Some questions may be addressed in upcoming sermons
              or blog posts.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Other ways CTA */}
      <section className="bg-ydm-surface py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            OTHER WAYS TO CONNECT
          </p>
          <p className="m-0 mb-8 font-script text-3xl text-ydm-amber sm:text-4xl">
            Reach out to the team
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
            >
              Contact Us
            </Link>
            <Link
              href="/prayer"
              className="inline-block rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              Submit a Prayer Request
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
