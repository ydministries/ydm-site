# YDM Supabase Auth Email Templates

These are the HTML templates that Supabase Auth sends for sign-up confirmation,
password reset, magic link, and change-email flows. They're stored here as
the source of truth — the actual templates live in the Supabase Dashboard
(Authentication → Emails) and must be pasted in manually after each edit.

## When you change a template

1. Edit the `.html` file in this directory
2. Open Supabase Dashboard → Project → Authentication → Emails → pick the matching template
3. Paste the new HTML into the **Message body** field, leaving **Subject** as configured below
4. Click **Save**
5. Send a test (Auth → Users → ⋯ → Send recovery, or sign up a fresh account)

## Subject lines (configured in Dashboard)

| Template | Subject |
|---|---|
| Confirm signup | `Confirm your email — Yeshua Deliverance Ministries` |
| Magic Link | `Your YDM sign-in link` |
| Change Email Address | `Confirm your new email — Yeshua Deliverance Ministries` |
| Reset Password | `Reset your YDM password` |
| Invite user | `You're invited to manage the YDM website` |

## Template variables

Supabase substitutes these at send time. Don't change the `{{ .Foo }}` syntax.

| Variable | Used in | Notes |
|---|---|---|
| `{{ .ConfirmationURL }}` | All | The action link the user clicks |
| `{{ .Email }}` | All | Recipient email |
| `{{ .SiteURL }}` | All | Site URL configured in Auth settings |
| `{{ .Token }}` | (rare) | 6-digit OTP if you switch to OTP-based flow |

## Brand notes

- Gold accent rule: `#D38605` (3px tall, 60px wide, centered)
- Cream background: `#F8F1E6`
- Card surface: `#FDFDFD`
- Body text: `#1A0F00` (ink)
- Mute text: `#968B87`
- Sender domain: `noreply@ydministries.ca` (Resend-verified)
- Display heading is `YESHUA DELIVERANCE MINISTRIES` in inline-fallback bold sans-serif (Bebas Neue isn't an email-safe font)

Designed to match `site/src/lib/newsletter.ts → welcomeEmailHtml()` so all
YDM transactional email feels like one system.
