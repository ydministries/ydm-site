import { createServerClient } from "./supabase";

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  relationship: string | null;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  visitorEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    message: (row.message as string) ?? "",
    relationship: (row.relationship as string | null) ?? null,
    status: (row.status as Testimonial["status"]) ?? "pending",
    isFeatured: !!row.is_featured,
    visitorEmail: (row.visitor_email as string | null) ?? null,
    createdAt: (row.created_at as string) ?? "",
    updatedAt: (row.updated_at as string) ?? "",
  };
}

/**
 * Public — approved testimonials only. Featured first, then most recent.
 */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("testimonials")
    .select(
      "id, name, message, relationship, status, is_featured, visitor_email, created_at, updated_at",
    )
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[testimonials] getApprovedTestimonials failed:", error);
    return [];
  }
  return (data ?? []).map(rowToTestimonial);
}

/**
 * Admin — all testimonials, used by /admin/testimonials moderation queue.
 * Returns pending first (oldest first so the oldest pending is at the top
 * of the queue), then approved (newest first), then rejected (newest first).
 */
export async function getAllTestimonialsForAdmin(): Promise<Testimonial[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("testimonials")
    .select(
      "id, name, message, relationship, status, is_featured, visitor_email, created_at, updated_at",
    );
  if (error) {
    console.error("[testimonials] getAllTestimonialsForAdmin failed:", error);
    return [];
  }
  const rows = (data ?? []).map(rowToTestimonial);
  rows.sort((a, b) => {
    const order: Record<string, number> = {
      pending: 0,
      approved: 1,
      rejected: 2,
    };
    if (order[a.status] !== order[b.status])
      return order[a.status] - order[b.status];
    if (a.status === "pending") {
      return a.createdAt.localeCompare(b.createdAt); // oldest pending first
    }
    return b.createdAt.localeCompare(a.createdAt); // newest first elsewhere
  });
  return rows;
}
