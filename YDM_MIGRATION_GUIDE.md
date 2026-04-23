# YDM WordPress → Next.js Migration Guide

**The builder's manual.** Read this before writing any code.

> **This file is the "how to build it" companion. PLAN.md is the "what we decided" record.**
> Any conflict between the two is resolved in favor of PLAN.md §8 (locked decisions).
> If you find new drift, update this file — never let PLAN.md drift to match code.

---

## 1. Why this project exists (FOM lesson)

The Friends of Malton (FOM) WordPress migration shipped a CMS that couldn't actually edit the site. Root cause: the developer hand-authored JSX while looking at the copy in the WordPress theme, so strings were transcribed straight into components. An `EditableText` component with a `children` fallback let the hardcoded copy render while the database stayed empty. The admin panel queried the `page_copy` table, found zero rows, and showed empty pages.

**Conclusion:** a rule that says "every string goes in the DB" is not enough when the workflow hands the author both the content and the opportunity to paste it. Remove the opportunity, and the failure mode disappears.

---

## 2. The three mechanical guarantees

These make hardcoding physically impossible — not just discouraged.

**2.1 DB-first seeding.** The Supabase `page_content` table is populated *before any page component is written.* Source of truth = `archive/wordpress/scrape/pages/*.json` cross-referenced against `archive/wordpress/exports/wordpress-export.xml`. Every string gets a stable dotted key like `home.hero.title`, `ministries.worship.intro_p1`, `sermon.gilgal.notes_body`.

**2.2 Codegen, not hand-authoring.** `scripts/codegen-pages.ts` walks `content-map.json` and emits Next.js page skeletons containing **only** `<EditableContent fieldKey="..." />` placeholders inside a `<ContentProvider pageKey="home">`. Claude styles and composes those placeholders but never edits copy in JSX. Regenerate when the scrape changes; styling lives in sibling components and survives.

**2.3 Zero-fallback `EditableContent`.**

```tsx
<EditableContent fieldKey="home.hero.title" as="h1" className="text-6xl font-display" />
```

No `defaultValue`. No `fallback`. No `children`. No `placeholder`. Missing key → loud `[MISSING: home.hero.title]` in dev, build error in prod. There is literally no API surface for hardcoding copy.

---

## 3. Locked decisions — reference only

All infrastructure, email, design, CMS, shop, and content-strategy decisions live in **PLAN.md §8**. Do not duplicate them here. A summary of the high-bit choices you must internalize:

- **Hosting:** Cloudflare Pages (not Vercel). Domain on WHC until 2026-09-06, DNS managed by Cloudflare now.
- **Database + Auth + Storage:** Supabase, project `ydm-prod`, free tier, `us-east-1`.
- **GitHub org:** `ydministries`.
- **CMS roles:** 2-tier only — **Admin (webmaster)** and **Bishop Mode**. No member/volunteer/committee tiers in v1.
- **Design tokens:** `ydm-gold #D38605`, `ydm-cream #F8F1E6`, `ydm-ink #1A0F00`, `ydm-off #FDFDFD`. Fonts Bebas Neue (display) + Barlow (body). Custom SVG icons only — no emoji in UI.
- **Shop:** Custom Next.js storefront → Printful catalog → Stripe Checkout → Printful fulfillment webhook. No WooCommerce.
- **Donations:** Stripe (one-time + recurring, CAD).
- **Email:** Deferred until site is built (per 2026-04-22 decision). Do not scaffold Resend, Cloudflare Email Routing, or Send-As until Mikey signals.
- **Content drops:** No `/home-two`, no `/home-three`. Testimonials replace guestbook. No forum. No marketplace.
- **Sermons:** Multi-host video (YouTube/Vimeo/Rumble via oEmbed), transcript auto-import from YouTube captions, scripture refs via bible-api.com, sermon series + scripture index in v1.
- **Contact form:** 9 categories with per-category routing + Gmail subject templates (see PLAN.md §8.7).

---

## 4. Tech stack

