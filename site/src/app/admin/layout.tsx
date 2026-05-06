import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

export const metadata: Metadata = {
  title: "Admin — YDM",
  robots: { index: false, follow: false },
};

interface SidebarLink {
  href: string;
  label: string;
}

// Admin (Mikey) sees the technical surface — page_content, asset URLs,
// version history, etc. Bishop sees a plain-language reskin where the same
// underlying routes are framed in language the writer thinks in.
const ADMIN_SIDEBAR: SidebarLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/testimonials", label: "Testimonies" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/assets", label: "Assets" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/profile", label: "Profile" },
];

const BISHOP_SIDEBAR: SidebarLink[] = [
  { href: "/admin", label: "Home" },
  { href: "/admin/content", label: "Edit pages" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/testimonials", label: "Testimonies" },
  { href: "/admin/subscribers", label: "Newsletter" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/assets", label: "Photos" },
  { href: "/admin/profile", label: "My account" },
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

  // Pull profile for role-aware sidebar. Falls back to admin sidebar if the
  // profile lookup fails (defensive — shouldn't happen for authed users).
  const profile = user ? await getCurrentProfile() : null;
  const sidebarLinks =
    profile?.role === "bishop" ? BISHOP_SIDEBAR : ADMIN_SIDEBAR;

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
              {sidebarLinks.map((l) => (
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
            <div className="mt-6 border-t border-ydm-line pt-4">
              <Link
                href="/"
                className="block rounded px-3 py-2 text-sm font-medium text-ydm-muted no-underline hover:bg-ydm-surface hover:text-ydm-ink"
              >
                ← View site
              </Link>
            </div>
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
