# Yeshua Deliverance Ministries (YDM) — Website

🟢 **Live at [ydministries.ca](https://ydministries.ca)** — handed over 2026-05-06.

Full-stack community web platform for a Christian ministry organization. Built with Next.js 16, Supabase, Stripe, Resend, Printful, and Cloudflare. Deployed on Vercel.

**For maintainers:** read [`HANDOVER.md`](./HANDOVER.md) first. It's the comprehensive operations + admin reference. [`SMOKE_TEST.md`](./SMOKE_TEST.md) is the pre-handover verification checklist. [`CHANGELOG.md`](./CHANGELOG.md) has the full development history.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (no `tailwind.config.ts`; brand tokens in `@theme` block in `src/app/globals.css`) |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe (donations, one-time + recurring, CAD) |
| Email | Resend (newsletters, transactional) |
| Fulfillment | Printful (Sync Products API; orders submitted as drafts) |
| Images | Cloudflare R2 (CDN at `media.ydministries.ca`) + `next/image` |
| Hosting | Vercel |

## Project Structure

```
ydm/
├── CLAUDE.md              # AI assistant instructions
├── README.md              # This file
├── PROJECT.md             # Complete feature inventory
├── CHANGELOG.md           # Development history
├── YDM_MIGRATION_GUIDE.md # Migration blueprint (from WordPress)
├── site/                  # Next.js app (deployed to Vercel)
│   ├── src/app/(site)/    # All pages (public, dashboard, admin)
│   ├── src/app/api/       # API routes
│   ├── src/components/    # React components
│   ├── src/lib/           # Utilities (auth, content, rate limiting)
│   ├── public/            # Static assets
│   ├── scripts/           # DB seed scripts
│   ├── supabase/          # Migrations
│   └── package.json       # Dependencies
├── scripts/               # Utility scripts (deployer, etc.)
├── docs/                  # Supporting docs (PDFs, specs, screenshots)
├── assets/                # Media & design resources
├── archive/               # Historical references (read-only)
│   └── wordpress/         # Original WP exports, scrape data, theme
└── misc/                  # One-off files
```

## Setup

```bash
cd site
npm install
cp .env.example .env.local   # Fill in Supabase, Stripe, Resend keys
npm run dev                   # Dev server at localhost:3000
```

## Deployment

```bash
# From site/ directory
vercel --prod

# Or use the deploy script
scripts/deployer.sh
```

## Documentation

| File | Contents |
|------|----------|
| `CLAUDE.md` | AI instructions, architecture, build workflow |
| `PROJECT.md` | Complete feature inventory |
| `CHANGELOG.md` | Full development history |
| `YDM_MIGRATION_GUIDE.md` | WordPress migration blueprint with lessons learned |