### Runtime

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.2.2` | App Router |
| `react` / `react-dom` | `^19.2.4` | UI |
| `typescript` | `^5` | Strict mode |
| `@supabase/supabase-js` | `^2.45.0` | Supabase client |
| `@supabase/ssr` | `^0.5.0` | Server-side cookies |
| `stripe` | `^20.4.1` | Donations + shop checkout |
| `@stripe/stripe-js` | `^8.11.0` | Stripe frontend |
| `tailwindcss` | `^3.4.1` | Styling |
| `tailwind-merge` / `clsx` | `^2.4.0` / `^2.1.1` | Class utils |
| `sharp` | `^0.34.5` | Server image processing |
| `isomorphic-dompurify` | `^3.7.1` | HTML sanitization |

### Rich text (TipTap v3.22)

`@tiptap/react`, `@tiptap/starter-kit`, plus extensions: `color`, `font-family`, `heading`, `highlight`, `horizontal-rule`, `image`, `link`, `placeholder`, `subscript`, `superscript`, `text-align`, `text-style`, `underline`, `@tiptap/pm`. All pinned to `^3.22.1`/`^3.22.2`.

### Media

`react-easy-crop@^5.5.7`, `yet-another-react-lightbox@^3.30.1`.

### Drag & drop

`@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, `@dnd-kit/utilities@^3.2.2`.

### Deferred (do not install yet)

`resend` — email is deferred until after site build.

### Dev

`eslint@^9`, `eslint-config-next@16.2.2`, `autoprefixer`, `postcss`, `@types/node@^20`, `@types/react@^19`, `@types/react-dom@^19`.

---

## 5. Supabase schema

Authoritative schema lives in `site/supabase/migrations/`. The shape below is the locked version from PLAN.md §3.1 — do not invent alternative table splits.

### 5.1 CMS core

```sql
create table page_content (
  id            uuid primary key default gen_random_uuid(),
  page_key      text not null,                  -- "home", "ministries.worship"
  field_key     text not null,                  -- "hero.title", "intro_p1"
  value         text not null default '',       -- published value
  draft_value   text,                           -- staged edit, not yet published
  value_type    text not null default 'text'
                  check (value_type in ('text','richtext','markdown','html','number','url','date')),
  published_at  timestamptz,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id),
  unique (page_key, field_key)
);

create table assets (
  id            uuid primary key default gen_random_uuid(),
  asset_key     text unique not null,           -- "home.hero.bg"
  storage_path  text not null,                  -- Supabase Storage path
  alt           text,
  caption       text,
  width         int,
  height        int,
  mime_type     text,
  updated_at    timestamptz not null default now()
);

create table content_versions (
  id            uuid primary key default gen_random_uuid(),
  page_key      text not null,
  field_key     text not null,
  previous_value text,
  new_value     text,
  edited_by     uuid references auth.users(id),
  edited_at     timestamptz not null default now()
);

-- Trigger: insert a row into content_versions on every page_content update.
```

### 5.2 Auth

```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  role          text not null default 'bishop'  -- 'admin' or 'bishop'
                  check (role in ('admin','bishop')),
  created_at    timestamptz not null default now()
);
```

Two-tier only. No member/volunteer/committee. If a later phase needs public accounts (e.g. for shop orders), treat them as Supabase Auth users with no `profiles` row — profiles is CMS-only.

### 5.3 Domain tables

