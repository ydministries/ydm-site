import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

interface CardProps {
  href: string;
  title: string;
  body: string;
  status?: "ready" | "soon";
  /** Optional badge — e.g. "3 unread", "247". Renders next to title for bishop. */
  badge?: string;
}

function Card({ href, title, body, status = "ready", badge }: CardProps) {
  const inner = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="m-0 font-display text-base uppercase tracking-wide text-ydm-ink">
          {title}
        </h3>
        {status === "soon" && (
          <span className="rounded-full bg-ydm-cream px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
            Coming soon
          </span>
        )}
        {badge && status === "ready" && (
          <span className="rounded-full bg-ydm-gold/20 px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-ink">
            {badge}
          </span>
        )}
      </div>
      <p className="m-0 text-sm leading-relaxed text-ydm-muted">{body}</p>
    </>
  );
  const baseClass =
    "block rounded-lg border border-ydm-line bg-ydm-surface p-6 no-underline transition-shadow";
  if (status === "ready") {
    return (
      <Link href={href} className={`${baseClass} hover:shadow-md`}>
        {inner}
      </Link>
    );
  }
  return <div className={`${baseClass} opacity-70`}>{inner}</div>;
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getCurrentProfile();
  const isBishop = profile?.role === "bishop";

  // Pull counts in parallel — both views use them, just frame them differently.
  const [
    { count: fieldCount },
    { data: keyRows },
    { count: assetCount },
    { count: messageCount },
    { count: subscriberCount },
    { count: pendingTestimonials },
  ] = await Promise.all([
    supabase.from("page_content").select("page_key", { count: "exact", head: true }),
    supabase.from("page_content").select("page_key"),
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase.from("form_submissions").select("id", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed"),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  const pageCount = keyRows
    ? new Set(keyRows.map((r) => r.page_key)).size
    : 0;

  if (isBishop) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="m-0 mb-2 font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Welcome, Bishop
        </h1>
        <p className="m-0 mb-8 font-serif text-base text-ydm-muted">
          Here's what's happening on the YDM website. Click any card to make
          changes.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            href="/admin/content"
            title="Edit pages"
            body="Change words, headings, or CTAs anywhere on the site. Pick a page to start."
          />
          <Card
            href="/admin/messages"
            title="Messages"
            badge={messageCount ? `${messageCount} total` : undefined}
            body="Every contact form, prayer request, ask-bishop question, and guestbook entry."
          />
          <Card
            href="/admin/subscribers"
            title="Newsletter"
            badge={subscriberCount ? `${subscriberCount} subscribed` : undefined}
            body="People who've signed up for YDM email updates. Export the list anytime."
          />
          <Card
            href="/admin/testimonials"
            title="Testimonies"
            badge={
              pendingTestimonials
                ? `${pendingTestimonials} to review`
                : undefined
            }
            body="Stories shared by members and visitors. Review and approve before they appear publicly."
          />
          <Card
            href="/admin/assets"
            title="Photos"
            body="Upload new pictures for the gallery, leader portraits, sermon thumbnails, and more."
          />
        </div>

        <div className="mt-10 rounded-lg border border-ydm-line bg-ydm-cream p-5 text-sm leading-relaxed text-ydm-text">
          <p className="m-0 mb-2 font-display text-xs uppercase tracking-wider text-ydm-gold">
            Tip
          </p>
          <p className="m-0">
            You can also edit any text directly on the live site — visit{" "}
            <Link href="/" className="text-ydm-ink underline">
              ydministries.ca
            </Link>
            , hover over the words you want to change, and click the gold pencil
            icon. Changes save automatically.
          </p>
        </div>
      </div>
    );
  }

  // Admin (Mikey) — keeps the technical surface.
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="m-0 mb-2 font-display text-3xl uppercase tracking-wide text-ydm-ink">
        Welcome
      </h1>
      <p className="m-0 mb-8 font-serif text-base text-ydm-muted">
        Signed in as <span className="text-ydm-ink">{user?.email}</span>.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          href="/admin/content"
          title={`Content (${pageCount} pages · ${fieldCount ?? 0} fields)`}
          body="Edit headings, body copy, taglines, and CTAs across every page on the site."
        />
        <Card
          href="/admin/messages"
          title={`Messages (${messageCount ?? 0})`}
          body="Form submissions across contact / prayer / ask / guestbook."
        />
        <Card
          href="/admin/subscribers"
          title={`Subscribers (${subscriberCount ?? 0} subscribed)`}
          body="Newsletter signups and unsubscribes; CSV export + manual unsub."
        />
        <Card
          href="/admin/testimonials"
          title={`Testimonies${pendingTestimonials ? ` (${pendingTestimonials} pending)` : ""}`}
          body="Curated testimonials with approval workflow. Pending → approved → public grid."
        />
        <Card
          href="/admin/assets"
          title={`Assets (${assetCount ?? 0})`}
          body="Upload images and copy URLs for use in content fields."
        />
        <Card
          href="/admin/profile"
          title="Profile"
          body="Your account: email, role, and account details."
        />
        <Card
          href="/admin/users"
          title="Users"
          body="Invite editors, change roles, revoke access. Admin-only."
        />
      </div>
    </div>
  );
}
