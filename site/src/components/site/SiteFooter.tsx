import Link from "next/link";
import { fetchPageContent } from "@/lib/content";
import { EditableContent } from "@/components/EditableContent";

const QUICK_LINKS: Array<{ href: string; label: string }> = [
  { href: "/about", label: "About" },
  { href: "/sermons", label: "Sermons" },
  { href: "/ministries", label: "Ministries" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL_LINKS: Array<{ fieldKey: string; label: string; icon: "fb" | "ig" | "yt" }> = [
  { fieldKey: "social.facebook", label: "Facebook", icon: "fb" },
  { fieldKey: "social.instagram", label: "Instagram", icon: "ig" },
  { fieldKey: "social.youtube", label: "YouTube", icon: "yt" },
];

function SocialIcon({ kind }: { kind: "fb" | "ig" | "yt" }) {
  if (kind === "fb") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.75 8.44-4.91 8.44-9.93z" />
      </svg>
    );
  }
  if (kind === "ig") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12 9.6 15.6z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export async function SiteFooter() {
  const global = await fetchPageContent("global");
  const get = (k: string) => global.get(k)?.value ?? "";

  const tagline = get("footer.tagline");
  const address = get("contact.address");
  const sunday = get("service.sunday");
  const bibleStudy = get("service.bible_study");
  const email = get("contact.email");
  const phone = get("contact.phone");

  return (
    <footer className="bg-ydm-dark text-ydm-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        {/* Col 1 — brand + address */}
        <div className="space-y-3">
          <p className="font-display text-3xl font-bold text-ydm-gold leading-none">
            <EditableContent fieldKey="site_short" as="span" />
          </p>
          {tagline && (
            <p className="text-sm text-ydm-cream/70">
              <EditableContent fieldKey="footer.tagline" as="span" />
            </p>
          )}
          {address && (
            <p className="text-sm text-ydm-cream/60">
              <EditableContent fieldKey="contact.address" as="span" />
            </p>
          )}
        </div>

        {/* Col 2 — quick links */}
        <div>
          <h4 className="font-display text-lg font-semibold text-ydm-gold mt-0 mb-4">
            Explore
          </h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-ydm-cream/70 no-underline hover:text-ydm-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — service times */}
        <div>
          <h4 className="font-display text-lg font-semibold text-ydm-gold mt-0 mb-4">
            Gather
          </h4>
          <ul className="space-y-3 text-sm text-ydm-cream/70">
            {sunday && (
              <li className="flex items-start gap-2">
                <ClockIcon />
                <span>
                  <EditableContent fieldKey="service.sunday" as="span" />
                </span>
              </li>
            )}
            {bibleStudy && (
              <li className="flex items-start gap-2">
                <ClockIcon />
                <span>
                  <EditableContent fieldKey="service.bible_study" as="span" />
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Col 4 — connect */}
        <div>
          <h4 className="font-display text-lg font-semibold text-ydm-gold mt-0 mb-4">
            Connect
          </h4>
          <ul className="space-y-2 text-sm text-ydm-cream/70">
            {email && (
              <li>
                <a href={`mailto:${email}`} className="text-ydm-cream/70 no-underline hover:text-ydm-gold">
                  <EditableContent fieldKey="contact.email" as="span" />
                </a>
              </li>
            )}
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-ydm-cream/70 no-underline hover:text-ydm-gold">
                  <EditableContent fieldKey="contact.phone" as="span" />
                </a>
              </li>
            )}
          </ul>
          <ul className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => {
              const url = get(s.fieldKey);
              if (!url) return null;
              return (
                <li key={s.fieldKey}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ydm-cream/20 text-ydm-cream/70 no-underline hover:border-ydm-gold hover:text-ydm-gold"
                  >
                    <SocialIcon kind={s.icon} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-ydm-cream/10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="m-0 text-center text-xs text-ydm-cream/50">
            <EditableContent fieldKey="footer.copyright" as="span" />
          </p>
        </div>
      </div>
    </footer>
  );
}
