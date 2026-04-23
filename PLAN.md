# YDM Migration Plan — No-Hardcode Edition

**Last updated:** 2026-04-19
**Status:** 🔒 Locked — proceeding to Step 1 (content-map.json)
**Owner:** Mikey (webmaster) + Claude (build)
**Goal:** 1:1 carbon-copy migration of https://ydministries.ca/ from WordPress to a custom Next.js + Supabase site, with **100 % editable web copy** via a custom CMS panel. Every lesson learned from the FOM project is baked in.

---

## 1. Why FOM's web copy ended up hardcoded

When a developer (human or LLM) builds a page by looking at theme files, the path of least resistance is to transcribe the literal strings straight into JSX. Even with a rule like *"every string goes in the DB,"* if the author is hand-authoring the component and the copy is right there in the reference, muscle memory wins. Fallback props on content components (`<EditableContent fallback="…">`) are hardcoding with extra steps — they look safe but bake copy into the binary. Result: a CMS that can't actually edit the site.

**Root cause:** the workflow gave the author both the content *and* the opportunity to paste it. Remove the opportunity, and the problem disappears.

---

## 2. The core shift — separate *what it says* from *how it looks*

Content becomes a build input, not a build output. Layout becomes Claude's only creative responsibility on each page.

Three mechanical guarantees make hardcoding physically impossible:

### 2.1. DB-first seeding
The Supabase `page_content` table is populated **before any page component is written.** Source of truth = existing scrape at `archive/wordpress/scrape/pages/*.json` cross-referenced against `archive/wordpress/exports/wordpress-export.xml`. Every string gets a stable key like `home.hero.title`, `ministries.worship.intro_p1`, `sermon.gilgal.notes_body`.

### 2.2. Codegen, not hand-authoring
A script (`scripts/codegen-pages.ts`) walks the content-map and emits Next.js page skeletons containing **only** `<EditableContent fieldKey="..." />` placeholders inside a `<ContentProvider pageKey="home">`. Claude styles and composes those placeholders — but never edits copy in JSX. If the scrape changes, regenerate; styling lives in sibling components and survives.

### 2.3. `EditableContent` with zero fallback
Signature:
```ts
<EditableContent fieldKey="home.hero.title" as="h1" className="..." />
```
No `defaultValue`. No `fallback`. No `children`. Missing key ⇒ loud `[MISSING: home.hero.title]` in dev, build error in prod. There is literally no API surface for hardcoding copy.

---

## 3. Architecture

### 3.1. Supabase schema

```
page_content
  id                uuid pk
  page_key          text       (e.g. "home", "ministries.worship")
  field_key         text       (unique per page_key; e.g. "hero.title")
  value             text
  draft_value       text
  value_type        enum(text, richtext, markdown, html, number, url, date)
  published_at      timestamptz
  updated_at        timestamptz
  updated_by        uuid → users.id
  unique (page_key, field_key)

assets
  id                uuid pk
  asset_key         text unique (e.g. "home.hero.bg")
  storage_path      text       (Supabase Storage)
  alt               text
  caption           text
  width             int
  height            int
  mime_type         text

content_versions          — audit/rollback log (triggered on page_content update)
users + roles             — Supabase Auth, 5-tier (member, partner, volunteer, editor, admin)
audit_log                 — generic CMS action log

-- Domain tables (content modelled, not free text)
sermons, sermon_scripture_refs, events, ministries, campaigns, blog_posts, blog_comments,
prayer_requests, guestbook_entries, contact_submissions, newsletter_subscribers
```

All domain tables still use `page_content` for their free-text marketing copy (titles, intros, CTAs) and have their own structured columns for things that are genuinely data (dates, scripture refs, video URLs).

### 3.2. Next.js components

```
src/lib/
  content.ts                Server-side fetcher. One query per page, keyed by page_key.
  supabase.ts               Clients (browser + server + admin)

src/components/
  ContentProvider.tsx       Page-level context. Loads all keys for pageKey in one batch.
  EditableContent.tsx       Text node. No fallback prop. Ever.
  EditableRichText.tsx      Markdown or sanitized HTML.
  EditableImage.tsx         Reads from assets table. <img src="..."> forbidden in page files.
  EditableList.tsx          Repeating blocks (sermon cards, ministry tiles, event items).
  EditableLink.tsx          Nav/CTA link with editable href + label.

src/app/(site)/**/page.tsx  Codegen'd server components. Placeholders only, then styled.
src/app/admin/**            CMS panel — list/edit/preview/publish, inline edit on public pages.

scripts/
  scrape-to-content-map.ts  Walks archive/wordpress/scrape/pages/*.json → content-map.json
  xml-to-domain.ts          Walks wordpress-export.xml → sermons, events, blog tables
  upload-assets.ts          archive/wordpress/exports/uploads/ → Supabase Storage + assets rows
  seed-content.ts           content-map.json + domain JSON → Supabase
  codegen-pages.ts          content-map.json → skeleton app/(site)/**/page.tsx files
  validate-content.ts       AST walk: every fieldKey exists, no literal strings in page children
```

