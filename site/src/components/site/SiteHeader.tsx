import Link from "next/link";
import Image from "next/image";
import { fetchPageContent } from "@/lib/content";
import { EditableContent } from "@/components/EditableContent";
import { MobileNav } from "./MobileNav";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/sermons", label: "Sermons" },
  { href: "/ministries", label: "Ministries" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const global = await fetchPageContent("global");
  const liveLabel = global.get("nav.live_label")?.value ?? "Watch Live";
  const giveLabel = global.get("nav.donate_label")?.value ?? "Give";

  return (
    <header className="sticky top-0 z-40 border-b border-ydm-line bg-ydm-surface/90 backdrop-blur supports-[backdrop-filter]:bg-ydm-surface/75">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image
            src="/brand/ydm-logo.png"
            alt="YDM"
            width={48}
            height={48}
            priority
            className="h-12 w-12"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm tracking-[0.18em] text-ydm-ink">
              YESHUA DELIVERANCE
            </span>
            <span className="font-display text-base tracking-[0.18em] text-ydm-gold">
              MINISTRIES
            </span>
          </span>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-ydm-muted no-underline hover:text-ydm-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/live"
            className="rounded-full border border-ydm-gold px-4 py-2 text-sm font-semibold text-ydm-gold no-underline hover:bg-ydm-gold/10"
          >
            <EditableContent fieldKey="nav.live_label" as="span" />
          </Link>
          <Link
            href="/give"
            className="rounded-full bg-ydm-gold px-4 py-2 text-sm font-semibold text-ydm-ink no-underline hover:bg-ydm-gold/90"
          >
            <EditableContent fieldKey="nav.donate_label" as="span" />
          </Link>
        </div>

        <MobileNav items={NAV} liveLabel={liveLabel} giveLabel={giveLabel} />
      </div>
    </header>
  );
}
