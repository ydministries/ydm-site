"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAnyEditor } from "@/lib/apiAuth";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function setStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<void> {
  const sb = adminClient();
  const { error } = await sb
    .from("testimonials")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("[admin/testimonials] setStatus failed:", error);
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function approveTestimonial(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await setStatus(id, "approved");
}

export async function rejectTestimonial(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await setStatus(id, "rejected");
}

export async function reopenTestimonial(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await setStatus(id, "pending");
}

export async function toggleFeatured(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const sb = adminClient();
  const { data: row, error: lookupErr } = await sb
    .from("testimonials")
    .select("is_featured")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !row) {
    console.error("[admin/testimonials] toggleFeatured lookup failed:", lookupErr);
    return;
  }
  const { error } = await sb
    .from("testimonials")
    .update({ is_featured: !row.is_featured })
    .eq("id", id);
  if (error) {
    console.error("[admin/testimonials] toggleFeatured failed:", error);
    return;
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  await requireAnyEditor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const sb = adminClient();
  const { error } = await sb.from("testimonials").delete().eq("id", id);
  if (error) {
    console.error("[admin/testimonials] delete failed:", error);
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}
