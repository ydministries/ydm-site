# Yeshua Deliverance Ministries (YDM) — Website

Full-stack community web platform for a Christian ministry organization. Built with Next.js 16, Supabase, Stripe, and deployed on Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 3.4 with custom YDM tokens |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe (donations, one-time + recurring, CAD) |
| Email | Resend (newsletters, transactional) |
| Rich Text | TipTap 3.22.x |
| Images | Sharp (processing), yet-another-react-lightbox (gallery) |
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
