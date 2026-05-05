"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAnyEditor } from "@/lib/apiAuth";
import { unsubscribeFromResendAudience } from "@/lib/newsletter";

/**
 * Manual unsubscribe action — admin/bishop flips a subscriber to status
 * 'unsubscribed' from the admin panel (e.g. they emailed asking to be
 * removed, or bounced repeatedly). Mirrors the public token-based
 * unsubscribe route but skipped the token requirement since the caller
 * is authed.
 *
 * Service-role client bypasses RLS — admin/bishop have UPDATE permission
 * via RLS policy too, but using service-role is consistent with the rest
 * of the newsletter flow.
 */
export async function unsubscribeAction(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    console.error("[admin/subscribers] unsubscribe: missing id");
    return;
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: row, error: lookupErr } = await sb
    .from("newsletter_subscribers")
    .select("email, status")
    .eq("id", id)
    .maybeSingle();

  if (lookupErr || !row) {
    console.error("[admin/subscribers] unsubscribe: not found", lookupErr);
    return;
  }
  if (row.status === "unsubscribed") {
    return; // already done
  }

  const { error: updErr } = await sb
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .eq("id", id);

  if (updErr) {
    console.error("[admin/subscribers] update failed:", updErr);
    return;
  }

  await unsubscribeFromResendAudience(row.email);
  revalidatePath("/admin/subscribers");
}

/**
 * Re-subscribe action — flip 'unsubscribed' back to 'subscribed' (e.g. the
 * subscriber asked to come back). Doesn't re-send the welcome email.
 */
export async function resubscribeAction(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    console.error("[admin/subscribers] resubscribe: missing id");
    return;
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { error } = await sb
    .from("newsletter_subscribers")
    .update({ status: "subscribed" })
    .eq("id", id);

  if (error) {
    console.error("[admin/subscribers] resubscribe failed:", error);
    return;
  }

  revalidatePath("/admin/subscribers");
}
