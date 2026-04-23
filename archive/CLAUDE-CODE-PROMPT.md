# YDM MIGRATION — CLAUDE CODE MASTER PROMPT
# Copy and paste this into Claude Code (terminal / VS Code) to start the full migration.
# Run this AFTER you have completed Phase 1 (manual exports).

---

## PASTE THIS INTO CLAUDE CODE:

I am migrating the Yeshua Deliverance Ministries (YDM) WordPress website to a custom 
Next.js 15.4.11 site hosted on GitHub/Vercel. The project root is:
/Users/mikeymusiq/nanoclaw/projects/ydm

I need you to orchestrate a team of specialized agents to complete this migration.
Work autonomously and complete each phase before moving to the next. Log your 
progress in migration-log.md as you go.

## PHASE 0 — Setup
1. Read the CLAUDE.md file in the project root for full agent instructions
2. Create the full directory structure as defined in CLAUDE.md
3. Verify the exports folder contains: wordpress-export.xml, database.sql, theme.zip, uploads/

## PHASE 1 — Scraping & Extraction (run in parallel where possible)

### Agent 1 — Scraper
- Run: `pip install requests beautifulsoup4 --break-system-packages`
- Run: `python scrape/scraper.py --url https://ydministries.ca --output scrape/`
- This will create: pages.json, styles.json, fonts.json, colors.json, images.json, navigation.json

### Agent 2 — Theme Parser  
- Run: `cd exports && unzip theme.zip -d theme/`
- Parse exports/theme/style.css for: theme name, all CSS variables, color palette
- Parse exports/theme/theme.json if it exists for typography and color settings
- Parse all .css and .scss files in the theme
- Generate: scrape/design-tokens.json and src/styles/tokens.css

### Agent 3 — XML Parser
- Run: `python scrape/xml_parser.py --input exports/wordpress-export.xml --output scrape/`
- This will create: all-pages.json, all-posts.json, media-library.json, site-map.json
- And individual page files in scrape/pages/

### Agent 4 — Asset Migration
- Copy exports/uploads/ to public/media/
- Run: `npm install sharp` then optimize all images
- Generate: scrape/images-map.json mapping old WP URLs to new /media/ paths

## PHASE 2 — Build Next.js Site

### Agent 5 — Project Scaffold
Run these commands (pinned to Next.js 15.4.11):
```
npx create-next-app@15.4.11 . --typescript --tailwind --app --src-dir --import-alias "@/*" --yes
npm install framer-motion clsx tailwind-merge lucide-react @next/font sharp
```

Then:
- Confirm package.json shows "next": "15.4.11" — do not upgrade or change this version
- Configure tailwind.config.ts using ALL colors from scrape/design-tokens.json
- Configure src/styles/globals.css using ALL fonts and CSS variables from scrape/tokens.css
- Build src/components/Header.tsx as a PIXEL-PERFECT clone of the WordPress header
- Build src/components/Footer.tsx as a PIXEL-PERFECT clone of the WordPress footer
- Build src/components/Navigation.tsx from scrape/navigation.json

For EACH page in scrape/pages/*.json:
- Create src/app/[slug]/page.tsx
- Rebuild the EXACT layout from the scraped HTML and content
- Every font, color, spacing must match the WordPress site

## PHASE 3 — Payload CMS + Supabase

### Agent 6 — Payload CMS
Install: `npm install payload @payloadcms/next @payloadcms/db-postgres`
Create payload.config.ts with collections for:
- Pages, Posts/Sermons, Media, Navigation, SiteSettings
- Each collection should have all fields matching the WordPress data structure
- Connect to Supabase PostgreSQL

### Agent 7 — Supabase
Create src/lib/supabase.ts
Create supabase/migrations/ SQL files for all tables
Create scripts/seed-supabase.ts to seed all content from scrape/pages/
Add environment variables to .env.local.example

## PHASE 4 — Deploy

### Agent 8 — GitHub/Vercel
- git init && git add . && git commit -m "feat: initial YDM migration from WordPress"
- Create vercel.json with build configuration
- Create .github/workflows/deploy.yml for CI/CD
- Push to remote GitHub repo (I will provide the URL)
- Output the Vercel environment variables I need to set in the dashboard

---
START WITH PHASE 0 AND WORK THROUGH EACH PHASE. 
Ask me for the GitHub repo URL before starting Agent 8.
The YDM WordPress URL is: https://ydministries.ca
Report back after each phase with a status update and any issues encountered.
