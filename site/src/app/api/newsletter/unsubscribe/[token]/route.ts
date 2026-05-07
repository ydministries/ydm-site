import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unsubscribeFromResendAudience } from "@/lib/newsletter";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

/**
 * One-click unsubscribe via tokenized URL. Mutates state on GET — that's a
 * deliberate choice: every email-client unsubscribe link is a GET, and the
 * token is a single-use-style UUID that's hard to forge. The route renders
 * inline HTML for a confirmation page so the visitor lands somewhere
 * humane.
 *
 * Service-role Supabase client (not anon) — RLS denies anon UPDATE, but the
 * route is publicly accessible, so the caller has no auth context. Service
 * role bypasses RLS for this single update.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!token || token.length < 16) {
    return renderHtml(unsubscribePage("invalid"), 400);
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Find the subscriber by token.
  const { data: row, error: lookupErr } = await sb
    .from("newsletter_subscribers")
    .select("id, email, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupErr || !row) {
    return renderHtml(unsubscribePage("invalid"), 404);
  }

  if (row.status === "unsubscribed") {
    return renderHtml(unsubscribePage("already", row.email));
  }

  // Flip status. Service-role bypasses RLS.
  const { error: updateErr } = await sb
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .eq("id", row.id);

  if (updateErr) {
    console.error(
      "[newsletter/unsubscribe] DB update failed:",
      updateErr,
    );
    return renderHtml(unsubscribePage("error"), 500);
  }

  // Sync to Resend Audience (best-effort).
  await unsubscribeFromResendAudience(row.email);

  return renderHtml(unsubscribePage("success", row.email));
}

function renderHtml(html: string, status: number = 200): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type UnsubResult = "success" | "already" | "invalid" | "error";

function unsubscribePage(result: UnsubResult, email?: string): string {
  const eyebrow = {
    success: "You're unsubscribed",
    already: "Already unsubscribed",
    invalid: "Link not recognized",
    error: "Something went wrong",
  }[result];

  const headline = {
    success: "We've removed you from the list.",
    already: "You're not on the list anymore.",
    invalid: "We couldn't find that subscription.",
    error: "Please try the link again later.",
  }[result];

  const body = {
    success: email
      ? `${escapeHtml(email)} won't receive further updates from Yeshua Deliverance Ministries. We'll miss you — you're welcome back anytime at the bottom of any page on our site.`
      : "You won't receive further updates from Yeshua Deliverance Ministries.",
    already: email
      ? `${escapeHtml(email)} was already unsubscribed. No action needed.`
      : "This email was already unsubscribed.",
    invalid:
      "The unsubscribe link may have expired or been mistyped. If you're still receiving emails you don't want, please reply to one of them and we'll remove you manually.",
    error:
      "We couldn't process the unsubscribe right now. Please try the link again in a few minutes. If it keeps failing, reply to any email from us and we'll remove you manually.",
  }[result];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${escapeHtml(eyebrow)} — Yeshua Deliverance Ministries</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;padding:0;background:#F8F1E6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1A0F00;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
    .card{max-width:560px;width:100%;background:#FDFDFD;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.06);padding:48px 40px;text-align:center;}
    .eyebrow{margin:0 0 8px;color:#D38605;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;}
    .rule{height:3px;width:60px;background:#D38605;margin:16px auto 24px;}
    h1{margin:0 0 20px;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:0.5px;}
    p{margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a3a3a;}
    a.btn{display:inline-block;margin-top:16px;background:#D38605;color:#1A0F00;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;}
    a.btn:hover{background:#B7720A;}
    .footer{margin-top:32px;font-size:12px;color:#968B87;}
    .footer a{color:#968B87;}
  </style>
</head>
<body>
  <main class="card" role="main">
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <div class="rule" aria-hidden="true"></div>
    <h1>${escapeHtml(headline)}</h1>
    <p>${body}</p>
    <a class="btn" href="${SITE_URL}/">Return to ydministries.ca</a>
    <p class="footer">Yeshua Deliverance Ministries · <a href="${SITE_URL}/contact">Contact us</a></p>
  </main>
</body>
</html>`.trim();
}
