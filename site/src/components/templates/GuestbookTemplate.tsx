import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";
import { BackendForm, type BackendFormField } from "./_helpers/BackendForm";

const GUESTBOOK_FIELDS: BackendFormField[] = [
  { name: "name", label: "Your Name", type: "text", required: true },
  {
    name: "email",
    label: "Email (optional)",
    type: "email",
    placeholder: "(optional, won't be displayed)",
  },
  {
    name: "location",
    label: "Where are you visiting from?",
    type: "text",
    placeholder: "City / Country",
  },
  {
    name: "message",
    label: "Your Message",
    type: "textarea",
    required: true,
    rows: 7,
    placeholder: "Share your thoughts, a testimony, or just say hello…",
  },
];

export async function GuestbookTemplate(_props: { pageKey?: string } = {}) {
  const guestbook = await fetchPageContent("guestbook");

  const heroImage =
    guestbook.get("hero_image")?.value ??
    "https://media.ydministries.ca/uploads/2025/09/PHOTO-2025-04-11-11-50-46.jpg";

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
            fallback="GUESTBOOK"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="Sign our wall"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="Guestbook"
            as="h1"
            className="m-0 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
        </div>
      </section>

      {/* SECTION 2 — Intro band */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="m-0 mb-6 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
            Leave a note for the YDM family
          </h2>
          <EditableFallback
            keys={["p.01"]}
            fallback="Leave a note for the YDM family. Share what God is doing in your life, a word of encouragement, or a greeting from wherever you're worshipping with us."
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
              fallback="LEAVE A NOTE"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <h2 className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl">
              Sign the Guestbook
            </h2>
            <EditableFallback
              keys={["form_intro"]}
              fallback="Sign our guestbook with a word of encouragement, a testimony, or just to say hello. Bishop loves hearing from the YDM family."
              as="p"
              className="m-0 font-serif text-lg leading-relaxed text-ydm-text"
            />
          </div>
          <BackendForm
            formType="guestbook"
            fields={GUESTBOOK_FIELDS}
            submitLabel="Sign the Guestbook"
            successLabel="Thank you for signing our guestbook! Your note has been added."
          />
        </div>
      </section>

      {/* SECTION 4 — Privacy note */}
      <section className="-mx-4 bg-ydm-cream py-8 sm:-mx-6 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="m-0 text-center font-serif text-sm leading-relaxed text-ydm-muted">
            Your email and last name are never displayed publicly. We may
            feature notes in newsletters or services, sharing first name + city
            only.
          </p>
        </div>
      </section>

      {/* SECTION 5 — Browse YDM CTA */}
      <section className="bg-ydm-surface py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            EXPLORE MORE
          </p>
          <p className="m-0 mb-8 font-script text-3xl text-ydm-amber sm:text-4xl">
            Worship with us
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sermons"
              className="inline-block rounded-full bg-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
            >
              Watch Sermons
            </Link>
            <Link
              href="/events"
              className="inline-block rounded-full border-2 border-ydm-ink px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-ink hover:text-white"
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
