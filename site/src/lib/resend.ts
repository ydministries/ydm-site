import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[resend] RESEND_API_KEY not set — email sending will fail");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export const SENDER_EMAIL =
  "Yeshua Deliverance Ministries <noreply@ydministries.ca>";
export const SENDER_FORMS_EMAIL = "YDM Forms <noreply@ydministries.ca>";
export const BISHOP_INBOX = "YDMinistries48@gmail.com";
