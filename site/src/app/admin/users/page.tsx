import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/apiAuth";
import {
  deleteUserAction,
  inviteUserAction,
  updateRoleAction,
} from "./actions";
import { RoleSelect } from "./RoleSelect";

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  email: string;
  role: "admin" | "bishop";
  createdAt: string;
  lastSignInAt: string | null;
  isSelf: boolean;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const min = 60_000,
    hr = 60 * min,
    day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return fmtDate(iso);
}

export default async function UsersPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== "admin") {
    // Bishop-and-below shouldn't even see this surface. Bounce to dashboard.
    redirect("/admin");
  }

  const sb = adminClient();

  // Pull profiles + auth.users in parallel. Profiles has the role; auth has
  // the timestamps. Merge by id.
  const [profilesRes, usersRes] = await Promise.all([
    sb.from("profiles").select("id, email, role"),
    sb.auth.admin.listUsers({ perPage: 200 }),
  ]);

  if (profilesRes.error || usersRes.error) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← Dashboard
        </Link>
        <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Users
        </h1>
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load:{" "}
          {profilesRes.error?.message ??
            usersRes.error?.message ??
            "unknown"}
        </p>
      </div>
    );
  }

  const authById = new Map(usersRes.data.users.map((u) => [u.id, u]));

  const rows: UserRow[] = (profilesRes.data ?? [])
    .map((p) => {
      const u = authById.get(p.id);
      return {
        id: p.id,
        email: p.email ?? u?.email ?? "(unknown)",
        role: (p.role ?? "bishop") as "admin" | "bishop",
        createdAt: u?.created_at ?? "",
        lastSignInAt: u?.last_sign_in_at ?? null,
        isSelf: p.id === me.userId,
      };
    })
    .sort((a, b) => {
      // Self first, then admins, then bishops, then by createdAt desc.
      if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });

  // Pending invites = auth.users rows that haven't confirmed yet AND aren't
  // in the profiles table (or are but haven't signed in).
  const pendingInvites = usersRes.data.users.filter(
    (u) => !u.last_sign_in_at && u.email_confirmed_at === null,
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-ydm-muted no-underline hover:text-ydm-ink"
        >
          ← Dashboard
        </Link>
        <h1 className="m-0 mt-1 font-display text-3xl uppercase tracking-wide text-ydm-ink">
          Users
        </h1>
        <p className="mt-1 text-sm text-ydm-muted">
          {rows.length} active editor{rows.length === 1 ? "" : "s"}
          {pendingInvites.length > 0
            ? ` · ${pendingInvites.length} pending invite${pendingInvites.length === 1 ? "" : "s"}`
            : ""}
        </p>
      </header>

      {/* Invite form */}
      <section className="mb-8 rounded-lg border border-ydm-line bg-ydm-surface p-5">
        <h2 className="m-0 mb-3 font-display text-base uppercase tracking-wide text-ydm-ink">
          Invite an editor
        </h2>
        <p className="m-0 mb-4 text-sm text-ydm-muted">
          They'll receive a YDM-branded email with a one-time link to set
          their password and sign in.
        </p>
        <form
          action={inviteUserAction}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="new.editor@example.com"
            className="rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
          />
          <select
            name="role"
            defaultValue="bishop"
            className="rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
          >
            <option value="bishop">Bishop (editor)</option>
            <option value="admin">Admin (full access)</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-ydm-gold px-5 py-2 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90"
          >
            Send invite
          </button>
        </form>
      </section>

      {/* Active users table */}
      <div className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ydm-line bg-ydm-cream/40">
              <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                Role
              </th>
              <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                Last sign-in
              </th>
              <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u.id}
                className="border-b border-ydm-line/60 last:border-0"
              >
                <td className="px-4 py-3 font-mono text-xs text-ydm-ink">
                  {u.email}
                  {u.isSelf && (
                    <span className="ml-2 rounded-full bg-ydm-gold/20 px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-ink">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <RolePill role={u.role} />
                </td>
                <td className="px-4 py-3 text-xs text-ydm-muted">
                  {relativeTime(u.lastSignInAt)}
                </td>
                <td className="px-4 py-3 text-xs text-ydm-muted">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.isSelf ? (
                    <span className="font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                      —
                    </span>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <form action={updateRoleAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <RoleSelect defaultValue={u.role} />
                      </form>
                      <form action={deleteUserAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-300 bg-red-50 px-3 py-1 font-accent text-[10px] uppercase tracking-wider text-red-700 hover:border-red-500"
                        >
                          Revoke
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <section className="mt-8">
          <h2 className="m-0 mb-3 font-display text-base uppercase tracking-wide text-ydm-ink">
            Pending invites
          </h2>
          <div className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ydm-line bg-ydm-cream/40">
                  <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Invited
                  </th>
                  <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-ydm-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-ydm-line/60 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ydm-ink">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-xs text-ydm-muted">
                      {fmtDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteUserAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-300 bg-red-50 px-3 py-1 font-accent text-[10px] uppercase tracking-wider text-red-700 hover:border-red-500"
                        >
                          Cancel invite
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    admin: {
      label: "Admin",
      cls: "bg-ydm-ink text-white",
    },
    bishop: {
      label: "Bishop",
      cls: "bg-ydm-gold/20 text-ydm-ink",
    },
  };
  const m = map[role] ?? { label: role, cls: "bg-ydm-cream text-ydm-muted" };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
