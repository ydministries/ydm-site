import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

interface MessageRow {
  id: string;
  form_type: string;
  category: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_message: string;
  metadata: Record<string, unknown> | null;
  status: string | null;
  error_message: string | null;
  created_at: string;
}

const PAGE_SIZE = 100;

const FORM_TYPE_LABELS: Record<string, { bishop: string; admin: string }> = {
  contact: { bishop: "Contact", admin: "Contact" },
  prayer: { bishop: "Prayer Request", admin: "Prayer" },
  ask: { bishop: "Ask Bishop", admin: "Ask" },
  guestbook: { bishop: "Guestbook", admin: "Guestbook" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sameDay = new Date().toDateString() === d.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

export default async function MessagesPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: filterTypeRaw } = await props.searchParams;
  const filterType =
    filterTypeRaw && ["contact", "prayer", "ask", "guestbook"].includes(filterTypeRaw)
      ? filterTypeRaw
      : null;

  const profile = await getCurrentProfile();
  const isBishop = profile?.role === "bishop";

  const supabase = await createServerClient();
  let query = supabase
    .from("form_submissions")
    .select(
      "id, form_type, category, visitor_name, visitor_email, visitor_message, metadata, status, error_message, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  if (filterType) {
    query = query.eq("form_type", filterType);
  }
  const { data: rows, count, error } = await query;

  // Counts per form type for the filter chips (independent of the active filter).
  const { data: typeAgg } = await supabase
    .from("form_submissions")
    .select("form_type");
  const countsByType = new Map<string, number>();
  for (const r of typeAgg ?? []) {
    countsByType.set(r.form_type, (countsByType.get(r.form_type) ?? 0) + 1);
  }

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
          Messages
        </h1>
        <p className="mt-1 text-sm text-ydm-muted">
          {isBishop
            ? "Every contact form, prayer request, ask-bishop question, and guestbook entry."
            : `${count ?? 0} total submissions${filterType ? ` · filtered to ${filterType}` : ""}`}
        </p>
      </header>

      {/* Filter chips */}
      <nav className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          href="/admin/messages"
          label="All"
          count={typeAgg?.length ?? 0}
          active={!filterType}
        />
        {(["contact", "prayer", "ask", "guestbook"] as const).map((t) => (
          <FilterChip
            key={t}
            href={`/admin/messages?type=${t}`}
            label={
              isBishop
                ? FORM_TYPE_LABELS[t].bishop
                : FORM_TYPE_LABELS[t].admin
            }
            count={countsByType.get(t) ?? 0}
            active={filterType === t}
          />
        ))}
      </nav>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load: {error.message}
        </p>
      )}

      {/* List */}
      {!error && (rows?.length ?? 0) === 0 ? (
        <div className="rounded border border-dashed border-ydm-line p-10 text-center text-sm text-ydm-muted">
          {filterType
            ? `No ${filterType} messages yet.`
            : "No messages yet — they'll show up here as visitors reach out."}
        </div>
      ) : (
        <ul className="space-y-3">
          {(rows ?? []).map((m: MessageRow) => (
            <MessageCard
              key={m.id}
              message={m}
              isBishop={isBishop}
              labels={FORM_TYPE_LABELS}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  const cls = active
    ? "border-ydm-ink bg-ydm-ink text-white"
    : "border-ydm-line bg-ydm-surface text-ydm-text hover:border-ydm-ink hover:text-ydm-ink";
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium no-underline transition-colors ${cls}`}
    >
      <span>{label}</span>
      <span className="font-accent text-[10px] opacity-70">({count})</span>
    </Link>
  );
}

function MessageCard({
  message: m,
  isBishop,
  labels,
}: {
  message: MessageRow;
  isBishop: boolean;
  labels: Record<string, { bishop: string; admin: string }>;
}) {
  const typeLabel =
    labels[m.form_type]?.[isBishop ? "bishop" : "admin"] ?? m.form_type;
  const replyTo = m.visitor_email ?? "";
  const replySubject =
    m.form_type === "prayer"
      ? "Re: Your prayer request"
      : m.form_type === "ask"
        ? "Re: Your question"
        : "Re: Your message";

  return (
    <li className="rounded-lg border border-ydm-line bg-ydm-surface p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="rounded-full bg-ydm-gold/15 px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-ink">
            {typeLabel}
          </span>
          <h3 className="m-0 font-display text-base text-ydm-ink">
            {m.visitor_name ?? m.visitor_email ?? "Anonymous"}
          </h3>
          {m.visitor_email && (
            <span className="text-xs text-ydm-muted">{m.visitor_email}</span>
          )}
        </div>
        <span className="font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
          {fmtDate(m.created_at)}
        </span>
      </div>

      {m.category && (
        <p className="m-0 mb-2 text-xs text-ydm-muted">
          Category: <span className="text-ydm-text">{m.category}</span>
        </p>
      )}

      <p className="m-0 mb-3 whitespace-pre-wrap font-serif text-sm leading-relaxed text-ydm-text">
        {truncate(m.visitor_message, 600)}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {replyTo && (
          <a
            href={`mailto:${replyTo}?subject=${encodeURIComponent(replySubject)}`}
            className="rounded-full bg-ydm-gold px-4 py-1.5 text-xs font-semibold text-ydm-ink no-underline hover:bg-ydm-gold/90"
          >
            Reply by email
          </a>
        )}
        {!isBishop && m.status === "failed" && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider text-red-800">
            Send failed
          </span>
        )}
        {!isBishop && m.error_message && (
          <span
            className="text-[10px] text-ydm-muted"
            title={m.error_message}
          >
            {truncate(m.error_message, 60)}
          </span>
        )}
      </div>
    </li>
  );
}
