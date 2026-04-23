# YDM Migration — 3-Day Sprint Plan
## Yeshua Deliverance Ministries: WordPress → Next.js/Vercel

---

## DAY 1 — DATA HARVEST & FOUNDATION (Goal: Everything extracted, project scaffolded)

### Morning (2-3 hrs) — Manual Exports
- [ ] Log into YDM WordPress admin
- [ ] Tools → Export → All Content → download XML → save to exports/wordpress-export.xml
- [ ] phpMyAdmin → Export database → SQL → save to exports/database.sql
- [ ] FTP/cPanel → Download /wp-content/themes/[theme]/ → save to exports/theme.zip
- [ ] FTP/cPanel → Download /wp-content/uploads/ → save to exports/uploads/
- [ ] Screenshot EVERY page of the live WordPress site for visual reference
- [ ] WordPress site URL is: https://ydministries.ca

### Afternoon (3-4 hrs) — Agent Extraction
- [ ] Open VS Code → open terminal → cd /Users/mikeymusiq/nanoclaw/projects/ydm
- [ ] Copy CLAUDE.md to project root
- [ ] Copy scraper.py and xml_parser.py to scrape/ folder
- [ ] Open Claude Code, paste CLAUDE-CODE-PROMPT.md content
- [ ] Let Agent 1 (Scraper) run — crawls https://ydministries.ca
- [ ] Let Agent 2 (Theme Parser) run — parses theme.zip
- [ ] Let Agent 3 (XML Parser) run — parses wordpress-export.xml
- [ ] Let Agent 4 (Assets) run — copies uploads to public/media/

### End of Day 1 Checkpoint:
- scrape/ folder should contain: pages.json, styles.json, fonts.json, colors.json,
  navigation.json, design-tokens.json, all-pages.json, site-map.json
- public/media/ should contain all WordPress media files
- Review site-map.json to confirm ALL pages were captured

---

## DAY 2 — BUILD THE CLONE (Goal: Full Next.js 15.4.11 site built, pixel-perfect)

### Morning (3-4 hrs) — Scaffold & Design Tokens
- [ ] Claude Code: run Agent 5 scaffold:
      npx create-next-app@15.4.11 . --typescript --tailwind --app --src-dir --import-alias "@/*" --yes
- [ ] Confirm package.json shows "next": "15.4.11" before proceeding
- [ ] Review scrape/design-tokens.json — verify all colors and fonts are correct
- [ ] Compare extracted fonts to WordPress site (open live site, check DevTools)
- [ ] Claude Code: build tailwind.config.ts with all extracted colors
- [ ] Claude Code: build globals.css with all fonts and CSS variables
- [ ] Claude Code: build Header and Footer components
- [ ] Run `npm run dev` — verify header/footer match WordPress site exactly

### Afternoon (4-5 hrs) — Page by Page
- [ ] Claude Code: build Home page — compare to WordPress screenshot
- [ ] Claude Code: build About page
- [ ] Claude Code: build Services/Ministry page
- [ ] Claude Code: build Sermons/Media page
- [ ] Claude Code: build Contact page
- [ ] Claude Code: build any remaining pages from site-map.json
- [ ] For each page: visual diff against WordPress screenshot, note any discrepancies

### Evening (1-2 hrs) — Polish
- [ ] Fix any font issues (check Google Fonts loading correctly)
- [ ] Fix any color mismatches
- [ ] Fix any spacing/layout issues
- [ ] Test mobile responsiveness for all pages
- [ ] Check all images are loading from /media/

### End of Day 2 Checkpoint:
- `npm run dev` shows all pages
- Each page visually matches the WordPress site
- All images loading, all fonts correct, all colors correct

---

## DAY 3 — CMS + DEPLOY (Goal: Live on Vercel with Payload + Supabase)