```sql
-- Sermons with multi-host video + transcripts + scripture refs
create table sermons (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  speaker         text,
  preached_at     date,
  series_id       uuid references sermon_series(id),
  video_provider  text check (video_provider in ('youtube','vimeo','rumble')),
  video_id        text,
  transcript      text,
  notes           text,            -- richtext, rendered via TipTap
  published       boolean default false,
  created_at      timestamptz not null default now()
);

create table sermon_series (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text
);

create table sermon_scripture_refs (
  id              uuid primary key default gen_random_uuid(),
  sermon_id       uuid references sermons(id) on delete cascade,
  reference       text not null,   -- "John 3:16"
  version         text default 'ESV'
);

create table events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  location        text,
  image_url       text,
  capacity        int,
  price_cad       int,             -- cents; null = free
  published       boolean default false
);

create table ministries (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  summary         text,
  sort_order      int default 0,
  published       boolean default true
);

create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  goal_cad        int,
  description     text,
  active          boolean default true
);

create table blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body            text,            -- richtext
  image_url       text,
  author_id       uuid references profiles(id),
  published       boolean default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

create table blog_comments (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references blog_posts(id) on delete cascade,
  name            text,
  email           text,
  body            text,
  approved        boolean default false,
  created_at      timestamptz not null default now()
);

create table prayer_requests (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text,
  request         text not null,
  share_publicly  boolean default false,
  approved        boolean default false,
  is_anonymous    boolean default false,
  created_at      timestamptz not null default now()
);

create table testimonials (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            text,
  body            text not null,
  photo_url       text,
  approved        boolean default false,
  sort_order      int default 0,
  created_at      timestamptz not null default now()
);

create table contact_submissions (
  id              uuid primary key default gen_random_uuid(),
  category        text not null,   -- one of 9 from PLAN §8.7
  name            text not null,
  email           text not null,
  org             text,
  order_ref       text,
  message         text not null,
  created_at      timestamptz not null default now()
);

create table newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  confirmed       boolean default false,
  unsubscribe_token text unique default gen_random_uuid()::text,
  created_at      timestamptz not null default now()
);

create table audit_log (
  id              uuid primary key default gen_random_uuid(),
  actor_id        uuid references profiles(id),
  action          text not null,
  subject_table   text,
  subject_id      uuid,
  meta            jsonb,
  created_at      timestamptz not null default now()
);
```

### 5.4 RLS policies

```sql
-- page_content: public reads published values, admins write
alter table page_content enable row level security;
create policy page_content_read on page_content for select using (true);
create policy page_content_write on page_content for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','bishop'))
);
-- Same pattern for assets, content_versions (admin/bishop only for versions), etc.
```

**Critical:** RLS checks `profiles.role`, never `app_metadata.role` or JWT claims. JWT metadata drifts out of sync with the profiles table — that was a FOM bug.

---

## 6. Component architecture

```
src/lib/
  content.ts              // fetchPageContent(pageKey) — one batched query per page
  supabase.ts             // browser / server / service-role clients
  apiAuth.ts              // requireAdmin(), requireBishop(), requireAnyEditor()

src/components/
  ContentProvider.tsx     // page-level context, loads all keys for pageKey once
  EditableContent.tsx     // text node, zero fallback
  EditableRichText.tsx    // markdown or sanitized HTML
  EditableImage.tsx       // reads assets table by asset_key; <img src="..."> forbidden in pages
  EditableList.tsx        // repeating blocks (sermon cards, ministry tiles)
  EditableLink.tsx        // editable href + label
  admin/
    AdminShell.tsx        // dark sidebar (#182227 background, gold accents)
    BishopShell.tsx       // simplified 4-card dashboard for Bishop Mode
    TiptapEditor.tsx      // dynamic import, ssr:false

src/app/(site)/**/page.tsx   // codegen'd server components — placeholders, then styled
src/app/admin/**             // admin panel (role-gated)

scripts/
  scrape-to-content-map.ts    // archive/wordpress/scrape/pages/*.json → content-map.json
  xml-to-domain.ts            // wordpress-export.xml → sermons / events / blog rows
  upload-assets.ts            // archive/wordpress/exports/uploads/ → Supabase Storage + assets rows
  seed-content.ts             // content-map.json + domain JSON → Supabase
  codegen-pages.ts            // content-map.json → skeleton app/(site)/**/page.tsx
  validate-content.ts         // AST walk + fieldKey existence check
```

### 6.1 `ContentProvider` + `EditableContent`

```tsx
// app/(site)/home/page.tsx (codegen'd)
import { fetchPageContent } from "@/lib/content";
import { ContentProvider } from "@/components/ContentProvider";
import { EditableContent } from "@/components/EditableContent";

export default async function HomePage() {
  const content = await fetchPageContent("home");
  return (
    <ContentProvider pageKey="home" content={content}>
      <section className="bg-ydm-cream py-24">
        <EditableContent fieldKey="home.hero.title" as="h1" className="font-display text-7xl text-ydm-ink" />
        <EditableContent fieldKey="home.hero.subtitle" as="p" className="mt-4 text-xl text-ydm-ink/70" />
      </section>
    </ContentProvider>
  );
}
```

`fetchPageContent` runs one Supabase query keyed by `page_key`, returns a `Map<field_key, row>`. `ContentProvider` puts it in context. `EditableContent` reads from context — zero additional DB calls per instance.

