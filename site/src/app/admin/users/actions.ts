"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/apiAuth";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Invite a new editor (admin or bishop). Sends a Supabase Auth invite email
 * (branded via the docs/auth-email-templates/invite-user.html template);
 * the invitee clicks the link, lands on /admin/auth/reset, sets a password,
 * and is signed in.
 *
 * The on_auth_user_created trigger creates a profile row with role='bishop'
 * by default. If the caller requested role='admin', we follow up with an
 * UPDATE to flip the role on that newly-created row. Race-safe because
 * the trigger fires synchronously inside the inviteUserByEmail call.
 */
export async function inviteUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const role = formData.get("role")?.toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("[admin/users] invite: invalid email", { email });
    return;
  }
  if (role !== "admin" && role !== "bishop") {
    console.error("[admin/users] invite: invalid role", { role });
    return;
  }

  const sb = adminClient();
  const { data: invited, error: inviteErr } =
    await sb.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/admin/auth/reset`,
    });

  if (inviteErr || !invited?.user) {
    console.error("[admin/users] invite failed:", inviteErr);
    return;
  }

  // Trigger has now created a profile row with role='bishop' default.
  // If admin was requested, flip it.
  if (role === "admin") {
    const { error: roleErr } = await sb
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", invited.user.id);
    if (roleErr) {
      console.error(
        "[admin/users] invite: role flip to admin failed:",
        roleErr,
      );
    }
  }

  revalidatePath("/admin/users");
}

/**
 * Change an existing user's role between admin and bishop. Cannot demote
 * yourself (UX guard prevents accidental self-lockout) — callers must
 * filter that case before invoking; we double-check server-side.
 */
export async function updateRoleAction(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  const targetId = formData.get("id")?.toString();
  const role = formData.get("role")?.toString();

  if (!targetId) {
    console.error("[admin/users] updateRole: missing id");
    return;
  }
  if (role !== "admin" && role !== "bishop") {
    console.error("[admin/users] updateRole: invalid role", { role });
    return;
  }
  if (targetId === auth.userId && role !== "admin") {
    console.error("[admin/users] updateRole: refused self-demotion");
    return;
  }

  const sb = adminClient();
  const { error } = await sb
    .from("profiles")
    .update({ role })
    .eq("id", targetId);
  if (error) {
    console.error("[admin/users] updateRole failed:", error);
    return;
  }

  revalidatePath("/admin/users");
}

/**
 * Revoke a user's access by deleting both the profile row and the auth
 * user. Cascade on profiles.id ON DELETE CASCADE means deleting the auth
 * user removes the profile too, but we delete profile first to be explicit
 * and to fail loudly if the user has any FK references we forgot about.
 */
export async function deleteUserAction(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  const targetId = formData.get("id")?.toString();

  if (!targetId) {
    console.error("[admin/users] delete: missing id");
    return;
  }
  if (targetId === auth.userId) {
    console.error("[admin/users] delete: refused self-deletion");
    return;
  }

  const sb = adminClient();

  // Profile first (explicit; the auth.users delete cascades anyway via the FK).
  const { error: profileErr } = await sb
    .from("profiles")
    .delete()
    .eq("id", targetId);
  if (profileErr) {
    console.error("[admin/users] delete: profile delete failed:", profileErr);
    return;
  }

  // Auth user (this also signs the user out everywhere — sessions invalidate).
  const { error: authErr } = await sb.auth.admin.deleteUser(targetId);
  if (authErr) {
    console.error("[admin/users] delete: auth delete failed:", authErr);
    return;
  }

  revalidatePath("/admin/users");
}
