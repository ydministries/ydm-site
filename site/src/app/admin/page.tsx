import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

interface CardProps {
  href: string;
  title: string;
  body: string;
  status: "ready" | "soon";
}

function Card({ href, title, body, status }: CardProps) {
  const inner = (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="m-0 font-display text-base uppercase tracking-wide text-ydm-ink">
          {title}
        </h3>
        {status === "soon" && (
          <span className="rounded-full bg-ydm-cream px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
            Coming soon
          </span>
        )}
      </div>
      <p className="m-0 text-sm leading-relaxed text-ydm-muted">{body}</p>
    </>
  );
  const baseClass = "block rounded-lg border border-ydm-line bg-ydm-surface p-6 no-underline transition-shadow";
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

  // Counts for the dashboard cards.
  const { count: pageCount } = await supabase
    .from("page_content")
    .select("page_key", { count: "exact", head: true });

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
          title={`Content (${pageCount ?? 0} rows)`}
          body="Edit headings, body copy, taglines, and CTAs across every page on the site."
          status="soon"
        />
        <Card
          href="/admin/profile"
          title="Profile"
          body="Your account: email, role, and account details."
          status="ready"
        />
        <Card
          href="/admin/users"
          title="Users"
          body="Manage who can sign in and edit. Admin-only feature."
          status="soon"
        />
        <Card
          href="/admin/media"
          title="Media"
          body="Upload and manage images across pages, blog posts, sermons, and ministries."
          status="soon"
        />
        <Card
          href="/admin/sermons"
          title="Sermons"
          body="Add new sermon recordings, scripture references, and metadata."
          status="soon"
        />
        <Card
          href="/admin/events"
          title="Events"
          body="Create and edit upcoming events, dates, and venues."
          status="soon"
        />
      </div>
    </div>
  );
}
