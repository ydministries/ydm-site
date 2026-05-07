# YDM Site — Handover Document

**Production:** https://ydministries.ca · https://www.ydministries.ca
**Repo:** github.com/ydministries (whichever org account owns it)
**Hosting:** Vercel (auto-deploy on `main` push)
**DNS:** Cloudflare (zone for ydministries.ca)
**Database + Auth + Storage:** Supabase (`dgpjimeujubptwysymzw` / project name "ydm-prod")
**Media CDN:** Cloudflare R2 bucket `ydm-media` at `https://media.ydministries.ca`
**Transactional + Auth Email:** Resend (verified domain `ydministries.ca`)
**Inbound Email:** Cloudflare Email Routing → Gmail (hub: `YDMinistries48@gmail.com`, webmaster: `yeshuawebmaster@gmail.com`)
**Outbound (Send-As):** Gmail Send-As via Resend SMTP (signed by `ydministries.ca` DKIM — passes iCloud + strict receivers)
**Payments:** Stripe (sandbox/test ready; live mode pending account verification)
**Fulfillment:** Printful (catalog API; orders submitted as drafts)

---

## What was built

This site replaces the previous WordPress install at ydministries.ca with a custom Next.js 16 + Supabase application. Every public-facing page renders from `page_content` rows in Supabase, every editable string is `<EditableContent>`, and Bishop can edit content inline on the live site or from `/admin`.

### Public site routes

| URL | What it does |
|---|---|
| `/` | Homepage — hero, mission, ministries carousel, sermons carousel, countdown, leaders, get-involved, support, newsletter |
| `/about` | Bishop bio + church story |
| `/sermons` | Sermon index — auto-groups by `series_name` if any are set |
| `/sermons/[slug]` | Sermon detail with custom audio player + scripture refs |
| `/sermons/scripture` | Scripture cross-reference index across all sermons |
| `/ministries` + `/ministries/[slug]` | Ministry index + detail |
| `/team` + `/team/[slug]` | Leadership team |
| `/blog` + `/blog/[slug]` | Blog posts |
| `/events` + `/events/[slug]` | Events listing + detail |
| `/locations/maltoncog`, `/locations/westtoronto` | Two locations |
| `/give` | **Interac e-Transfer (primary) + Stripe monthly recurring** |
| `/give/thanks` | Post-Stripe success |
| `/give/supportydm`, `/give/techfund` | Campaign detail pages |
| `/shop` | Printful catalog (gracefully degrades when no products) |
| `/shop/[slug]` | Product detail + Buy Now |
| `/shop/success` | Post-checkout success |
| `/testimonials` | Curated testimonials grid + submission form (replaces guestbook) |
| `/contact` | Contact form (14 reason categories, routes to bishop email) |
| `/prayer` | Prayer request form |
| `/ask` | "Ask Bishop" form |
| `/live` | Live stream embed (YouTube `@YDMWorldwide`) |
| `/gallery` | Photo gallery with masonry + lightbox |

Plus 54 legacy WordPress URL redirects in `next.config.ts` so no inbound link breaks (sourced from `archive/wordpress/scrape/site-map.json` after trailing-slash strip + the Phase JJ `/guestbook` → `/testimonials` redirect).

### Admin panel — `/admin`

Two roles: **admin** (Mikey, `yeshuawebmaster@gmail.com`) and **bishop** (`ydministries48@gmail.com`).

| URL | What it does |
|---|---|
| `/admin` | Role-aware landing — bishop sees 4 plain cards + tip; admin sees 6 technical cards |
| `/admin/content` | Edit every page on the site (heading, body, CTAs, etc.) |
| `/admin/content/[pageKey]` | Edit one page; per-field editor with version history |
| `/admin/messages` | Browse contact/prayer/ask/guestbook submissions; mailto-reply |
| `/admin/testimonials` | Approve / reject / feature testimonials |
| `/admin/subscribers` | Newsletter list with CSV export + manual unsubscribe / re-add |
| `/admin/donations` | Stripe donation ledger |
| `/admin/orders` | Shop order list with payment + fulfillment status |
| `/admin/assets` | Upload images, copy R2 URLs |
| `/admin/users` | (Admin only) Invite editors, change roles, revoke access |
| `/admin/profile` | Your account |
| `/admin/login` | Sign-in page (NO public sign-up — invitation-only) |
| `/admin/auth/reset` | Password reset / invite claim landing |

