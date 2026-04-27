# YDM Changelog

All notable changes to this project will be documented in this file.
Every push to GitHub or Vercel must be recorded here.

---

## [2026-04-26] - <commit-hash>

### Codegen + content infrastructure
- feat(F+G): codegen rewrite — 64 pages bound to route-map.json keys + seeded field_keys; per-key dump fallback for routes without templates
- feat(G): global page seed (18 rows: site identity, SEO defaults, contact, social, footer)
- chore(G): wipe 38 stale generated pages from old key/route namespace
- fix(G.1): script TS types (PostgrestFilterBuilder thenable, contentRoot xml variant)
- chore(I.7): wipe mangled WP nav-block row from home page_content
- fix(I.7): trailing-slash redirects via next.config (52 user redirects + Next auto)
- fix(I.8): normalize dedupe (case + smart quotes + dashes), fix "Minstries"/"WIlson" typos

### Site shell + brand
- feat(H): SiteHeader + SiteFooter + Tailwind v4 brand tokens + base typography
- feat(J.5a): real YDM brand — gold cross+globe logo (auto-traced SVG with continuous-spin animation), Bebas Neue + Barlow + Lora + Abuget self-hosted fonts, navy/gold/cream palette sampled from live ydministries.ca CSS

### HomeTemplate (full rebuild matching live site)
- feat(J): template-registry architecture + HomeTemplate v1
- feat(J.5b-d): hero with worship-pose photo + navy floating service card, FOUNDED IN FAITH split, Mission/Vision/Values 3-col, dark YDM Ministries with real leader photos (extracted via WP XML postmeta), Upcoming Events with date squares, dark Featured Sermons, live Countdown to next 4th Sunday, Meet Our Leaders with bishop+clementina portraits, Get Involved 4-up + gallery strip, Support Mission photo band, Newsletter
- feat(J.5e): 7 new ministry leader photos uploaded to R2 from WP XML _thumbnail_id postmeta
- feat(J.5f): carousel arrows on Ministries + Sermons sections, Welcome band image collage, Get Involved gallery strip
- patch: nav reorganization (Home preserved per elder-friendly UX), section reordering (sermons before events, get involved before give), spinning logo in hero, dark sections gold divider, polish on cursive accents

### Per-type page templates
- feat(K): SermonTemplate covers 6 sermon pages — hero with scripture cursive, custom audio player (±15s skip, scrubber, MM:SS), body prose with inline scripture-timestamp links, auto-extracted scripture cards (37 refs via regex + bible-api.com cached as JSON), related sermons, share buttons, back link
- feat(L): MinistryTemplate covers 7 ministry pages — hero with tagline cursive, leader card with initials avatar, body prose with .editable-prose defensive class, "Join This Ministry" gold CTA, related ministries
- feat(M): TeamTemplate covers 4 team pages (3 rendered + 1 redirect) — split portrait/bio hero, ministries-led grid, sermons-by-them dark band (Bishop only), connect CTA, related team
- chore(M): merge bishop duplicate routes — /team/bishopwilson 308-redirects to /team/bishop-huel-wilson via codegen redirectKeys

### Cleanups
- fix(K cleanup): strip WP share-widget SVGs and title-repeat h6s from sermon body_html (16,645 bytes saved)
- fix(L cleanup): strip CMSMasters demo theme img/figure tags from ministry body_html (20,263 bytes saved); strip "– YDM – Yeshua Deliverance Ministries" suffix from sermon + ministry meta.titles
- chore: rename .sermon-body → .editable-prose (reusable across templates)

### Stats
- 1,015+ rows in Supabase page_content across 65 page_keys (64 routes + global)
- 440 R2 media URLs (433 from Phase B + 7 from J.5e XML postmeta extraction)
- 17/64 detail routes now use a designed per-type template (1 home + 6 sermons + 7 ministries + 3 team)
- 47 routes still use per-key codegen dump fallback (blog ×9, events ×2, campaigns ×2, locations ×2, all index/category routes ×32)

## [2026-04-26] - <commit-hash>
- feat(B): WP media → Cloudflare R2 (433 URLs, 427 uploads, 0 errors); media-manifest.json
- feat(C): rewrite WP media URLs in scrape (3,516 replacements); pages-rewritten/ tree
- feat(D): canonical route-map.json (64 routes) + site-map.json (64 redirects) + aboutydm/about-us alias
- feat(E): content seeder with dry-run/commit, XML backfill for 28 single-item pages, manual seed for ask/guestbook/prayer (820 rows + 62 assets)
- chore(E.7): wipe 664 stale page_content rows from earlier seed namespace; backup at stale-content-backup.json

## [2026-04-24] - 695e7d8
- feat: EditableList primitive, scope-aware editable keys, list-page codegen

## [2026-04-24] - 50be2c8
- feat: codegen 38 skeleton pages, URL restructure, EditableLink prefix pattern

## [2026-04-24] - 23f3711
- fix: DOMPurify wrap, plain-text EditableContent, .single() removal, 78 per-page SEO seed rows

## [2026-04-24] - 2e946cf
- feat: initial Next.js 16 scaffold — primitives, layout, home page, SEO metadata from DB

## [2026-04-23] - e2aebbc
- chore: R2 media mapping, CLAUDE.md 2-tier role system, remove WP styles.json

## [2026-04-23] - 081cb74
- chore: restore theme license token-data to repo

## [2026-04-23] - d11d8cc
- chore: initial commit — migration scaffolding + WP scrape + SQL migrations

---

## 2026-04-07

- chore: Reorganize project folder to match FOM structure
- chore: Create YDM_MIGRATION_GUIDE.md (CMS-first migration blueprint)
- chore: Replace CLAUDE.md with updated instructions (no Payload, Next.js 16.2.2)
- chore: Archive old planning files (CLAUDE-CODE-PROMPT.md, 3-day-sprint-plan.md)
- chore: Delete payload/ directory
- chore: Move WordPress exports and scrape data to archive/wordpress/
- chore: Create README.md, CHANGELOG.md, directory structure
- docs: Create FOM_FEATURES_CHECKLIST.md — every FOM feature as a to-do for YDM
- docs: Add live preview, pixel-perfect clone, elder-friendly UX requirements to migration guide
- docs: Update all master docs to reflect new directory structure
