"use client";

import Link from "next/link";

export function AdminBadge() {
  return (
    <Link
      href="/admin/content"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-ydm-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ydm-ink no-underline shadow-lg transition-transform hover:scale-105"
      title="You're signed in as an editor — click anywhere on the page to edit content."
    >
      <span aria-hidden>✎</span>
      <span>Editing</span>
    </Link>
  );
}