---

## 4. Guardrails (the part that makes regression impossible)

1. **ESLint rule** — custom rule blocks raw JSX text children inside `src/app/(site)/**`. Tailwind className strings still allowed; children text is not. `'use client'` pages in this tree are also disallowed unless explicitly opted in.
2. **CI gate** — GitHub Action runs `validate-content` on every PR. Fails if any page component references a missing `fieldKey`, or any file under `app/(site)` contains a JSX text literal > 3 chars.
3. **Build gate** — same script runs inside `next build` via `next.config.js` webpack plugin. Broken keys = failed deploy.
4. **`EditableContent` API** — no `fallback`, `children`, or `defaultValue` props exist. TypeScript will refuse.
5. **Pre-commit hook** — `validate-content --changed` runs locally.
6. **PR template** — checkbox: *"New copy added? → Added seed row? → `validate-content` passes?"*

---

## 5. Execution order (gates between every step)

| # | Phase | Deliverable | Gate before next step |
|---|---|---|---|
| 1 | **Content map** | `scripts/scrape-to-content-map.ts` emits `content-map.json` — every string keyed, typed, grouped by page. Includes full inventory of ~177 pages & CPTs. | **Mikey reviews + approves keys page-by-page.** |
| 2 | **Schema + seed** | Supabase project created, schema migrated, `seed-content.ts` runs, `page_content` populated. Domain tables seeded from XML (sermons, events, blog, etc.). | Spot-check rows in Supabase dashboard. |
| 3 | **Asset migration** | `upload-assets.ts` pushes every `.webp/.jpg/.png/.mp4` from `exports/uploads/` to Supabase Storage with `assets` rows. | Every scraped asset has a row; no 404s. |
| 4 | **Primitives + validator** | `EditableContent`, `EditableImage`, `EditableRichText`, `EditableList`, `ContentProvider`, `validate-content.ts` — built, unit-tested. | No fallback API exists. Validator runs green on empty project. |
| 5 | **Codegen** | `codegen-pages.ts` emits skeleton `page.tsx` for every route. Pure placeholders, zero styling. | Every page renders all copy from DB on a blank Tailwind reset. |
| 6 | **Admin CMS** | `/admin/*` list / edit / preview / publish for every page and domain table. Role-based access. | Edit a key → see change on site after publish. |
| 7 | **Styling + layout** | **Claude's first creative pass.** Per-page styling, layout, motion, imagery. Design system tokens (`ydm-*` Tailwind prefix). | ESLint + validator stay green. Visual parity with current site. |
| 8 | **Auth + inline edit + versions** | Supabase Auth, 5-tier roles, click-to-edit on public pages (auth-gated), `content_versions` history with revert. | Round-trip: edit inline ↔ edit in admin. Revert works. |
| 9 | **Integrations** | Stripe (replacing GiveWP), Resend (transactional email), contact form, prayer request submission, newsletter, YouTube/live embed, sermon video player. | Donor migration path confirmed. Test transaction completes. |
| 10 | **Deploy + cutover** | GitHub → Vercel deploy, DNS cutover, 301 redirects for every WP URL. `CHANGELOG.md` entry. | Old site archived. Monitoring in place for 7 days. |

Steps 1–5 happen *before any styling.* That's the whole trick.

---

## 6. Rules for me (Claude) when building

- **Never open a theme PHP file while authoring a page component.** Theme reference is for *design*, and is consulted from a separate terminal/window — not pasted into JSX.
- **If I catch myself typing a literal string inside `app/(site)/**`, stop.** Either (a) it belongs in `page_content` and needs a key + seed row, or (b) it belongs in a design system primitive (e.g. loading spinner label) and lives in `src/components/ui/*`.
- **No fallbacks, no defaults, no "just hardcode it for now."** The "for now" is how FOM broke.
- **Codegen pages are regenerated, not hand-maintained.** If a copy block needs to appear on a page that doesn't exist in the scrape, add the key to `content-map.json` and re-run codegen.
- **Every push to GitHub/Vercel gets a `CHANGELOG.md` entry** (per CLAUDE.md).

---

## 7. Known source files (inventory confirmed 2026-04-18)

