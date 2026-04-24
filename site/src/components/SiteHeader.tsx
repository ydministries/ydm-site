"use client";

import Link from "next/link";
import { useContent } from "./ContentProvider";
import { useState } from "react";

const NAV_LINKS = [
  { fieldKey: "nav.header.home", href: "/" },
  { fieldKey: "nav.header.about", href: "/about" },
  { fieldKey: "nav.header.sermons", href: "/sermons" },
  { fieldKey: "nav.header.blog", href: "/blog" },
  { fieldKey: "nav.header.shop", href: "/shop" },
  { fieldKey: "nav.header.contact", href: "/contact" },
];

export function SiteHeader() {
  const { content } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);

  const siteName = content.get("site.name")?.value ?? "";
  const giveCta = content.get("nav.header.give_cta")?.value ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-ydm-ink/10 bg-ydm-off/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl text-ydm-ink">
          {siteName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ fieldKey, href }) => {
            const label = content.get(fieldKey)?.value;
            if (!label) return null;
            return (
              <Link
                key={fieldKey}
                href={href}
                className="text-sm font-medium text-ydm-ink/70 transition hover:text-ydm-ink"
              >
                {label}
              </Link>
            );
          })}
          {giveCta && (
            <Link
              href="/give"
              className="rounded-full bg-ydm-gold px-6 py-2 text-sm font-semibold text-ydm-ink transition hover:bg-ydm-gold/90"
            >
              {giveCta}
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-ydm-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-ydm-ink/10 bg-ydm-off px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ fieldKey, href }) => {
              const label = content.get(fieldKey)?.value;
              if (!label) return null;
              return (
                <Link
                  key={fieldKey}
                  href={href}
                  className="text-sm font-medium text-ydm-ink/70"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            {giveCta && (
              <Link
                href="/give"
                className="rounded-full bg-ydm-gold px-6 py-2 text-center text-sm font-semibold text-ydm-ink"
                onClick={() => setMenuOpen(false)}
              >
                {giveCta}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
