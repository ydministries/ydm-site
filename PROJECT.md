# Yeshua Deliverance Ministries (YDM) — Feature Inventory

## Overview
Full-stack community web platform for a Christian ministry organization. WordPress migration to Next.js 16 + Supabase + custom admin panel.

## Status
🟢 **Live in production** as of 2026-05-04. 11 feature phases shipped 2026-05-05/06. Site is handed over 2026-05-06. See [`HANDOVER.md`](./HANDOVER.md) for the maintainer reference.

## Key Info
- **Short name:** YDM
- **Type:** Ministry / Faith Organization
- **Primary Contact:** Mikey
- **Source Site:** https://ydministries.ca (WordPress)
- **Stack:** Next.js 16.2.2, Supabase, Stripe, Resend, TipTap, Tailwind CSS
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

_To be populated as tables are created. See `YDM_MIGRATION_GUIDE.md` section 4 for planned schema._

### Core CMS
| Table | Purpose |
|-------|---------|
| `pages` | Page registry (route, title, status) |
| `page_sections` | Ordered sections within each page |
| `page_content` | Every piece of editable text on the site |
| `page_content_history` | Content edit history |

### Structured Content
| Table | Purpose |
|-------|---------|
| `team_members` | Staff & leadership |
| `testimonials` | Member testimonials |
| `stats` | Ministry statistics |
| `faqs` | Frequently asked questions |
| `events` | Ministry events |
| `posts` | Blog posts / sermons |
| `gallery_items` | Gallery photos/videos |
| `albums` | Gallery albums |
| `newsletters` | Newsletter campaigns |
| `donations` | Donation records |

### Community
| Table | Purpose |
|-------|---------|
| `guestbook_entries` | Visitor guestbook |
| `prayer_requests` | Prayer requests |
| `profiles` | User profiles with 5-tier roles |

## Pages

_To be populated as pages are built. Format: route, status, admin coverage._

### Public Pages
| Route | Status | Admin Editor |
|-------|--------|-------------|
| _Pages will be listed here as they are built_ | | |

### Admin Pages
| Route | Status | Purpose |
|-------|--------|---------|
| _Admin pages will be listed here as they are built_ | | |

## API Routes

_To be populated as routes are created._

| Route | Method | Purpose |
|-------|--------|---------|
| _API routes will be listed here as they are built_ | | |

## Outstanding Work & Technical Debt

All Phase 1–10 work from PLAN.md is shipped. Remaining tasks are operational, not code:

- [ ] Stripe live-mode verification (sandbox is wired; live keys flip activates real payments)
- [ ] Bishop creates Printful products (catalog UX is in place; needs inventory)
- [ ] Real leader portraits + sermon thumbnails (currently stock CMSMasters demo art)
- [ ] Alt text for 62 images (list in `archive/wordpress/scrape/missing-alts.json`)
- [ ] Replace stock gallery photos (currently 14 demo images)
- [ ] CRA charity status decision → tax-receipt copy on `/give`

See [`HANDOVER.md`](./HANDOVER.md) "Outstanding setup work" for the canonical post-handover task list.

## Session Log
- **2026-03-23** — Project folder created
- **2026-04-07** — Reorganized to match FOM structure, migration guide written, Payload removed
- **2026-04-23** — Schema migrations + admin auth + role system shipped
- **2026-04-26** — Codegen + 64-route content seed + 433 R2 media migration + HomeTemplate
- **2026-05-04** — Domain cutover to Vercel; site goes live
- **2026-05-05/06** — 11 feature phases shipped (Z, AA, CC, DD, EE, GG, HH, II, JJ, KK, LL); handover doc written