### 6.2 Typed variants (thin wrappers)

```tsx
<EditableHeading fieldKey="about.hero.title" level={1} className="font-display text-6xl" />
<EditableParagraph fieldKey="about.hero.body" className="text-lg" />
<EditableButton fieldKey="about.hero.cta" href="/contact" className="btn-primary" />
<EditableImage assetKey="home.hero.bg" className="w-full h-[80vh] object-cover" />
```

Each wrapper enforces the correct HTML tag. None accept `children`.

---

## 7. Guardrails (what makes regression impossible)

From PLAN.md §4 — all six must ship before Step 7 (styling).

1. **ESLint rule** — custom rule blocks raw JSX text children inside `src/app/(site)/**`. Tailwind `className` strings still allowed; JSX text children are not. `'use client'` in this tree is disallowed unless explicitly opted in.
2. **CI gate** — GitHub Action runs `validate-content` on every PR. Fails if any page component references a missing `fieldKey`, or any file under `app/(site)` contains a JSX text literal > 3 chars.
3. **Build gate** — same `validate-content` runs inside `next build` via `next.config.mjs` webpack plugin. Broken keys = failed deploy.
4. **`EditableContent` API surface** — TypeScript refuses to compile `fallback`, `defaultValue`, `children`, or `placeholder` props. They do not exist in the interface.
5. **Pre-commit hook** — `husky` runs `validate-content --changed` locally.
6. **PR template** — checkbox: "New copy added? → Added seed row? → `validate-content` passes?"

---

## 8. Execution order (from PLAN.md §5)

| # | Phase | Deliverable | Gate |
|---|---|---|---|
| 1 | **Content map** | `scripts/scrape-to-content-map.ts` → `content-map.json`. Every string keyed, typed, grouped. Full 177-URL inventory. | Mikey approves keys page-by-page. |
| 2 | **Schema + seed** | Supabase project created, migrations applied, `seed-content.ts` run, `page_content` populated. Domain tables seeded from XML. | Spot-check rows in Supabase dashboard. |
| 3 | **Asset migration** | `upload-assets.ts` → Supabase Storage + `assets` rows. | Every scraped asset has a row; no 404s. |
| 4 | **Primitives + validator** | `EditableContent`, `EditableImage`, `EditableRichText`, `EditableList`, `ContentProvider`, `validate-content.ts`. | No fallback API. Validator green on empty project. |
| 5 | **Codegen** | `codegen-pages.ts` → skeleton `page.tsx` for every route. Pure placeholders, zero styling. | Every page renders all copy from DB on a blank Tailwind reset. |
| 6 | **Admin CMS** | `/admin/*` list / edit / preview / publish for every page and domain table. Role-based access. Bishop Mode shell. | Edit a key → see change on site after publish. |
| 7 | **Styling + layout** | **First creative pass.** Per-page styling, layout, motion, imagery. Design tokens as `ydm-*` Tailwind utilities. | ESLint + validator stay green. Visual parity with current site. |
| 8 | **Auth + inline edit + versions** | Supabase Auth, 2-tier roles, click-to-edit on public pages (auth-gated), `content_versions` history with revert. | Round-trip: edit inline ↔ edit in admin. Revert works. |
| 9 | **Integrations** | Stripe donations, Printful shop, contact form (9 categories → Resend), prayer request submission, newsletter, sermon player. Email infrastructure wired here (was deferred). | Donor migration path confirmed. Test transaction completes. |
| 10 | **Deploy + cutover** | GitHub → Cloudflare Pages deploy, DNS cutover, 301 redirects for every WP URL. `CHANGELOG.md` entry. | Old site archived. 7-day monitoring via Cloudflare + Supabase + Sentry. |

Steps 1–5 happen *before any styling.* That's the whole trick.

---

## 9. Per-page build workflow (applies to Steps 5 + 7)

For every page, in this order:

**9.1 Verify seed data.**
```sql
select page_key, field_key, value from page_content where page_key = 'about' order by field_key;
```
If rows are missing, run the seed script first. **Do not proceed without seed data.**

**9.2 Generate skeleton.** `codegen-pages.ts` emits `app/(site)/about/page.tsx` with only `<EditableContent fieldKey="..." />` placeholders. Never hand-write a page file.

