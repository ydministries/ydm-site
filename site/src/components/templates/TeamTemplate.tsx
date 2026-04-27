import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { fetchPageContent } from "@/lib/content";
import {
  getMinistriesByName,
  getOtherTeam,
  getSermonsByPerson,
  parseMinistriesLed,
} from "@/lib/team";

interface Props {
  pageKey: string; // e.g. "team.huel_wilson"
}

const TEAM_KEY_TO_SLUG: Record<string, string> = {
  "team.huel_wilson":      "bishop-huel-wilson",
  "team.clementinawilson": "clementinawilson",
  "team.huel_clementina":  "huel-and-clementina-wilson",
};

function firstName(fullName: string): string {
  // Strip common titles, take the first remaining token.
  const parts = fullName
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter((p) => p && !/^(Bishop|Rev\.?|Pastor|Dr\.?|Mr\.?|Mrs\.?|Ms\.?)$/i.test(p));
  return parts[0] ?? fullName;
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export async function TeamTemplate({ pageKey }: Props) {
  const content = await fetchPageContent(pageKey);
  const slug = TEAM_KEY_TO_SLUG[pageKey] ?? pageKey.replace(/^team\./, "");

  const portrait = content.get("portrait_url")?.value ?? "";
  const personName = content.get("person_name")?.value ?? "";
  const personTitle = content.get("person_title")?.value ?? "";
  const personBio = content.get("person_bio")?.value ?? "";
  const preaching = (content.get("preaching")?.value ?? "false") === "true";
  const ministriesLed = parseMinistriesLed(content.get("ministries_led")?.value);

  const fName = firstName(personName);
  const ledMinistries = await getMinistriesByName(ministriesLed);
  const sermons = preaching ? await getSermonsByPerson(3) : [];
  const otherTeam = await getOtherTeam(slug, 2);

  return (
    <>
      {/* SECTION 1 — Hero (cream bg, split portrait + text) */}
      <section className="-mx-4 bg-ydm-cream py-20 sm:-mx-6 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* LEFT — portrait */}
            <div className="lg:col-span-5">
              {portrait ? (
                <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm shadow-xl">
                  <Image
                    src={portrait}
                    alt={personName}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              ) : null}
            </div>
            {/* RIGHT — text */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                OUR LEADERSHIP
              </p>
              {personTitle ? (
                <p className="m-0 mb-4 -rotate-[3deg] font-script text-4xl text-ydm-amber sm:text-5xl">
                  {personTitle}
                </p>
              ) : null}
              <h1 className="m-0 mb-4 font-display text-4xl uppercase leading-tight text-ydm-ink sm:text-6xl">
                {personName}
              </h1>
              <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-muted">
                Yeshua Deliverance Ministries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Bio body */}
      {personBio ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                ABOUT
              </p>
              <h2 className="m-0 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
                About {fName}
              </h2>
            </div>
            <div
              className="editable-prose font-serif text-base leading-relaxed text-ydm-text [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(personBio) }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 3 — Ministries they lead */}
      {ledMinistries.length > 0 ? (
        <section className="bg-ydm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                MINISTRIES THEY LEAD
              </p>
              <p className="m-0 mb-3 font-script text-4xl text-ydm-amber sm:text-5xl">
                Faithful in service
              </p>
              <h2 className="m-0 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
                {fName} Leads
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ledMinistries.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ministries/${m.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-ydm-surface no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {m.hero_image ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ydm-ink/20">
                      <Image
                        src={m.hero_image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-ydm-ink transition-colors group-hover:text-ydm-gold">
                      {m.title}
                    </h3>
                    {m.tagline ? (
                      <p className="m-0 font-serif text-sm leading-relaxed text-ydm-muted">
                        {m.tagline}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 4 — Sermons by them (Bishop only) */}
      {sermons.length > 0 ? (
        <section className="-mx-4 bg-ydm-ink py-16 sm:-mx-6 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                FROM {fName.toUpperCase()}&rsquo;S PULPIT
              </p>
              <p className="m-0 mb-3 font-script text-4xl text-ydm-gold sm:text-5xl">
                Listen and grow
              </p>
              <h2 className="m-0 font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                Recent Sermons by {fName}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sermons/${s.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-white/5 no-underline transition-colors hover:bg-white/10"
                >
                  {s.thumbnail ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ydm-ink/40">
                      <Image
                        src={s.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    {s.scripture ? (
                      <p className="m-0 mb-2 font-accent text-xs uppercase tracking-wider text-ydm-gold">
                        {s.scripture}
                      </p>
                    ) : null}
                    <h3 className="m-0 mb-2 font-display text-lg uppercase leading-tight text-white transition-colors group-hover:text-ydm-gold">
                      {s.title}
                    </h3>
                    {s.date ? (
                      <p className="m-0 mt-auto font-accent text-xs uppercase tracking-wider text-white/50">
                        {fmtDate(s.date)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/sermons"
                className="inline-block rounded-full border-2 border-ydm-gold px-7 py-3 font-accent text-sm uppercase tracking-wider text-ydm-gold no-underline transition-colors hover:bg-ydm-gold hover:text-ydm-ink"
              >
                All Sermons
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 5 — Connect block */}
      <section className="bg-ydm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            GET IN TOUCH
          </p>
          <h3 className="m-0 mb-4 font-display text-3xl uppercase leading-none text-ydm-ink sm:text-4xl">
            Connect with {fName}
          </h3>
          <p className="m-0 mb-8 font-serif text-lg leading-relaxed text-ydm-text">
            {fName} would love to hear from you. Reach out via the YDM contact form.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-ydm-gold px-8 py-3 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline transition-colors hover:bg-ydm-gold-light"
          >
            Contact YDM
          </Link>
        </div>
      </section>

      {/* SECTION 6 — Related team */}
      {otherTeam.length > 0 ? (
        <section className="bg-ydm-surface py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
                MEET MORE
              </p>
              <p className="m-0 font-script text-4xl text-ydm-amber sm:text-5xl">
                Our YDM Family
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {otherTeam.map((p) => (
                <Link
                  key={p.slug}
                  href={`/team/${p.slug}`}
                  className="group block overflow-hidden rounded-sm bg-ydm-cream no-underline shadow-sm transition-shadow hover:shadow-lg"
                >
                  {p.portrait ? (
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={p.portrait}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 text-center">
                    <h3 className="m-0 mb-1 font-display text-xl uppercase text-ydm-ink">
                      {p.name}
                    </h3>
                    {p.title ? (
                      <p className="m-0 font-accent text-xs uppercase tracking-[0.25em] text-ydm-gold">
                        {p.title}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 7 — Back link */}
      <section className="bg-ydm-surface py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-wider text-ydm-ink no-underline hover:text-ydm-gold"
          >
            <span aria-hidden>←</span> All Team
          </Link>
        </div>
      </section>
    </>
  );
}
