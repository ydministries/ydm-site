import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[resend] RESEND_API_KEY not set — email sending will fail");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

// Phase Y hotfix — using Resend's universal verified sender until the
// ydministries.ca domain is fully verified at Resend. Once Resend reports
// the domain as Verified (not Pending), swap these back to
// "noreply@ydministries.ca". Branding cost is small; reliability gain is
// large since onboarding@resend.dev never fails verification.
export const SENDER_EMAIL =
  "Yeshua Deliverance Ministries <onboarding@resend.dev>";
export const SENDER_FORMS_EMAIL = "YDM Forms <onboarding@resend.dev>";
export const BISHOP_INBOX = "YDMinistries48@gmail.com";
