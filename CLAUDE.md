# YDM — Yeshua Deliverance Ministries Website

## Project: WordPress → Next.js Migration
## Webmaster: Mikey
## Target Stack: Next.js 16.2.2 (App Router) + Tailwind CSS + Supabase + Custom Admin Panel
## Deploy: GitHub → Vercel
## Project Root: /Users/mikeymusiq/nanoclaw/projects/ydm

---

## READ FIRST

**Before writing ANY code, read `YDM_MIGRATION_GUIDE.md` in this directory.** It contains the complete migration blueprint with lessons learned from the FOM project, exact dependency versions, database schema, component architecture, and the page-by-page build workflow.

---

## Architecture (No Payload CMS)

This project uses a **custom-built admin panel** with Supabase as the database — the same pattern as the FOM (Friends of Malton) project. There is NO Payload CMS, NO headless CMS, NO third-party CMS.

- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **CMS:** Custom admin panel at `/admin/*` with inline editing on public pages
- **Content storage:** `page_content` table in Supabase (every piece of text on the site)
- **Auth:** Supabase Auth with 5-tier role system (member → admin)
- **Payments:** Stripe
- **Email:** Resend

---

## The Golden Rule

**If it's text on the screen, it's a row in the database.**

No hardcoded web copy in JSX. Every visible string uses the `EditableContent` component which fetches from the `page_content` table. Content is seeded from WordPress scrape data BEFORE any page component is built.

---

## Key Files

| File | Purpose |
|------|---------|
| `YDM_MIGRATION_GUIDE.md` | **Complete migration blueprint — read this first** |
| `README.md` | Project overview & setup |
| `PROJECT.md` | Feature inventory |
| `CHANGELOG.md` | Dev history (update every push) |
| `FOM_FEATURES_CHECKLIST.md` | Every FOM feature as a to-do (pick what to build for YDM) |
| `site/src/components/EditableContent.tsx` | Core CMS component (no hardcoded fallbacks) |
| `site/src/components/ContentProvider.tsx` | Page-level content context (batch loading) |
| `site/src/lib/content.ts` | Server-side content fetching |
| `site/src/lib/apiAuth.ts` | Admin auth guards |
| `site/scripts/seed-content.ts` | Seeds DB from WordPress scrape data |
| `archive/wordpress/scrape/content-map.json` | Every string on the site mapped to DB keys |

---

## Development Commands

```bash
cd site
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Serve production build
```

---

## Build Workflow (Per Page)

1. Verify seed data exists in DB for this page
2. Create server component with `ContentProvider`
3. Use `EditableContent` for every text element — no string literals
4. Verify content appears in admin panel at `/admin/content/pages/[pageKey]`
5. Test round-trip: edit in admin ↔ edit inline on page
6. Update PROJECT.md

---

## Design System

Custom Tailwind tokens (YDM-branded). Colors, fonts, and spacing extracted from WordPress theme and stored in `tailwind.config.ts`. Use `ydm-*` prefix for brand tokens.

---

## Changelog Rule

**Every push to GitHub or Vercel must be recorded in `CHANGELOG.md`.**
