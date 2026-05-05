import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/apiAuth";

/**
 * CSV export of newsletter subscribers. Authed (admin/bishop only via
 * profile-role check — same gate as the page itself). Streams a download
 * with Content-Disposition + a date-stamped filename.
 *
 * Filter: ?status=subscribed (default — only active list) | all (everyone) |
 * unsubscribed (just unsubs, e.g. for an audit).
 */
export async function GET(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role !== "admin" && profile.role !== "bishop") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") ?? "subscribed";

  const supabase = await createServerClient();
  let query = supabase
    .from("newsletter_subscribers")
    .select("email, status, source, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // CSV — quote every value defensively, escape embedded quotes.
  const headers = ["email", "status", "source", "subscribed_at", "updated_at"];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of data ?? []) {
    lines.push(
      [
        row.email,
        row.status,
        row.source ?? "",
        row.created_at,
        row.updated_at ?? "",
      ]
        .map(escape)
        .join(","),
    );
  }
  const csv = lines.join("\n") + "\n";

  const today = new Date().toISOString().slice(0, 10);
  const filename = `ydm-newsletter-${statusFilter}-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
