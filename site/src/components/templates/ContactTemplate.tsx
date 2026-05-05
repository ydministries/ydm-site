import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableFallback } from "./_helpers/EditableFallback";
import { BackendForm, type BackendFormField } from "./_helpers/BackendForm";

const CONTACT_FIELDS: BackendFormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone Number", type: "tel" },
  {
    name: "category",
    label: "Reason for Contact",
    type: "select",
    options: [
      {
        group: "Spiritual & Personal Care",
        options: [
          "Prayer Request",
          "Pastoral Care & Counseling",
          "Testimony",
          "Baptism & Membership",
        ],
      },
      {
        group: "Ministry & Discipleship",
        options: [
          "Bible Study Question",
          "Volunteer / Serve",
          "Sunday Service",
          "Ministry Question",
        ],
      },
      {
        group: "Partnership & Legacy",
        options: [
          "Donations & Partnership",
          "Sponsor an Event",
          "Media / Press",
          "Building Fund",
        ],
      },
      {
        group: "General & Technical",
        options: ["Website Feedback", "General Inquiry"],
      },
    ],
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    rows: 6,
    placeholder: "Your message…",
  },
];

function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconPhone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export async function ContactTemplate(_props: { pageKey?: string } = {}) {
  const contact = await fetchPageContent("contact");
  const global = await fetchPageContent("global");

  const heroImage =
    contact.get("hero_image")?.value ??
    "https://media.ydministries.ca/uploads/2025/09/PHOTO-2025-04-11-11-50-46.jpg";

  const phone = global.get("contact.phone")?.value ?? "+1 (416) 895-5178";
  const email = global.get("contact.email")?.value ?? "Info@YDMinistries.ca";
  const sundayService = global.get("service.sunday")?.value ?? "1:00 PM, every 4th Sunday";
  const bibleStudy = global.get("service.bible_study")?.value ?? "Thursdays, 7:00 PM";

  const venueAddress = "Mississauga Church of God\n2460 The Collegeway, Mississauga, ON L5L 1V3";
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Mississauga Church of God, 2460 The Collegeway, Mississauga, ON L5L 1V3",
  )}`;
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

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
            fallback="GET IN TOUCH"
            as="p"
            className="m-0 mb-4 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
          />
          <EditableFallback
            keys={["hero_script"]}
            fallback="We'd love to hear from you"
            as="p"
            className="m-0 mb-4 -rotate-[3deg] font-script text-5xl text-ydm-gold sm:text-6xl"
          />
          <EditableFallback
            keys={["hero_title"]}
            fallback="Contact Us"
            as="h1"
            className="m-0 font-display text-5xl uppercase leading-none text-white sm:text-7xl"
          />
        </div>
      </section>

      {/* SECTION 2 — 2-col grid: info left, form right */}
      <section className="bg-ydm-surface py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-12">
          {/* LEFT — info column */}
          <div>
            <EditableFallback
              keys={["info_eyebrow"]}
              fallback="GET IN TOUCH"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <EditableFallback
              keys={["info_heading"]}
              fallback="We're Here for You"
              as="h2"
              className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
            />
            <EditableFallback
              keys={["info_body"]}
              fallback="Whether you have a question, need prayer, want to volunteer, or just want to say hello — our team is ready to help."
              as="p"
              className="m-0 mb-10 font-serif text-base leading-relaxed text-ydm-muted"
            />

            <div className="mb-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ydm-gold/10">
                  <IconPin className="text-ydm-gold" />
                </div>
                <div>
                  <h4 className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink">
                    Where We Meet
                  </h4>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m-0 block whitespace-pre-line font-serif text-sm leading-relaxed text-ydm-muted no-underline transition-colors hover:text-ydm-gold"
                  >
                    {venueAddress}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ydm-gold/10">
                  <IconPhone className="text-ydm-gold" />
                </div>
                <div>
                  <h4 className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink">
                    Phone
                  </h4>
                  <a
                    href={telHref}
                    className="m-0 font-serif text-sm text-ydm-muted no-underline transition-colors hover:text-ydm-gold"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ydm-gold/10">
                  <IconMail className="text-ydm-gold" />
                </div>
                <div>
                  <h4 className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink">
                    Email
                  </h4>
                  <a
                    href={`mailto:${email}`}
                    className="m-0 break-words font-serif text-sm text-ydm-muted no-underline transition-colors hover:text-ydm-gold"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ydm-gold/10">
                  <IconClock className="text-ydm-gold" />
                </div>
                <div>
                  <h4 className="m-0 mb-1 font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink">
                    Service Times
                  </h4>
                  <p className="m-0 font-serif text-sm text-ydm-muted">
                    Sunday Service: {sundayService}
                  </p>
                  <p className="m-0 font-serif text-sm text-ydm-muted">
                    Bible Study: {bibleStudy}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-ydm-cream p-6">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ydm-gold">
                <Image
                  src="/brand/ydm-logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="opacity-95"
                />
              </div>
              <div>
                <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-ink">
                  Yeshua Deliverance Ministries Team
                </p>
                <p className="m-0 mt-1 font-serif text-xs text-ydm-muted">
                  A real person will read and respond to your message.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — form column */}
          <div>
            <EditableFallback
              keys={["form_eyebrow"]}
              fallback="SEND US A MESSAGE"
              as="p"
              className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold"
            />
            <EditableFallback
              keys={["form_heading"]}
              fallback="We'd Love to Hear from You"
              as="h2"
              className="m-0 mb-4 font-display text-4xl uppercase leading-none text-ydm-ink sm:text-5xl"
            />
            <EditableFallback
              keys={["form_intro"]}
              fallback="Fill out the form below and we'll get back to you as soon as we can."
              as="p"
              className="m-0 font-serif text-base leading-relaxed text-ydm-muted"
            />

            <div className="mt-6">
              <BackendForm
                formType="contact"
                fields={CONTACT_FIELDS}
                submitLabel="Send Message"
                successLabel="Thank you for contacting YDM. We'll be in touch soon."
              />
            </div>

            <p className="mt-4 text-center font-serif text-xs text-ydm-muted">
              Need immediate help? Call{" "}
              <a href={telHref} className="text-ydm-gold no-underline hover:underline">
                {phone}
              </a>{" "}
              or email{" "}
              <a
                href={`mailto:${email}`}
                className="break-words text-ydm-gold no-underline hover:underline"
              >
                {email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