**9.3 Style the skeleton.** Add wrappers, layout, imagery, motion. Use design tokens (`ydm-*`). **Never touch the `fieldKey` strings or add copy.** If a new copy block is needed, add it to `content-map.json` → re-seed → re-codegen → style.

**9.4 Verify in admin.** Navigate to `/admin/pages/about`. Confirm every field appears, TipTap editor works for rich-text fields, save writes to `page_content.draft_value`, publish promotes `draft_value` → `value`.

**9.5 Round-trip test.** Edit in admin → public page updates. Edit inline on public page (as Bishop) → admin reflects the change. Both write to the same row.

**9.6 Update PROJECT.md.** Add the page to the feature inventory.

---

## 10. Admin panel

### 10.1 Two shells

- **AdminShell** (webmaster) — full dark sidebar, all pages, all domain tables, Flex Content Blocks, versions, schedule, preview URLs.
- **BishopShell** — simplified 4-card dashboard, inline edit as primary interface, plain language, no jargon. Large click targets (≥44px), 16px body text, high contrast, confirmation dialogs on every destructive action.

### 10.2 AdminShell sidebar

```
Dashboard
Content
├── Pages (CMS — editable text)
├── Sermons
├── Sermon series
├── Blog posts
├── Events
├── Ministries
├── Testimonials
└── Campaigns
Shop
├── Products (Printful sync)
└── Orders
Giving
└── Donations
Inbox
├── Contact submissions
├── Prayer requests
└── Blog comments
Media
└── Assets
Subscribers
└── Newsletter
Settings
├── Site settings
├── Users & roles
└── Audit log
```

### 10.3 Page content editor with live preview

Every page-editing view is split-screen: editor left (60%), iframe preview right (40%). Preview iframe loads `/<page>?preview=true`. Admin saves push to `draft_value`; preview iframe listens for `postMessage` events to render drafts instantly without DB roundtrip. Publish button promotes `draft_value` → `value` and writes a `content_versions` row.

Responsive preview buttons (desktop/tablet/mobile) resize the iframe.

### 10.4 Flex Content Blocks

Composable rich blocks — hero, two-column, image+text, CTA, testimonial carousel, scripture card, sermon list, gallery strip. Used for pages that don't exist in the WordPress scrape (e.g. a blank About page) or new pages Bishop wants to add. Stored as JSON in `page_content.value` with `value_type = 'html'` after server-side render, or as a separate `page_blocks` table if block reordering is needed (decide in Step 6).

### 10.5 Scheduled publishing + shareable drafts

- **Scheduled publish:** admin sets `publish_at` on a draft edit; a cron job (Supabase Edge Function, every minute) promotes `draft_value` → `value` when the timestamp passes.
- **Shareable draft URL:** admin generates a signed, time-bound, read-only URL that renders the page with `draft_value` in place of `value`. Signature in JWT with 48-hour expiry.

---

## 11. Feature implementation notes

### 11.1 Stripe donations
One-time + recurring (monthly), CAD, min $1, max $25,000. Designations (specific campaigns), donation messages, dedications. `POST /api/stripe/donate` creates Checkout session. `POST /api/stripe/webhook` handles `checkout.session.completed` + `invoice.paid` + `checkout.session.expired`. Rate limit 30/min per IP.

### 11.2 Printful shop
Nightly cron syncs Printful catalog → `products` table. Public storefront reads from `products`. Checkout via Stripe Checkout with `metadata.printful_variant_id`. `POST /api/stripe/webhook` handles `checkout.session.completed` → creates Printful order via Printful API. `POST /api/printful/webhook` receives fulfillment status → writes to `orders` table → triggers Resend notification (when email is wired in Step 9).

### 11.3 Contact form (9 categories)
Single form with category dropdown. Submissions write to `contact_submissions` and email out via Resend with category-specific subject templates + routing (see PLAN.md §8.7). Prayer-request submissions with "share publicly" also write to `prayer_requests` for the prayer wall.

### 11.4 Newsletter (Resend)
TipTap rich composer in admin. Batch send 100/batch, 500ms delay. Test send before blast. CSV subscriber import. Per-subscriber unsubscribe tokens. Status: draft → sending → sent → failed. Max serverless timeout 5 min.