| Path | Role |
|---|---|
| `archive/wordpress/exports/wordpress-export.xml` | 4.7 MB WXR v1.2 (WP 6.9.4, 2026-03-30). Authoritative content source for codegen. |
| `archive/wordpress/exports/database.sql` | 13 MB DB dump. Menu IDs, Elementor JSON, post meta, settings. |
| `archive/wordpress/exports/theme/faith-connect/` | Active theme (CMSMasters "Faith Connect"). **Visual reference only — never fed to codegen.** |
| `archive/wordpress/exports/uploads/` | Full media library (2023, 2025, 2026) + plugin folders (cmsmasters, elementor, forminator, revslider, woocommerce_uploads). |
| `archive/wordpress/scrape/` | Live-site scrape: 177-URL `site-map.json`, per-page JSON, colors, fonts, nav, styles. |
| `memory.md` | Human-readable ingest of all the above. Always current. |

Plugins detected: **Elementor**, **Forminator** (forms), **Revolution Slider**, **WooCommerce** (shop), **GiveWP** (donations).
Authors: `YDMAssistant` (mikewilson556@gmail.com), `YDM Admin` (yeshuawebmaster@gmail.com).

---

## 8. Locked decisions (2026-04-19)

### 8.1. Infrastructure
- **Hosting:** Cloudflare Pages (free tier, commercial use permitted, unlimited bandwidth).
- **Domain registrar — two-phase plan:**
  - **Phase 1 (now → 2026-09-06):** WHC keeps the registration, Cloudflare becomes the DNS manager. WHC nameservers → Cloudflare nameservers. Email Routing + Pages work immediately.
  - **Phase 2 (at WHC renewal 2026-09-06):** Transfer `ydministries.ca` to Cloudflare Registrar at-cost (~$14 CAD/yr, billed USD). Adds 1 year to expiry. Cancel WHC plan once transfer confirms.
- **Database + Auth + Storage:** Supabase (new project `ydm-prod`, free tier, `us-east-1` region).
- **GitHub org:** `ydministries` (new org to be created, single repo).
- **Deploy pipeline:** GitHub → Cloudflare Pages on `main` push.
- **Account ownership:** All SaaS accounts (GitHub, Cloudflare, Supabase, Stripe, Resend, Printful, Sentry, Bitwarden) owned by **`yeshuawebmaster@gmail.com`** (the webmaster Gmail), never the public-facing hub. Limits blast radius if either identity is compromised.

### 8.2. Email architecture (two distinct Gmails, separated by role)
- **Account-owner Gmail:** **`yeshuawebmaster@gmail.com`** — owns all SaaS logins (GitHub, Cloudflare, Supabase, Stripe, Resend, Printful, Sentry, Bitwarden). Never used for ministry-facing email. Hardened with 2FA via authenticator app.
- **Public-facing hub (`YDMinistries48@gmail.com`):** receives all ministry mail, holds all Send-As identities, is the identity tied to the contact form and public "write us" link.
- **Inbound routing (Cloudflare Email Routing):**
  - `info@ydministries.ca` → `YDMinistries48@gmail.com` *(existed at WHC — preserve)*
  - `admin@ydministries.ca` → `YDMinistries48@gmail.com` *(existed at WHC — preserve)*
  - `donate@ydministries.ca` → `YDMinistries48@gmail.com` *(existed at WHC — preserve; DO NOT rename to donations@ — would orphan existing senders)*
  - `bishop@ydministries.ca` → `YDMinistries48@gmail.com` *(new)*
  - `prayer@ydministries.ca` → `YDMinistries48@gmail.com` *(new)*
  - `shop@ydministries.ca` → `YDMinistries48@gmail.com` *(new)*
