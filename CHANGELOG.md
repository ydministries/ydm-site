# YDM Changelog

All notable changes to this project will be documented in this file.
Every push to GitHub or Vercel must be recorded here.

---

## [2026-05-05] - c98ff74

### Phase Z — decommission index_filter stubs
- chore(Z): codegen-pages.ts now skips `type: "index_filter"` routes entirely (no more "Filtered list — wiring in Phase H" stubs)
- chore(Z): deleted 18 generated stub pages across 5 trees: `(site)/{category,tag,author,sermons-category,cmsms_profile_category}` and `(site)/events/category`
- .codegen-manifest.json count: 64 → 46 (drops the 18 index_filter entries)
- Behavior preserved: legacy WP filter URLs still 308-redirect to canonical indexes (`/blog?category=…`, `/blog?tag=…`, `/blog?author=…`, `/sermons?category=…`, `/events?category=…`, `/team?category=…`) via existing next.config siteMap entries
- Note: query-param filtering on the canonical index pages is intentionally NOT wired — most filter slugs have no underlying data (sermons/events/team have no category field; blog categories don't match the WP slugs). Filter URLs render the unfiltered index, which is acceptable for archive URLs that nobody links to internally
- 18 `*.cat.*`/`*.tag.*`/`*.author.*` page_content rows in Supabase remain as meta-only seed (per memory entry "intentionally meta-only"); admin can still edit their meta titles for SEO if filtering is wired in a future phase

---

## [2026-05-04] - 8e3a4d3

### Phase Q — About / Contact / Live / Prayer templates
- feat(Q): AboutTemplate — 6-section about page (hero, story split, mission/vision/values, leaders teaser, locations teaser, gold CTA band)
- feat(Q): ContactTemplate — FOM-style 2-col layout (info column with icon-square rows + branded YDM card on left, ContactForm on right) with 14-reason optgroup select, dynamic placeholder, per-reason success messages
- feat(Q): LiveTemplate — full-bleed hero, 16:9 YouTube live-stream iframe (`UC7JM1kSVzeKSJ5MmiHIE7IA` / `@YDMWorldwide`), schedule band, subscribe CTA, catch-up link
- feat(Q): PrayerTemplate — hero, intro, mailto form (5 reasons + 3 sharing options), privacy card, give/contact CTAs
- feat(Q): `_helpers/MailtoForm.tsx` (generic, used by PrayerTemplate) + `_helpers/ContactForm.tsx` (controlled-state, FOM-style, used by ContactTemplate)
- feat(Q): registered all 4 templates in `byKey` of `templateRegistry`; codegen rewired `(site)/about|contact|live|prayer/page.tsx` as thin shims
- chore(Q): manual-seed entries for about (13 fields), contact (7), live (10), prayer (8 new merged with 9 existing) — 38 net-new rows after `seed:fixups:commit`
- chore(Q): updated `global.social.youtube` from `@BishopHuelWilson` → `@YDMWorldwide` (DB-only, REST PATCH)
- fix: `lib/blog.ts` filters non-canonical image hosts (CMSMasters demo URLs would crash `<Image>`); prefers seeded `hero_image` over scraped `image.01`

---

## [2026-05-04] - 8cf7d0d

### Phase N — remaining per-type + index templates
- feat(N): BlogTemplate, EventTemplate, CampaignTemplate, LocationTemplate registered in template registry by type
- feat(N): index templates for blog, events, give, ministries, sermons, team registered by page key
- feat(N): lib accessors for blog, campaigns, events, locations (parallel to ministries/sermons/team)
- chore(N): refactor 17 generated `(site)/*` pages to delegate to template registry (374 + / 419 -)
- chore: ignore `.vercel/` in `site/.gitignore`
- chore: seed-fixups + manual-seed.json adjustments

---

## [2026-04-26] - 045acb2

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
