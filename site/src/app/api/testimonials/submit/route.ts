import { type NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { resend, SENDER_FORMS_EMAIL, BISHOP_INBOX } from "@/lib/resend";

interface SubmitPayload {
  name?: string;
  message?: string;
  relationship?: string;
  email?: string;
  honeypot?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  let body: SubmitPayload;
  try {
    body = (await req.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body.honeypot && body.honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const message = (body.message ?? "").trim();
  const relationship = (body.relationship ?? "").trim();
  const email = (body.email ?? "").trim();

  if (name.length < 1 || name.length > 100) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: "Please share a testimonial of at least 10 characters." },
      { status: 400 },
    );
  }

  // No `.select(...)` after `.insert()` on purpose. The anon SELECT RLS
  // policy is `using (status = 'approved')`, which would block PostgREST's
  // INSERT...RETURNING for a freshly-inserted pending row and 42501 the
  // whole operation. We don't need the id back here — the row is moderated
  // from /admin/testimonials by id pulled at admin-read time.
  const sb = createAnonClient();
  const { error: insertErr } = await sb
    .from("testimonials")
    .insert({
      name,
      message,
      relationship: relationship || null,
      visitor_email: email || null,
      status: "pending",
    });

  if (insertErr) {
    console.error("[testimonials/submit] DB insert failed:", insertErr);
    return NextResponse.json(
      { error: "Couldn't save your testimonial — please try again." },
      { status: 500 },
    );
  }

  // Notify bishop so he can moderate.
  try {
    await resend.emails.send({
      from: SENDER_FORMS_EMAIL,
      to: BISHOP_INBOX,
      subject: `[YDM Testimonial] new submission from ${name}`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
          <h2 style="color:#D38605;border-bottom:2px solid #D38605;padding-bottom:8px;">[YDM Testimonial]</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}${
            email ? ` &lt;${escapeHtml(email)}&gt;` : ""
          }</p>
          ${relationship ? `<p><strong>Relationship:</strong> ${escapeHtml(relationship)}</p>` : ""}
          <hr style="border:none;border-top:1px solid #DEDEDE;margin:20px 0;">
          <h3 style="color:#5a5a5a;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Testimonial</h3>
          <p style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid #DEDEDE;margin:20px 0;">
          <p style="color:#968B87;font-size:12px;">
            Approve or reject in the admin panel:
            <a href="https://ydministries.ca/admin/testimonials">/admin/testimonials</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[testimonials/submit] notify failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