### 11.5 Sermons
`sermons.video_provider` enum supports `youtube` / `vimeo` / `rumble`. Player component picks the right embed based on provider. Transcript auto-import: YouTube → `yt-dlp --write-auto-sub` in a scheduled Supabase Edge Function, parse VTT → `sermons.transcript`. Manual override always wins. Scripture refs in `sermon_scripture_refs` render as clickable pop-overs fetching from bible-api.com with version selection. Sermon series + scripture index pages in v1.

### 11.6 Gallery + albums
Supabase Storage public bucket. Admin uploads single or ZIP batch. Watermarking via Sharp: logo overlay, 15% width, 20% opacity, bottom-right. Lightbox with zoom, swipe, download, share. Formats: jpg/jpeg/png/webp/gif, mp4/mov/webm. File validation: magic byte detection + path traversal prevention.

### 11.7 Security
Security headers in `next.config.mjs`: HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. API routes: `Cache-Control: no-store, max-age=0`. Rate limit: in-memory sliding window per IP (60/min admin, 30/min public, 10/min upload). HTML sanitization via `isomorphic-dompurify` for all user-generated HTML. Audit logging to `audit_log` table.

---

## 12. Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Stripe
STRIPE_SECRET_KEY=sk_live_[key]
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_[key]
STRIPE_WEBHOOK_SECRET=whsec_[secret]

# Printful
PRINTFUL_API_KEY=[key]
PRINTFUL_WEBHOOK_SECRET=[secret]

# Site
NEXT_PUBLIC_SITE_URL=https://ydministries.ca

# Deferred — DO NOT SET until Step 9
# RESEND_API_KEY=
# NEWSLETTER_FROM_EMAIL=
```

Set in Cloudflare Pages → Settings → Environment variables. Pull locally with `wrangler pages secret list` + `.env.local`.

---

## 13. Deployment — Cloudflare Pages

- **Platform:** Cloudflare Pages (not Vercel — commercial-use clause on Vercel Hobby blocks donation acceptance).
- **Framework preset:** Next.js.
- **Build command:** `cd site && npm ci && npm run build`.
- **Build output:** `site/.next`.
- **Node version:** 20.x.
- **Auto-deploy:** push to `main` on `github.com/ydministries/<repo>`.
- **Preview deploys:** every PR gets a `*.pages.dev` URL.

### Changelog rule
Every push to GitHub or Cloudflare Pages gets a `CHANGELOG.md` entry:
```
## [YYYY-MM-DD] - <commit hash>
- feat/fix/refactor: <description>
```

---

## 14. Project structure

```
ydm/
├── CLAUDE.md
├── README.md
├── PROJECT.md
├── CHANGELOG.md
├── PLAN.md                              # LOCKED decisions — source of truth
├── YDM_MIGRATION_GUIDE.md              # THIS FILE — how to build it
├── FOM_FEATURES_CHECKLIST.md
├── memory.md
│
├── site/                                # Next.js app (Cloudflare Pages deploy)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/                 # Public pages — codegen'd + styled
│   │   │   ├── admin/                  # AdminShell + BishopShell
│   │   │   ├── api/
│   │   │   │   ├── stripe/{donate,checkout,webhook}/route.ts
│   │   │   │   ├── printful/webhook/route.ts
│   │   │   │   └── admin/...
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── EditableContent.tsx     # zero-fallback
│   │   │   ├── ContentProvider.tsx
│   │   │   ├── EditableRichText.tsx
│   │   │   ├── EditableImage.tsx
│   │   │   ├── EditableList.tsx
│   │   │   ├── EditableLink.tsx
│   │   │   └── admin/
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── content.ts
│   │   │   ├── apiAuth.ts
│   │   │   ├── rateLimit.ts
│   │   │   ├── sanitize.ts
│   │   │   └── fileValidation.ts
│   │   └── eslint-rules/
│   │       └── no-raw-jsx-text.ts      # custom rule (guardrail #1)
│   ├── scripts/
│   │   ├── scrape-to-content-map.ts
│   │   ├── xml-to-domain.ts
│   │   ├── upload-assets.ts
│   │   ├── seed-content.ts
│   │   ├── codegen-pages.ts
│   │   └── validate-content.ts
│   ├── supabase/migrations/
│   │   ├── 001_cms_core.sql            # page_content, assets, content_versions
│   │   ├── 002_profiles_auth.sql       # 2-tier profiles
│   │   ├── 003_domain_tables.sql       # sermons, events, blog, etc.
│   │   ├── 004_shop.sql                # products, orders
│   │   └── 005_rls_policies.sql
│   ├── next.config.mjs
│   ├── tailwind.config.ts              # ydm-* tokens
│   ├── tsconfig.json
│   └── package.json
│
└── archive/                             # read-only
    └── wordpress/
        ├── exports/                    # XML, SQL, theme, uploads
        └── scrape/                     # pages.json, content-map.json, fonts, colors, nav
