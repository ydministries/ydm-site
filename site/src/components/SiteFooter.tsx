"use client";

import Link from "next/link";
import { useContent } from "./ContentProvider";

const FOOTER_PAGES = [
  { label: "nav.header.home", href: "/" },
  { label: "nav.header.about", href: "/about" },
  { label: "nav.header.sermons", href: "/sermons" },
  { label: "nav.header.blog", href: "/blog" },
  { label: "nav.header.shop", href: "/shop" },
  { label: "nav.header.contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { key: "social.facebook", label: "Facebook" },
  { key: "social.instagram", label: "Instagram" },
  { key: "social.youtube", label: "YouTube" },
  { key: "social.linkedin", label: "LinkedIn" },
];

export function SiteFooter() {
  const { content } = useContent();

  const siteName = content.get("site.name")?.value ?? "";
  const tagline = content.get("site.tagline")?.value ?? "";
  const copyright = content.get("site.copyright")?.value ?? "";
  const legalEntity = content.get("site.legal_entity")?.value ?? "";

  const pagesTitle = content.get("nav.footer.col_pages.title")?.value ?? "";
  const contactTitle = content.get("nav.footer.col_contact.title")?.value ?? "";
  const locationTitle =
    content.get("nav.footer.col_location.title")?.value ?? "";

  const email = content.get("contact.email")?.value ?? "";
  const phone = content.get("contact.phone")?.value ?? "";
  const venueName = content.get("contact.venue_name")?.value ?? "";
  const venueAddress = content.get("contact.venue_address")?.value ?? "";
  const venueHost = content.get("contact.venue_host")?.value ?? "";

  return (
    <footer className="bg-ydm-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        {/* Brand */}
        <div>
          <p className="font-display text-2xl text-ydm-gold">{siteName}</p>
          <p className="mt-2 text-sm text-white/60">{tagline}</p>
          <div className="mt-6 flex gap-4">
            {SOCIAL_LINKS.map(({ key, label }) => {
              const url = content.get(key)?.value;
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 transition hover:text-ydm-gold"
                  aria-label={label}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Pages */}
        <div>
          <h3 className="font-display text-lg text-ydm-gold">{pagesTitle}</h3>
          <ul className="mt-4 space-y-2">
            {FOOTER_PAGES.map(({ label, href }) => {
              const text = content.get(label)?.value;
              if (!text) return null;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display text-lg text-ydm-gold">
            {contactTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            {email && <li>{email}</li>}
            {phone && <li>{phone}</li>}
          </ul>
        </div>

        {/* Location */}
        <div>
          <h3 className="font-display text-lg text-ydm-gold">
            {locationTitle}
          </h3>
          <div className="mt-4 space-y-1 text-sm text-white/60">
            {venueName && <p>{venueName}</p>}
            {venueHost && <p>{venueHost}</p>}
            {venueAddress && <p>{venueAddress}</p>}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-6 py-6">
        <p className="text-center text-xs text-white/40">
          {copyright} {legalEntity}
        </p>
      </div>
    </footer>
  );
}