### Inline editing

When a user with `admin` or `bishop` role visits any public page, every editable string shows a **gold dotted outline** + **✎ pencil icon** on hover. Clicking opens the inline edit modal. Saved changes are versioned and immediately visible.

---

## Today's deliverables (Phases shipped through handover, 2026-05-05/06)

For phases shipped after handover (MM onward, audit fix sequence), see `CHANGELOG.md`.

| Phase | Title | Commit |
|---|---|---|
| Z | Decommission 18 index_filter stubs | `f84d3cd` |
| AA | Photo gallery (masonry + lightbox) | `04e31d3` |
| CC | Newsletter signup (Resend Audiences + welcome + unsubscribe) | `b910970` |
| DD | Bishop Mode dashboard + Messages + Subscribers admin | `efefd88` |
| EE | Auth SMTP via Resend + branded auth emails + password reset + signup lockdown | `9420372` |
| GG | Email cutover (Cloudflare Routing + Resend SMTP Send-As) | Dashboard config |
| HH | `/admin/users` invite UI | `5c361bb` |
| II | Scripture index + sermon series | `b19c5f6` |
| JJ | Curated testimonials (replaces guestbook) | `b6c07f7` |
| KK | Donations (Interac + Stripe recurring) | `434ce54` |
| LL | Shop (Printful + Stripe Checkout + admin orders) | `e11ff45` |

See `CHANGELOG.md` for everything before today.

---

## Environment variables

Source of truth: `site/.env.local` (NEVER commit) and Vercel project settings.

| Variable | Service | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Public anon URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public anon key (RLS gates everything) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-side only — bypasses RLS for webhooks + admin actions |
| `NEXT_PUBLIC_SITE_URL` | YDM | `https://ydministries.ca` (used for OAuth redirects + Stripe success URLs) |
| `RESEND_API_KEY` | Resend | Transactional email + Auth SMTP + Send-As outbound |
| `RESEND_NEWSLETTER_AUDIENCE_ID` | Resend | Audience UUID `a9fd8c6e-cedf-4e72-ab09-ac8db579fea8` |
| `R2_ACCOUNT_ID` | Cloudflare R2 | Asset upload (admin/assets) |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | ↑ |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | ↑ |
| `R2_BUCKET_NAME` | Cloudflare R2 | `ydm-media` |
| `STRIPE_SECRET_KEY` | Stripe | Server-only — Checkout creation + webhook signature verification |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | (Reserved for future client-side use) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Verifies inbound webhook authenticity |
| `PRINTFUL_API_KEY` | Printful | Sync products + create orders |

Apple Notes (locked) holds these as "YDM <service> <purpose>" entries.

---

## Bishop's daily admin tasks

### How to edit text on any page

**Option A — inline:**
1. Sign in at `/admin/login`
2. Visit the live site — any page
3. Hover over the words you want to change → gold pencil icon appears
4. Click it → edit in the modal → Save

**Option B — from admin:**
1. `/admin/content`
2. Click the page name
3. Edit individual fields → Save

### How to upload a new photo

1. `/admin/assets`
2. Click **Upload** → pick file
3. Click **Copy URL** on the uploaded asset
4. Paste the URL wherever you need it (e.g. into a hero image field via `/admin/content`)

### How to approve a testimony

1. `/admin/testimonials`
2. Pending submissions appear at the top
3. Click **Approve** to publish, **Reject** to hide, **Feature** to highlight as the large testimonial at the top of `/testimonials`

### How to reply to a contact form / prayer / ask submission

1. `/admin/messages`
2. Click **Reply by email** on the row → opens your email client with To: pre-filled

### How to invite a new editor

