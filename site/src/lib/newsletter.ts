import { resend, SENDER_EMAIL, SENDER_FORMS_EMAIL, BISHOP_INBOX } from "./resend";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Welcome email sent on successful single-opt-in subscription. Brand-styled
 * (gold accent, Bebas/Barlow inline fallbacks since email clients ignore
 * @font-face) with the unsubscribe link in the footer.
 */
export function welcomeEmailHtml(unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F8F1E6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1A0F00;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F1E6;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FDFDFD;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:40px 40px 16px;text-align:center;">
                <p style="margin:0 0 8px;color:#D38605;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Welcome to the family</p>
                <h1 style="margin:0;color:#1A0F00;font-size:32px;line-height:1.1;font-weight:700;letter-spacing:1px;">YESHUA DELIVERANCE MINISTRIES</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 24px;text-align:center;">
                <div style="height:3px;width:60px;background:#D38605;margin:0 auto;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 24px;font-size:16px;line-height:1.6;color:#1A0F00;">
                <p style="margin:0 0 16px;">Thank you for subscribing to YDM updates.</p>
                <p style="margin:0 0 16px;">You'll hear from us when there's a new sermon, an upcoming event, or a word of encouragement to share. We won't crowd your inbox &mdash; this is a low-volume list.</p>
                <p style="margin:0 0 16px;">In the meantime, we'd love to see you on a Sunday or at our Thursday Bible study.</p>
                <p style="margin:0 0 8px;font-weight:600;">Bible study:</p>
                <p style="margin:0 0 16px;color:#5a5a5a;">Thursdays, 7:00 PM</p>
                <p style="margin:0;">Grace and peace,<br/>Bishop Huel Wilson</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 40px;text-align:center;">
                <a href="${SITE_URL}/sermons" style="display:inline-block;background:#D38605;color:#1A0F00;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;letter-spacing:0.5px;">Watch the latest sermon</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background:#F8F1E6;border-top:1px solid #ECDFC9;text-align:center;font-size:12px;color:#968B87;line-height:1.5;">
                <p style="margin:0 0 8px;">You received this email because you subscribed at <a href="${SITE_URL}" style="color:#968B87;">ydministries.ca</a>.</p>
                <p style="margin:0;"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#968B87;text-decoration:underline;">Unsubscribe</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

/**
 * Send the welcome email to a new subscriber. Returns the Resend message id
 * on success or null on failure (errors are logged; the API route never
 * fails the user-facing flow because of an email send issue).
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeUrl: string,
): Promise<string | null> {
  const { data, error } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: email,
    subject: "Welcome to YDM updates",
    html: welcomeEmailHtml(unsubscribeUrl),
  });
  if (error) {
    console.error(
      "[newsletter] welcome email failed:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return null;
  }
  return data?.id ?? null;
}

/**
 * Notify the bishop inbox that a new visitor subscribed. Single-line
 * delivery — keeps the inbox readable when subscribers come in steadily.
 */
export async function sendSubscriberNotification(
  email: string,
  source: string,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: SENDER_FORMS_EMAIL,
    to: BISHOP_INBOX,
    subject: `[YDM Newsletter] new subscriber — ${email}`,
    html: `
      <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#1a1a1a;">
        <p>New newsletter subscriber:</p>
        <p><strong>${escapeHtml(email)}</strong></p>
        <p style="color:#968B87;font-size:12px;">Signed up via: ${escapeHtml(source)}</p>
      </div>
    `,
  });
  if (error) {
    console.error(
      "[newsletter] bishop notify failed:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
  }
}

export const NEWSLETTER_AUDIENCE_ID =
  process.env.RESEND_NEWSLETTER_AUDIENCE_ID ?? null;

/**
 * Try to add a contact to the configured Resend Audience. Returns the
 * Resend contact id on success, null otherwise. Failures are non-fatal —
 * the subscriber row in Supabase is the source of truth.
 */
export async function addToResendAudience(
  email: string,
): Promise<string | null> {
  if (!NEWSLETTER_AUDIENCE_ID) {
    console.warn(
      "[newsletter] RESEND_NEWSLETTER_AUDIENCE_ID not set — skipping audience push",
    );
    return null;
  }
  try {
    const { data, error } = await resend.contacts.create({
      audienceId: NEWSLETTER_AUDIENCE_ID,
      email,
      unsubscribed: false,
    });
    if (error) {
      console.error(
        "[newsletter] resend.contacts.create failed:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("[newsletter] addToResendAudience threw:", err);
    return null;
  }
}

/**
 * Mark a contact unsubscribed in the configured Resend Audience.
 * Non-fatal — DB status is the source of truth.
 */
export async function unsubscribeFromResendAudience(
  email: string,
): Promise<void> {
  if (!NEWSLETTER_AUDIENCE_ID) return;
  try {
    const { error } = await resend.contacts.update({
      audienceId: NEWSLETTER_AUDIENCE_ID,
      email,
      unsubscribed: true,
    });
    if (error) {
      console.error(
        "[newsletter] resend.contacts.update failed:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
    }
  } catch (err) {
    console.error("[newsletter] unsubscribeFromResendAudience threw:", err);
  }
}

export function unsubscribeUrlFor(token: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe/${encodeURIComponent(token)}`;
}

/**
 * Loose RFC-style email validation. We're not the auth boundary here —
 * Resend will reject anything actually malformed and the welcome email
 * will bounce. This just rejects the obviously-bogus.
 */
export function isPlausibleEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  if (email.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
