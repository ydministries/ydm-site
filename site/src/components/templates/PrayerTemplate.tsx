import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";
import { BackendForm, type BackendFormField } from "./_helpers/BackendForm";

const PRAYER_FIELDS: BackendFormField[] = [
  { name: "name", label: "Your Name", type: "text", required: true },
  { name: "email", label: "Email (optional)", type: "email" },
  {
    name: "category",
    label: "What's this for?",
    type: "select",
    options: [
      "Healing",
      "Family",
      "Salvation",
      "Direction",
      "Provision",
      "Other",
    ],
  },
  {
    name: "message",
    label: "Your Prayer Request",
    type: "textarea",
    required: true,
    rows: 7,
  },
  {
    name: "share_anonymously",
    label: "How would you like this shared?",
    type: "select",
    options: [
      "Share with prayer team only",
      "Share anonymously with congregation",
      "Read at prayer meeting",
    ],
  },
];

export async function PrayerTemplate(_props: { pageKey?: string } = {}) {
  const prayer = await fetchPageContent("prayer");

  const heroImage =
    prayer.get("hero_image")?.value ??
    "https://media.ydministries.ca/uploads/2025/09/wmremove-transformed-1.jpeg";

  return (
    <>
      {/* SECTION 1 — Hero (full-bleed dark) */}
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
            fallback="PRAYER REQUESTS"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Stand with us"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="Submit a Prayer Request"
            as="h1"
            className="m-0 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
          <EditableFallback
            keys={["hero_subhead"]}
            fallback="Whatever you're carrying, you don't have to carry it alone. Bishop Wilson and the YDM prayer team will pray over your request personally."
            as="p"
            className="m-0 mt-6 mx-auto max-w-3xl font-serif text-base leading-relaxed text-white/85 sm:text-lg"
          />
        </div>
      </section>

      {/* SECTION 2 — Intro band */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
            We pray for one another
          </h2>
          <EditableFallback
            keys={["intro_body"]}
            mode="rich"
            fallback="Bishop, the elders, and the YDM prayer team faithfully lift every request we receive. Whatever you're carrying — healing, family, direction, provision — bring it before the Lord with us. We pray over each request personally, then trust God for the answer."
            as="div"
            className="font-serif text-lg leading-relaxed text-ydm-text [&_em]:italic [&_p]:mb-4 [&_p:last-child]:mb-0"
          />
        </div>
      </section>

      {/* SECTION 3 — Form */}
      <section className="bg-ydm-surface py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <EditableFallback
              keys={["form_eyebrow"]}
              fallback="SUBMIT A REQUEST"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <h2 className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
              Submit a Request
            </h2>
            <EditableFallback
              keys={["form_intro"]}
              fallback="Submit your prayer request below. Bishop, the elders, and the YDM prayer team will lift your need before the Lord."
              as="p"
              className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
            />
          </div>
          <BackendForm
            formType="prayer"
            fields={PRAYER_FIELDS}
            submitLabel="Send Prayer Request"
            successLabel="Thank you — your prayer request is on its way to the YDM prayer team. We will be praying with you."
          />
        </div>
      </section>

      {/* SECTION 4 — Privacy card */}
      <section className="-mx-4 bg-ydm-cream py-12 sm:-mx-6 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-sm bg-ydm-surface p-8 shadow-sm">
            <EditableFallback
              keys={["privacy_title"]}
              fallback="Your privacy"
              as="h3"
              className="m-0 mb-3 font-display text-xl uppercase text-ydm-ink"
            />
            <EditableFallback
              keys={["privacy_body"]}
              fallback="Your request will be shared only with the YDM prayer team unless you tell us otherwise. We do not publish or republish prayer requests."
              as="p"
              className="m-0 font-serif text-base leading-relaxed text-ydm-text"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4.5 — Urgent / crisis support */}
      <section className="bg-ydm-surface py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-sm border-2 border-ydm-gold/30 bg-ydm-cream/40 p-6 sm:p-8">
            <EditableFallback
              keys={["urgent.title"]}
              fallback="In an Urgent Situation"
              as="h3"
              className="m-0 mb-3 font-display text-xl uppercase text-ydm-ink"
            />
            <EditableFallback
              keys={["urgent.body"]}
              mode="rich"
              fallback="If you are in crisis, please call 911 (or your local emergency line) right away. For immediate spiritual support, call the church at +1 (416) 895-5178 — leave a message and someone will return your call as soon as possible."
              as="div"
              className="font-serif text-base leading-relaxed text-ydm-text [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-display [&_strong]:text-ydm-ink"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 — Other ways to support */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            OTHER WAYS TO STAND WITH US
          </p>
          <p className="m-0 mb-8 font-script text-3xl text-ydm-amber sm:text-4xl">
            Partner with the mission
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/give"
              className="inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
            >
              Give to YDM
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              Contact the Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
