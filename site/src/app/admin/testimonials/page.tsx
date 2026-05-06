import Link from "next/link";
import { getCurrentProfile } from "@/lib/apiAuth";
import { redirect } from "next/navigation";
import {
  getAllTestimonialsForAdmin,
  type Testimonial,
} from "@/lib/testimonials";
import {
  approveTestimonial,
  deleteTestimonial,
  rejectTestimonial,
  reopenTestimonial,
  toggleFeatured,
} from "./actions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TestimonialsAdminPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/admin/login");

  const testimonials = await getAllTestimonialsForAdmin();
  const pending = testimonials.filter((t) => t.status === "pending");
  const approved = testimonials.filter((t) => t.status === "approved");
  const rejected = testimonials.filter((t) => t.status === "rejected");
  const isBishop = me.role === "bishop";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← {isBishop ? "Home" : "Dashboard"}
        </Link>
        <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Testimonies
        </h1>
        <p className="mt-1 text-sm text-ydm-muted">
          {pending.length} waiting for review · {approved.length} live ·{" "}
          {rejected.length} rejected
        </p>
      </header>

      {/* Pending */}
      <section className="mb-12">
        <h2 className="m-0 mb-4 font-display text-base uppercase tracking-wide text-ydm-ink">
          Pending review {pending.length > 0 ? `(${pending.length})` : ""}
        </h2>
        {pending.length === 0 ? (
          <p className="rounded border border-dashed border-ydm-line bg-ydm-surface p-6 text-center text-sm text-ydm-muted">
            No testimonies waiting for review.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((t) => (
              <PendingCard key={t.id} t={t} />
            ))}
          </ul>
        )}
      </section>

      {/* Approved */}
      <section className="mb-12">
        <h2 className="m-0 mb-4 font-display text-base uppercase tracking-wide text-ydm-ink">
          Live on site {approved.length > 0 ? `(${approved.length})` : ""}
        </h2>
        {approved.length === 0 ? (
          <p className="rounded border border-dashed border-ydm-line bg-ydm-surface p-6 text-center text-sm text-ydm-muted">
            No live testimonies yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {approved.map((t) => (
              <ApprovedCard key={t.id} t={t} />
            ))}
          </ul>
        )}
      </section>

      {/* Rejected */}
      {rejected.length > 0 ? (
        <section>
          <h2 className="m-0 mb-4 font-display text-base uppercase tracking-wide text-ydm-ink">
            Rejected ({rejected.length})
          </h2>
          <ul className="space-y-4">
            {rejected.map((t) => (
              <RejectedCard key={t.id} t={t} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function MetaLine({ t }: { t: Testimonial }) {
  return (
    <p className="m-0 mb-2 flex flex-wrap items-baseline gap-x-3 text-xs text-ydm-muted">
      <span className="font-display text-sm text-ydm-ink">{t.name}</span>
      {t.relationship ? (
        <span className="italic">{t.relationship}</span>
      ) : null}
      <span className="font-accent text-[10px] uppercase tracking-wider">
        {fmtDate(t.createdAt)}
      </span>
      {t.visitorEmail ? (
        <span className="font-mono text-[10px]">{t.visitorEmail}</span>
      ) : null}
    </p>
  );
}

function PendingCard({ t }: { t: Testimonial }) {
  return (
    <li className="rounded-lg border border-ydm-line bg-ydm-surface p-5">
      <MetaLine t={t} />
      <p className="m-0 mb-3 whitespace-pre-wrap font-serif text-sm leading-relaxed text-ydm-text">
        {t.message}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <form action={approveTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full bg-ydm-gold px-4 py-1.5 font-accent text-[11px] font-semibold uppercase tracking-wider text-ydm-ink hover:bg-ydm-gold/90"
          >
            Approve
          </button>
        </form>
        <form action={rejectTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-ydm-line bg-ydm-cream px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-ydm-muted hover:border-ydm-ink hover:text-ydm-ink"
          >
            Reject
          </button>
        </form>
        <form action={deleteTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-red-700 hover:border-red-500"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

function ApprovedCard({ t }: { t: Testimonial }) {
  return (
    <li
      className={`rounded-lg border bg-ydm-surface p-5 ${
        t.isFeatured ? "border-ydm-gold" : "border-ydm-line"
      }`}
    >
      <MetaLine t={t} />
      {t.isFeatured ? (
        <p className="m-0 mb-2 font-accent text-[10px] uppercase tracking-[0.3em] text-ydm-gold">
          Featured
        </p>
      ) : null}
      <p className="m-0 mb-3 whitespace-pre-wrap font-serif text-sm leading-relaxed text-ydm-text">
        {t.message}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <form action={toggleFeatured} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-ydm-line bg-ydm-cream px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-ydm-ink hover:border-ydm-gold"
          >
            {t.isFeatured ? "Unfeature" : "Feature"}
          </button>
        </form>
        <form action={rejectTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-ydm-line bg-ydm-cream px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-ydm-muted hover:border-ydm-ink hover:text-ydm-ink"
          >
            Hide
          </button>
        </form>
        <form action={deleteTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-red-700 hover:border-red-500"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

function RejectedCard({ t }: { t: Testimonial }) {
  return (
    <li className="rounded-lg border border-ydm-line bg-ydm-surface p-5 opacity-70">
      <MetaLine t={t} />
      <p className="m-0 mb-3 whitespace-pre-wrap font-serif text-sm leading-relaxed text-ydm-muted">
        {t.message}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <form action={reopenTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-ydm-line bg-ydm-cream px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-ydm-ink hover:border-ydm-gold"
          >
            Reopen
          </button>
        </form>
        <form action={deleteTestimonial} className="inline">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 font-accent text-[11px] uppercase tracking-wider text-red-700 hover:border-red-500"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
