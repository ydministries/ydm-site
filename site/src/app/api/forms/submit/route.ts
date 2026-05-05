import { type NextRequest, NextResponse } from "next/server";
import {
  resend,
  SENDER_EMAIL,
  SENDER_FORMS_EMAIL,
  BISHOP_INBOX,
} from "@/lib/resend";
import { createAnonClient } from "@/lib/supabase/anon";

type FormType = "contact" | "prayer" | "ask" | "guestbook";

interface SubmitPayload {
  formType: FormType;
  honeypot?: string;
  fields: {
    name?: string;
    email?: string;
    category?: string;
    subject?: string;
    message: string;
    [key: string]: string | undefined;
  };
}

const FORM_TYPES: ReadonlyArray<FormType> = [
  "contact",
  "prayer",
  "ask",
  "guestbook",
];

const SUBJECT_PREFIX: Record<FormType, string> = {
  contact: "[YDM Contact]",
  prayer: "[YDM Prayer Request]",
  ask: "[YDM Ask Bishop]",
  guestbook: "[YDM Guestbook]",
};

const VISITOR_REPLY_SUBJECT: Record<FormType, string> = {
  contact: "Thank you for reaching out — Yeshua Deliverance Ministries",
  prayer:
    "Your prayer request has been received — Yeshua Deliverance Ministries",
  ask: "Your question has been received — Yeshua Deliverance Ministries",
  guestbook:
    "Thank you for signing our guestbook — Yeshua Deliverance Ministries",
};

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

  // 1. Honeypot — silent success for bots.
  if (body.honeypot && body.honeypot.length > 0) {
    console.log("[forms/submit] honeypot triggered, silent reject");
    return NextResponse.json({ ok: true });
  }

  // 2. Validate.
  if (!body.formType || !FORM_TYPES.includes(body.formType)) {
    return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
  }
  if (!body.fields?.message || body.fields.message.trim().length < 3) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 3. Persist a pending row. Bare anon client — public submissions don't
  //    need cookie/session context, and the cookie-aware client can 401 on
  //    stale auth cookies even when the RLS policy permits anon.
  const supabase = createAnonClient();
  const { data: row, error: insertErr } = await supabase
    .from("form_submissions")
    .insert({
      form_type: body.formType,
      category: body.fields.category ?? null,
      visitor_name: body.fields.name ?? null,
      visitor_email: body.fields.email ?? null,
      visitor_message: body.fields.message,
      metadata: body.fields,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("[forms/submit] DB insert failed:", insertErr);
    // Continue — try to send email even if logging failed.
  }

  // 4. Bishop notification.
  const visitorEmailForReply = body.fields.email ?? BISHOP_INBOX;
  const subjectFromForm =
    body.fields.subject ?? body.fields.name ?? "New submission";
  const subject = `${SUBJECT_PREFIX[body.formType]} ${subjectFromForm}`;

  const fieldsHtml = Object.entries(body.fields)
    .filter(([k, v]) => v && k !== "message" && k !== "honeypot")
    .map(
      ([k, v]) =>
        `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</p>`,
    )
    .join("");

  const bishopHtml = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #D38605; border-bottom: 2px solid #D38605; padding-bottom: 8px;">${escapeHtml(SUBJECT_PREFIX[body.formType])}</h2>
      ${fieldsHtml}
      <hr style="border: none; border-top: 1px solid #DEDEDE; margin: 20px 0;">
      <h3 style="color: #5a5a5a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message</h3>
      <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(body.fields.message)}</p>
      <hr style="border: none; border-top: 1px solid #DEDEDE; margin: 20px 0;">
      <p style="color: #968B87; font-size: 12px;">
        Reply to this email to respond directly to ${escapeHtml(body.fields.name ?? "the visitor")} — your reply goes to ${escapeHtml(visitorEmailForReply)}, not back to YDM Forms.
      </p>
      <p style="color: #968B87; font-size: 11px;">
        Submission ID: ${row?.id ?? "(not stored)"} · Received via ydministries.ca
      </p>
    </div>
  `;

  const { data: bishopRes, error: bishopErr } = await resend.emails.send({
    from: SENDER_FORMS_EMAIL,
    to: BISHOP_INBOX,
    replyTo: visitorEmailForReply,
    subject,
    html: bishopHtml,
  });

  if (bishopErr) {
    // Log the full object — Resend errors carry more than .message
    // (statusCode, name, the offending field). Show JSON so it lands
    // legibly in Vercel logs.
    try {
      console.error(
        "[forms/submit] Resend bishop send failed:",
        JSON.stringify(bishopErr, Object.getOwnPropertyNames(bishopErr)),
      );
    } catch {
      console.error("[forms/submit] Resend bishop send failed:", bishopErr);
    }
    console.error("[forms/submit] Resend response payload:", bishopRes);
    if (row?.id) {
      await supabase
        .from("form_submissions")
        .update({
          status: "failed",
          error_message:
            bishopErr instanceof Error ? bishopErr.message : String(bishopErr),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }
    return NextResponse.json(
      {
        error:
          "We couldn't send your message — please try again or email us at " +
          BISHOP_INBOX,
      },
      { status: 500 },
    );
  }

  // 5. Mark sent.
  if (row?.id) {
    await supabase
      .from("form_submissions")
      .update({
        status: "sent",
        resend_message_id: bishopRes?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  // 6. Auto-reply to visitor (best-effort).
  if (body.fields.email) {
    const greeting = body.fields.name
      ? `, ${escapeHtml(body.fields.name)}`
      : "";
    const visitorHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #D38605;">Thank you${greeting}.</h2>
        <p>We've received your message and will respond personally as soon as possible. Bishop and the YDM team typically reply within a few days.</p>
        <p>If your matter is urgent, please call us at <strong>+1 (416) 895-5178</strong>.</p>
        <p style="margin-top: 30px;">In Christ,<br><strong>Yeshua Deliverance Ministries</strong></p>
        <hr style="border: none; border-top: 1px solid #DEDEDE; margin: 30px 0 15px;">
        <p style="color: #968B87; font-size: 11px;">
          38 Arthurs Cres, Brampton, ON L6Y 4Y2 · ydministries.ca<br>
          You're receiving this because you submitted a form at ydministries.ca. We will not add you to any mailing list.
        </p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: body.fields.email,
        replyTo: BISHOP_INBOX,
        subject: VISITOR_REPLY_SUBJECT[body.formType],
        html: visitorHtml,
      });
    } catch (e) {
      console.warn("[forms/submit] Auto-reply send failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