```

---

## 15. Quality gates

### Pre-page (before building ANY page)
- [ ] Row set exists in `page_content` for this `page_key`
- [ ] Admin content editor shows all fields for this page
- [ ] Skeleton was generated by `codegen-pages.ts` (never hand-written)

### Post-page
- [ ] Zero JSX text literals > 3 chars in the component (grep + ESLint)
- [ ] Inline editing works for admin/bishop on the public page
- [ ] `validate-content` passes for this page
- [ ] Round-trip test passes
- [ ] `PROJECT.md` updated

### Pre-deploy
- [ ] All pages have DB content (zero `[MISSING: ...]`)
- [ ] Admin panel covers every public page
- [ ] RLS policies enabled on every table
- [ ] Environment variables set in Cloudflare Pages
- [ ] Security headers active
- [ ] Rate limits configured on API routes
- [ ] 301 redirects for every URL in `archive/wordpress/scrape/site-map.json`

---

## 16. NEVER-do list

| Anti-pattern | Why it's bad | Do instead |
|---|---|---|
| `<EditableContent>Hardcoded text</EditableContent>` | Copy in code, DB empty | `<EditableContent fieldKey="..." />` — DB or nothing |
| Build a page before seeding its content | Admin shows empty pages | Run `seed-content.ts` first, verify rows |
| Hand-write `app/(site)/**/page.tsx` | Opens the door to literal strings | Run `codegen-pages.ts` → style only |
| Add a `fallback`, `defaultValue`, `children`, or `placeholder` prop | Reintroduces FOM's failure mode | Refuse at the TypeScript interface level |
| Hardcode the admin page list | New pages won't auto-appear | Query the `pages`/`page_content` tables |
| Ship a public page without its admin editor | Admins can't edit content | Build both in the same session |
| Read content from `contentRef.current.innerHTML` | Reads rendered DOM, not DB | Read/write through `page_content` |
| Check `app_metadata.role` in RLS | JWT drifts out of sync | Check `profiles.role` column |
| `.single()` on content queries | Throws on 0 rows | `.select()` + handle empty array |
| Deploy to Vercel | Hobby tier forbids commercial use (donations) | Cloudflare Pages |
| Scaffold Resend / Email Routing before Step 9 | Email is deferred | Leave email config empty until the site is built |
| Install WooCommerce / Elementor / GiveWP plugins | This is a greenfield Next.js site | Custom Next.js storefront + Stripe + Printful |

---

## Summary — the build order in one glance

```
1. Scrape WordPress → structured JSON (archive/wordpress/scrape/)
2. Generate content-map.json (every string → dotted fieldKey)
3. Create Supabase project, run migrations
4. Run seed scripts (page_content, domain tables, assets)
5. Scaffold Next.js 16 + install dependencies
6. Build core primitives: ContentProvider, EditableContent (+ variants), validate-content
7. Ship guardrails: ESLint rule, CI gate, build gate, pre-commit hook
8. Run codegen-pages.ts → skeleton page.tsx files for every route
9. Build admin CMS (AdminShell + BishopShell)
10. Style each page, per the 6-step workflow
11. Build domain admin (sermons, events, blog, testimonials, Printful sync)
12. Wire Stripe donations + Printful shop
13. Step 9 (email): Resend, contact form routing, newsletter
14. Deploy to Cloudflare Pages, DNS cutover, 301 redirects
15. 7-day monitoring
```

**The golden rule: if it's text on the screen, it's a row in the database — and the page file has no way to say otherwise.**
