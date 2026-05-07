# Yeshua Deliverance Ministries (YDM) — Feature Inventory

## Overview
Full-stack community web platform for a Christian ministry organization. WordPress migration to Next.js 16 + Supabase + custom admin panel.

## Status
🟢 **Live in production** since 2026-05-04. Handed over 2026-05-06. 22+ phases shipped through 2026-05-07 (Phase WW — audit fix sequence). See [`HANDOVER.md`](./HANDOVER.md) for the maintainer reference and [`CHANGELOG.md`](./CHANGELOG.md) for the full phase-by-phase history.

## Key Info
- **Short name:** YDM
- **Type:** Ministry / Faith Organization
- **Primary Contact:** Mikey
- **Source Site:** https://ydministries.ca (WordPress)
- **Stack:** Next.js 16.2.2, Supabase, Stripe, Resend, Printful, Cloudflare R2, Tailwind CSS v4
- **Deploy:** Vercel

## Project Structure

```
ydm/
├── CLAUDE.md              # AI instructions
├── README.md              # Project overview & setup
├── PROJECT.md             # This file — feature inventory
├── CHANGELOG.md           # Dev history
├── YDM_MIGRATION_GUIDE.md # Migration blueprint
├── site/                  # Next.js app (deployed to Vercel)
│   ├── src/app/           # Pages & API routes
│   ├── src/components/    # React components
│   ├── src/lib/           # Utilities
│   ├── scripts/           # DB seed scripts
│   ├── supabase/          # Migrations
│   └── public/            # Static assets
├── scripts/               # Utility scripts (deployer)
├── docs/                  # Supporting docs
├── assets/                # Media & design resources
├── misc/                  # One-off files
└── archive/               # Historical (read-only)
    └── wordpress/         # WP exports + scrape data
        ├── exports/       # XML, SQL, theme.zip, uploads/
        └── scrape/        # Scraped JSON, content-map, scripts
```

## Documentation

| File | Contents |
|------|----------|
| `CLAUDE.md` | AI instructions, architecture, golden rules, build workflow |
| `README.md` | Project overview, tech stack, setup, deployment |
| `PROJECT.md` | This file — complete feature inventory |
| `CHANGELOG.md` | Full development history (update every push) |
| `YDM_MIGRATION_GUIDE.md` | Complete migration blueprint with lessons learned from FOM |

## Database Tables

Live tables in Supabase (definitions in `site/supabase/migrations/`).

| Table | Purpose |
|-------|---------|
| `page_content` | Every editable text/image-URL field on the site, keyed by `(page_key, field_key)`. Renders via `<EditableContent>`. |
| `assets` | Image catalog — `asset_key`, `storage_path` (R2 URL), `alt`, `width`, `height`. Looked up by URL in `EditableImage` for alt + dimensions. |
| `content_versions` | Audit trail — every edit to `page_content` writes a version row before the update. |
| `profiles` | Per-user role + email. `role IN ('admin', 'bishop')` per CHECK constraint. New auth users default to `bishop` via the `on_auth_user_created` trigger. |
| `form_submissions` | Contact / prayer / ask submissions. RLS allows anon INSERT, admin/bishop SELECT. |
| `newsletter_subscribers` | Email + status (`subscribed` / `unsubscribed` / `bounced`) + Resend audience reference. |
| `testimonials` | Curated testimonials with moderation states (`pending` / `approved` / `rejected` / `featured`). RLS shows only `approved` to anon. |
| `donations` | Stripe recurring donation ledger — sessions, subscriptions, customer references, status. |
| `orders` | Shop orders — Stripe session, Printful fulfillment status, shipping address (as `printful_recipient` jsonb). |
| `order_items` | Line items per order — `printful_variant_id`, name, quantity, unit price. |

For Supabase project ref + service-role/anon-key usage rules, see `HANDOVER.md`.

## Outstanding Work & Technical Debt

All Phase 1–10 work from PLAN.md is shipped. Remaining tasks are operational, not code:

- [ ] Stripe live-mode verification (sandbox is wired; live keys flip activates real payments)
- [ ] Bishop creates Printful products (catalog UX is in place; needs inventory)
- [ ] Real leader portraits + sermon thumbnails (currently stock CMSMasters demo art)
- [ ] Alt text for 62 images (list in `archive/wordpress/scrape/missing-alts.json`)
- [ ] Replace stock gallery photos (currently 14 demo images)
- [ ] CRA charity status decision → tax-receipt copy on `/give`

See [`HANDOVER.md`](./HANDOVER.md) "Outstanding setup work" for the canonical post-handover task list and [`CHANGELOG.md`](./CHANGELOG.md) for the full phase-by-phase history.