### Morning (2-3 hrs) — Payload CMS
- [ ] Create Supabase project at supabase.com — get DATABASE_URI
- [ ] Claude Code: run Agent 6 (Payload CMS setup)
- [ ] Review payload/collections/ — verify all content types are defined
- [ ] Test Payload admin panel at /admin (locally)
- [ ] Claude Code: run Agent 7 (seed Supabase with WordPress content)
- [ ] Verify content appears in Payload admin

### Afternoon (2-3 hrs) — Connect CMS to Pages
- [ ] Update src/app pages to fetch content from Payload/Supabase instead of static JSON
- [ ] Test that editing content in Payload admin updates the page
- [ ] Test media uploads in Payload

### Late Afternoon (1-2 hrs) — GitHub Setup
- [ ] Create new GitHub repo: github.com/[your-org]/ydm-website
- [ ] Claude Code: run Agent 8 (git init, push to GitHub)
- [ ] Verify all files pushed (check GitHub repo)

### Evening (1-2 hrs) — Vercel Deploy
- [ ] Go to vercel.com → New Project → Import from GitHub → select ydm-website
- [ ] Add environment variables from .env.local.example:
  - DATABASE_URI (Supabase connection string)
  - PAYLOAD_SECRET (random string)
  - NEXT_PUBLIC_SERVER_URL (your Vercel URL)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Deploy
- [ ] Test live URL — verify all pages load correctly
- [ ] Test Payload admin at [vercel-url]/admin

### End of Day 3 Checkpoint:
- [ ] Site is live on Vercel
- [ ] All pages match WordPress site
- [ ] Payload admin accessible and seeded with content
- [ ] Bishop Wilson can log in and edit content

---

## FINAL HANDOFF CHECKLIST

### Technical
- [ ] All pages migrated (compare site-map.json to Vercel deploy)
- [ ] All images loading (no broken images)
- [ ] All fonts loading (check DevTools Network tab)
- [ ] All colors correct
- [ ] Mobile responsive on iPhone and Android
- [ ] Contact form working (set up EmailJS or Resend)
- [ ] SSL active (Vercel handles this automatically)

### CMS
- [ ] Payload admin login credentials created for Bishop Wilson
- [ ] All content seeded and editable
- [ ] Media library populated
- [ ] Instructions document created for the ministry team

### DNS (if switching domain)
- [ ] Add custom domain in Vercel dashboard
- [ ] Update DNS records at domain registrar
- [ ] Wait for propagation (up to 48 hours)
- [ ] Test at custom domain

---

## ENVIRONMENT VARIABLES (.env.local)

```
# Payload CMS
PAYLOAD_SECRET=your-random-secret-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Supabase
DATABASE_URI=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Email
RESEND_API_KEY=your-key
```

---

## IF SOMETHING GOES WRONG

### Fonts not matching?
Open WordPress site → DevTools → Network → Filter by "font"
Note the exact font file URLs and add them manually to your Next.js project.

### Colors slightly off?
Open WordPress site → DevTools → Elements → pick any colored element
Copy the exact computed hex value from the Styles panel.

### Page layout not matching?
Open WordPress site → DevTools → Elements
Copy the HTML structure of the specific section and rebuild it in React.

### Images missing?
Check public/media/ folder — the file may exist but with a different path.
Update the image path in the page JSON file.

### Payload not connecting to Supabase?
Check DATABASE_URI format — must use the "Direct connection" string from Supabase,
not the "Connection pooling" string.

### Next.js version conflict?
If any package complains about the Next.js version, check peer dependencies first.
Do NOT upgrade Next.js beyond 15.4.11 without webmaster approval.
Run: npm install --legacy-peer-deps if needed to resolve conflicts.

---

## EMERGENCY BACKUP PLAN
If any agent fails or produces bad output, you can always:
1. Open https://ydministries.ca in your browser
2. View Page Source (Ctrl+U)
3. Copy the HTML directly
4. Paste into a Next.js page and clean it up manually
5. Extract CSS from DevTools Styles panel

This is slower but guaranteed to be 100% accurate.
