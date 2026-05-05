import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  addToResendAudience,
  isPlausibleEmail,
  NEWSLETTER_AUDIENCE_ID,
  sendSubscriberNotification,
  sendWelcomeEmail,
  unsubscribeUrlFor,
} from "@/lib/newsletter";

interface SubscribePayload {
  email?: string;
  source?: string; // e.g. "home", "footer" — defaults to "home"
  honeypot?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  let body: SubscribePayload;
  try {
    body = (await req.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Honeypot — silent success for bots.
  if (body.honeypot && body.honeypot.length > 0) {
    console.log("[newsletter/subscribe] honeypot triggered, silent reject");
    return NextResponse.json({ ok: true });
  }

  // 2. Validate.
  const email = (body.email ?? "").trim().toLowerCase();
  if (!isPlausibleEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const source = (body.source ?? "home").slice(0, 64);

  // 3. Upsert. Re-subscribing an already-unsubscribed email flips status
  //    back to 'subscribed' and refreshes updated_at. New emails get the
  //    default unsubscribe_token from the table default.
  //
  //    Service-role client (bypasses RLS): the upsert needs INSERT + UPDATE
  //    + RETURNING/SELECT, but anon only has INSERT. Mirrors the unsubscribe
  //    route's pattern — this route is the gatekeeper (email validation +
  //    honeypot above), not RLS.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: row, error: insertErr } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        status: "subscribed",
        source,
        metadata: body.metadata ?? null,
      },
      { onConflict: "email" },
    )
    .select("id, email, unsubscribe_token, status")
    .single();

  if (insertErr || !row) {
    console.error("[newsletter/subscribe] DB upsert failed:", insertErr);
    return NextResponse.json(
      { error: "Couldn't save your subscription — please try again." },
      { status: 500 },
    );
  }

  // 4. Push to Resend Audience (best-effort; failures don't block the user).
  let resendContactId: string | null = null;
  if (NEWSLETTER_AUDIENCE_ID) {
    resendContactId = await addToResendAudience(email);
    if (resendContactId) {
      await supabase
        .from("newsletter_subscribers")
        .update({
          resend_contact_id: resendContactId,
          resend_audience_id: NEWSLETTER_AUDIENCE_ID,
        })
        .eq("id", row.id);
    }
  }

  // 5. Welcome email + bishop notification, in parallel.
  const unsubscribeUrl = unsubscribeUrlFor(row.unsubscribe_token);
  await Promise.all([
    sendWelcomeEmail(email, unsubscribeUrl),
    sendSubscriberNotification(email, source),
  ]);

  return NextResponse.json({ ok: true });
}