- **WHC → Cloudflare mail handoff (one-time):**
  1. In WHC, set up forwarding from each existing mailbox (`info@`, `admin@`, `donate@`) → `YDMinistries48@gmail.com`. Safety net during DNS flip.
  2. In the hub Gmail, Settings → Accounts → "Check mail from other accounts" → add all three as IMAP sources (host per WHC's Configure Email Client panel, port 993 SSL). Pulls historical mail down one-time.
  3. Flip nameservers at WHC → Cloudflare auto-imports WHC's MX records, mail continues flowing.
  4. Once DNS propagates, replace WHC MX records with Cloudflare Email Routing MX records. All 6 addresses now route through Cloudflare.
  5. Send test messages to each address, confirm hub Gmail delivery + Send-As replies. Then disable WHC email.
- **Outbound identity:** Gmail Send-As configured in `YDMinistries48@gmail.com` for each custom address so replies go out from the correct ministry address.
- **DNS hardening:** SPF TXT record `v=spf1 include:_spf.google.com ~all` at Cloudflare to prevent DMARC rejection of Send-As mail. DKIM added when Resend is wired up in Step 9.
- **Gmail filters (on hub):** auto-label incoming by to-address (`[Prayer]`, `[Bishop]`, `[Shop]`, `[Donations]`, etc.).
- **Edge-case fallback:** for any rare service that rejects forwarded mail, sign up with the hub Gmail directly (not the custom domain).
- **Google Workspace:** skipped (~$306 CAD/yr for 3 seats, not worth it). Revisit if YDM registers as a CRA charity — free under Nonprofit tier.
- **Security benefit:** compromise of the hub Gmail exposes ministry mail but no infra access; compromise of the webmaster Gmail exposes infra but no ongoing communications.

### 8.3. Design system
- **Type:** Bebas Neue (display) + Barlow (body).
- **Brand tokens:**
  - `ydm-gold` `#D38605` (accent)
  - `ydm-cream` `#F8F1E6` (warm surface)
  - `ydm-ink` `#1A0F00` (text / dark)
  - `ydm-off` `#FDFDFD` (page background)
- **Iconography:** **Custom SVG set (monoline, 1.5px stroke, 24×24, gold).** No emoji in UI. Emoji only in email-subject templates.
- **Bible-study time:** 7:00 PM (authoritative — 7:30 PM contact-page reference was stale).

### 8.4. CMS
- **Roles:** 2-tier — **Admin (webmaster)** and **Bishop Mode**. No member/partner/volunteer/editor tiers in v1.
- **Bishop Mode:** simplified 4-card dashboard, inline edit as primary interface, plain language.
- **Webmaster admin:** full access to all pages, Flex Content Blocks, domain tables, versions, schedule, preview URLs.
- **Flex Content Blocks:** in Step 1 scope — supports About page (currently no copy) and any new pages Bishop wants to add.
- **Scheduled publishing:** supported (cron-triggered promotion of `draft_value` → `value`).
- **Shareable draft preview URLs:** supported (signed, time-bound, read-only).

### 8.5. Shop
- **Approach (Option A):** Custom Next.js storefront reading Printful product catalog → Stripe Checkout → Printful fulfillment webhook. No WooCommerce.

### 8.6. Content strategy
- **Home variants:** drop `/home-two` and `/home-three` — single homepage only.
- **Testimonials:** replace guestbook with curated testimonials module.
- **Sermons:** multi-host video support (YouTube, Vimeo, Rumble) via oEmbed. Transcript auto-import from YouTube captions where available, manual override. Scripture references linked to bible-api.com with version selection. Sermon series + scripture index ship in v1.

### 8.7. Contact form (9 categories)
| # | Dropdown label | Gmail subject | Routing |
|---|---|---|---|
| 1 | General inquiry | `[YDM] General — {Name}` | info@ |
| 2 | Prayer request | `[YDM] 🙏 Prayer Request — {Name}` | prayer@ |
| 3 | Speaking invitation | `[YDM] Speaking Invitation — {Name} ({Org})` | bishop@ |
| 4 | Ask Bishop a question | `[YDM] Ask Bishop — {Name}` | bishop@ |
| 5 | Question about the Word | `[YDM] The Word — {Name}` | bishop@ |
| 6 | Shop / order question | `[YDM] Shop — {Name} ({OrderRef?})` | shop@ |
| 7 | Leadership training | `[YDM] Leadership Training — {Name}` | info@ |
| 8 | Family ministry | `[YDM] Family Ministry — {Name}` | info@ |
| 9 | Outreach / partnership | `[YDM] Outreach — {Name}` | info@ |

All submissions persist to Supabase `contact_submissions`, email delivered via Resend with `Reply-To: {visitor_email}`. Prayer requests with "share publicly" checked also write to `prayer_requests` for the prayer wall.

### 8.8. Testing (Step 10)
Rigorous pre-cutover test plan locked: content round-trip, missing-key detection, scheduled publishing, revert, role gates, all 9 contact categories → Resend → Gmail subject/label/Reply-To, prayer wall write-through, sermon video/scripture/transcript flows, Printful + Stripe end-to-end, Stripe donations (one-time + recurring), tax-receipt template, Lighthouse ≥ 95 mobile, keyboard nav, screen-reader labels, WCAG AA contrast, 301 redirects for all 177 old URLs, 7-day post-launch monitoring via Cloudflare analytics + Supabase logs + Sentry.

### 8.9. Donor migration
- **Pending decision (Step 9):** GiveWP → Stripe — fresh platform vs import existing recurring donors. Defer until Step 9; no blocker for Steps 1–8.

---

## 9. Next action

Producing `content-map.json` as the Step 1 artifact — every string on every page keyed from `archive/wordpress/scrape/` + `wordpress-export.xml`. Mikey reviews page-by-page before any code is written. That's the moment the content leaves the code forever.
