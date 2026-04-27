"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string };

interface MobileNavProps {
  items: NavItem[];
  liveLabel: string;
  giveLabel: string;
}

export function MobileNav({ items, liveLabel, giveLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ydm-ink hover:bg-ydm-cream"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav-drawer"
          className="absolute inset-x-0 top-full border-t border-ydm-line bg-ydm-surface shadow-md"
        >
          <nav className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-base font-medium text-ydm-ink no-underline hover:text-ydm-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-3 border-t border-ydm-line pt-4">
              <Link
                href="/live"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-ydm-gold px-4 py-2 text-center text-sm font-semibold text-ydm-gold no-underline hover:bg-ydm-gold/10"
              >
                {liveLabel}
              </Link>
              <Link
                href="/give"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-ydm-gold px-4 py-2 text-center text-sm font-semibold text-ydm-ink no-underline hover:bg-ydm-gold/90"
              >
                {giveLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
