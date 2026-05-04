import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="m-0 mb-2 font-display text-3xl uppercase tracking-wide text-ydm-ink">
        Profile
      </h1>
      <p className="m-0 mb-8 font-serif text-base text-ydm-muted">
        Your account details. Most settings come in a later phase.
      </p>

      <dl className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface">
        <Row label="Email" value={profile?.email ?? user.email ?? "—"} />
        <Row label="Role" value={profile?.role ?? "(none)"} mono />
        <Row label="User ID" value={user.id} mono small />
        <Row label="Account created" value={fmtDate(user.created_at)} />
        <Row label="Last sign-in" value={fmtDate(user.last_sign_in_at)} />
        <Row
          label="Email confirmed"
          value={user.email_confirmed_at ? fmtDate(user.email_confirmed_at) : "Not confirmed"}
        />
      </dl>

      <form action="/admin/logout" method="post" className="mt-6">
        <button
          type="submit"
          className="rounded border border-ydm-line bg-ydm-surface px-4 py-2 text-sm font-medium text-ydm-ink hover:bg-ydm-cream"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-ydm-line px-5 py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-ydm-muted">{label}</dt>
      <dd
        className={`m-0 break-words ${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"} text-ydm-ink`}
      >
        {value}
      </dd>
    </div>
  );
}
