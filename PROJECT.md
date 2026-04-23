# Yeshua Deliverance Ministries (YDM) — Feature Inventory

## Overview
Full-stack community web platform for a Christian ministry organization. WordPress migration to Next.js 16 + Supabase + custom admin panel.

## Status
Setting up — project folder organized, migration guide written, ready to begin build.

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

- [ ] Scrape WordPress site and generate content-map.json
- [ ] Create Supabase project and run migrations
- [ ] Run seed scripts to populate page_content
- [ ] Scaffold Next.js 16 project in site/
- [ ] Build core components (EditableContent, ContentProvider, AdminContext)
- [ ] Build admin content editor (/admin/content/pages)
- [ ] Build each public page with CMS-first workflow
- [ ] Set up Stripe donations
- [ ] Set up Resend newsletters
- [ ] Set up gallery with albums
- [ ] Configure Vercel deployment

## Session Log
- **2026-03-23** — Project folder created
- **2026-04-07** — Reorganized to match FOM structure, migration guide written, Payload removed
