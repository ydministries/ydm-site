import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type EmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

const EMAIL_OTP_TYPES: ReadonlyArray<EmailOtpType> = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Email-confirmation callback. Supabase redirects here after the user
 * clicks the link in any auth email (signup confirmation, magic link,
 * change email, etc.). Two formats are supported:
 *
 *  1. PKCE / OAuth flow — `?code=…` exchanged via `exchangeCodeForSession`.
 *  2. Token-hash flow — `?token_hash=…&type=signup|magiclink|email_change`
 *     verified via `verifyOtp`. This is what our YDM-branded email
 *     templates use (see docs/auth-email-templates/).
 *
 * On success, redirects to `?next=` (default `/admin`). On failure,
 * redirects to /admin/login with `?error=…`.
 *
 * Note: `recovery` does NOT route through here — recovery emails point at
 * /admin/auth/reset directly so the user lands on a "set new password"
 * form rather than being silently signed in.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const next = url.searchParams.get("next") || "/admin";

  const supabase = await createServerClient();
  let authError: { message: string } | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = error;
  } else if (
    tokenHash &&
    typeRaw &&
    EMAIL_OTP_TYPES.includes(typeRaw as EmailOtpType)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeRaw as EmailOtpType,
    });
    if (error) authError = error;
  }

  if (authError) {
    const failUrl = url.clone();
    failUrl.pathname = "/admin/login";
    failUrl.search = `?error=${encodeURIComponent(authError.message)}`;
    return NextResponse.redirect(failUrl);
  }

  const dest = url.clone();
  dest.pathname = next;
  dest.search = "";
  return NextResponse.redirect(dest);
}
