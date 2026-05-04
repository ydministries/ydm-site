import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — YDM",
  robots: { index: false, follow: false },
};

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/profile", label: "Profile" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/login renders under this layout while the user is unauthed.
  // Render a minimal centred shell in that case (no sidebar — it would only
  // bounce them right back through middleware anyway).
  if (!user) {
    return (
      <div className="min-h-screen bg-ydm-cream">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-3 no-underline"
            >
              <Image
                src="/brand/ydm-logo.png"
                alt="YDM"
                width={48}
                height={48}
                priority
                className="h-12 w-12"
              />
              <span className="font-display text-lg uppercase tracking-[0.2em] text-ydm-ink">
                YDM Admin
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ydm-surface text-ydm-text">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-ydm-line bg-ydm-cream lg:flex">
          <Link
            href="/admin"
            className="flex items-center gap-3 border-b border-ydm-line px-6 py-5 no-underline"
          >
            <Image
              src="/brand/ydm-logo.png"
              alt="YDM"
              width={36}
              height={36}
              priority
              className="h-9 w-9"
            />
            <span className="font-display text-sm uppercase tracking-[0.2em] text-ydm-ink">
              YDM Admin
            </span>
          </Link>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {SIDEBAR_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded px-3 py-2 text-sm font-medium text-ydm-text no-underline hover:bg-ydm-surface hover:text-ydm-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action="/admin/logout" method="post" className="border-t border-ydm-line p-4">
            <button
              type="submit"
              className="w-full rounded border border-ydm-line bg-ydm-surface px-3 py-2 text-sm font-medium text-ydm-ink hover:bg-ydm-cream"
            >
              Sign out
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-ydm-line bg-ydm-surface px-6 py-4">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/brand/ydm-logo.png"
                alt="YDM"
                width={32}
                height={32}
                priority
                className="h-8 w-8"
              />
              <span className="font-display text-sm uppercase tracking-[0.18em] text-ydm-ink">
                YDM Admin
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="hidden text-sm text-ydm-muted sm:inline">
                Signed in as <span className="text-ydm-ink">{user.email}</span>
              </span>
              <form action="/admin/logout" method="post" className="lg:hidden">
                <button
                  type="submit"
                  className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-sm font-medium text-ydm-ink hover:bg-ydm-cream"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