1. `/admin/users` (admin role only — bishop can't invite)
2. Enter email + pick role (Bishop = editor, Admin = full access)
3. Click **Send invite** — they receive a branded email with a link to set their password

### How to send a newsletter

Newsletters are sent from Resend, not from the YDM admin. Visit `https://resend.com/broadcasts` → New broadcast → pick the "YDM Newsletter" audience → write/send. Subscribers also live in `/admin/subscribers` if you need to export.

### How to handle a donation

**Interac e-Transfer:** auto-deposits to `donate@ydministries.ca` (which forwards to `YDMinistries48@gmail.com`). Bishop sees the bank confirmation email. No software action required.

**Stripe recurring:** appears in `/admin/donations`. Stripe handles the recurring charges and emails receipts directly. Donor manages their own subscription via the Stripe-hosted portal link in their receipts.

### How to fulfill a shop order

When someone buys from `/shop`, the webhook automatically creates a draft order in Printful. Bishop:

1. Logs into Printful dashboard
2. Reviews the order
3. Clicks **Confirm** → Printful prints + ships
4. Tracking goes back to the customer via Printful's emails
5. The YDM `/admin/orders` page logs the transaction with status pills

If a row in `/admin/orders` shows red ("submission_failed"), Stripe captured payment but Printful's API rejected — manual reconcile in Printful dashboard.

---

## Known issues

### Shop checkout disabled pending Stripe live-mode activation

`/shop/[slug]` displays the buy CTA in a disabled "Currently unavailable" state and `/api/shop/checkout` returns `503` at handler entry. Both are gated on the `SHOP_CHECKOUT_ENABLED` env var (defaults to enabled when unset; Vercel Production has it set to `"false"`). The `/shop` landing also carries a notice banner explaining the pause to visitors.

To re-enable:

1. Bishop Wilson completes Stripe business verification at Stripe Dashboard → Settings → Business profile.
2. Rotate `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel Production env to live values (`sk_live_...`, new `whsec_...`).
3. Create live-mode webhook at `https://ydministries.ca/api/stripe/webhook` subscribed to: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
4. Remove `SHOP_CHECKOUT_ENABLED` from Vercel Production env (or set to `"true"`).
5. Trigger redeploy with build cache busted.

---

## Outstanding setup work (post-handover)

Things that need YOU (the maintainer) to act, not code:

### Mandatory before going live with payments

Stripe live-mode activation: see the **Known issues → Shop checkout disabled pending Stripe live-mode activation** section above for the canonical 5-step runbook.

- [ ] **Bank auto-deposit for `donate@ydministries.ca`** — set up in your bank's portal so Interac transfers auto-deposit. Without this, the e-Transfer card on `/give` is misleading.

### To activate the shop

- [ ] **Create Printful products** at `https://www.printful.com/dashboard/store`. Need at least one synced product before `/shop` shows anything beyond the empty state.
- [ ] Optional: turn on **auto-confirm** in Printful settings so paid orders ship without bishop's manual confirm step.

### Bishop's content tasks

- [ ] Replace **stock leader portraits** with real photos via `/admin/assets` + `/admin/content` for each team member
- [ ] Replace **stock sermon thumbnails** (currently CMSMasters demo art) with branded YDM imagery
- [ ] Alt text for ~58 images: Phase TT seeded 5 (1 hero descriptive + 4 explicit empty) and confirmed 14 gallery rows already correctly empty. 44 orphan asset rows skipped (deferred to a future asset-cleanup pass; see `site/copy-pass-tracker.md`). Bishop should review every image during copy pass via `/admin/assets`.
- [ ] Replace **stock gallery photos** (currently 14 CMSMasters demo images) with real ministry photos via `/admin/assets`
- [ ] Decide if **"Knowing Jesus" series** or any other series grouping fits — set `series_name` field on multiple sermons via `/admin/content/sermons.<slug>`

### Tax-receipt eligibility

- [ ] Decide YDM's CRA charity status. If registered, update `/give` page copy to mention tax receipts (currently a footer disclaimer just says contact donate@ydministries.ca for receipts).

---

## Tech stack reference

- **Framework:** Next.js 16.2.2 (App Router, Server Components by default)
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS v4 (no `tailwind.config.ts` — brand tokens live in `@theme` block in `src/app/globals.css`)
- **Database:** Supabase (PostgreSQL + RLS + Auth + Storage — but we use R2 for media not Supabase Storage)
- **Email:** Resend SMTP (transactional + Supabase Auth + Gmail Send-As outbound) + Cloudflare Email Routing (inbound)
- **Payments:** Stripe (subscription mode for donations, payment mode for shop)
- **Fulfillment:** Printful Sync Products API
- **Image CDN:** Cloudflare R2 bucket `ydm-media`
- **Deploy:** Vercel auto-deploys `main`

---

## Project structure cheatsheet

```
ydm/
├── HANDOVER.md                    ← THIS FILE
├── CHANGELOG.md                   ← Every push, dated, with phase letter
├── CLAUDE.md                      ← Build agent instructions (skip if not using AI)
├── README.md                      ← Public-facing project description
├── PROJECT.md                     ← Feature inventory
├── PLAN.md                        ← Original migration plan (now mostly delivered)
├── YDM_MIGRATION_GUIDE.md         ← Original blueprint
├── docs/auth-email-templates/     ← Branded HTML for Supabase Auth emails (paste into Dashboard)
├── archive/wordpress/             ← Original WP scrape + exports (read-only reference)
└── site/                          ← The actual Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── (site)/            ← Public pages (mostly codegen'd from route-map)
    │   │   ├── admin/             ← Admin panel
    │   │   └── api/               ← Server routes (forms, newsletter, donate, shop, stripe webhook)
    │   ├── components/
    │   │   ├── EditableContent.tsx ← The core CMS primitive
    │   │   ├── templates/         ← Per-template page renderers
    │   │   └── site/              ← Header, footer
    │   └── lib/                   ← Server-side helpers (supabase, resend, stripe, printful, etc.)
    ├── scripts/
    │   ├── codegen-pages.ts       ← Regenerates page.tsx from route-map + page_content
    │   ├── seed-content.ts        ← Seeds page_content from WP scrape (run once; idempotent)
    │   └── seed-fixups.ts         ← Manual seed adjustments
    └── supabase/migrations/       ← All migrations applied via Dashboard SQL editor
```

---

## Common troubleshooting

### "RLS policy disappeared on form_submissions" (or testimonials, or donations)

Re-run the relevant migration in Supabase Dashboard SQL editor. RLS policies have disappeared mysteriously twice on `form_submissions` — root cause unclear, see `project_ydm_phase_y_lessons` memory. Migrations are idempotent — safe to re-run.

### "via gmail.com" disclaimer when bishop replies

Send-As is using `smtp.gmail.com` instead of `smtp.resend.com`. In each Send-As entry in Gmail Settings → Accounts → Send mail as → Edit info → Next Step → SMTP Server should be `smtp.resend.com:465` SSL with username `resend` and password = `RESEND_API_KEY`. Detailed in memory `project_ydm_email_deferred`.

### Stripe webhook returns 503

`STRIPE_WEBHOOK_SECRET` not set on Vercel. Add it (from `https://dashboard.stripe.com/webhooks` → endpoint detail → Reveal signing secret) and redeploy.

### Shop says "Shop opening soon" but I added a product

`PRINTFUL_API_KEY` not set on Vercel, OR products are still syncing in Printful (it takes a minute). Wait 5 min and refresh — Next.js caches the catalog for 5 min via fetch revalidation.

### Inline edit pencil doesn't appear

You're not signed in as admin/bishop. Visit `/admin/login` first. The pencil only shows for authenticated editors.

### Page shows `[MISSING: page.field]` in red

A field in `page_content` is referenced by `<EditableContent>` but doesn't exist in the DB. Either run `npm run codegen:pages` (which regenerates pages from route-map + DB) or insert the missing row via `/admin/content/[pageKey]`.

### Migration workflow

Migrations live in `site/supabase/migrations/` (NOT `supabase/migrations/` at repo root — that's an orphaned scaffold). Apply via Dashboard SQL editor: `https://supabase.com/dashboard/project/dgpjimeujubptwysymzw/sql/new`. **Don't** run `supabase db push --linked` — the CLI link state is broken; see memory `project_ydm_migrations_workflow`.

---

## Contacts

- **Webmaster (technical):** `yeshuawebmaster@gmail.com` (=Mikey)
- **Bishop (content):** `ydministries48@gmail.com`
- **Public-facing inboxes (all forward to YDMinistries48@gmail.com unless noted):**
  - `info@` — general
  - `donate@` — donations
  - `bishop@` — pastoral
  - `prayer@` — prayer requests
  - `shop@` — shop / order questions
  - `admin@` — forwards to `yeshuawebmaster@gmail.com` (web/infra issues)

---

*Generated 2026-05-06 at handover. Last commit: e11ff45. Site is live on Vercel + Cloudflare DNS.*
