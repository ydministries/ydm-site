# Step 2 Handoff — Schema, Seed, Scaffold

**Status:** Step 1 (content-map) complete. Pass 1a + Pass 1b merged into `archive/wordpress/scrape/content-map.json` (715 fields across 17 namespaces).

**Your goal on this page:** spin up Supabase, run the migrations + seed, create the GitHub org, then hand the first prompt to Claude Code in VS Code.

Everything below is manual until the "Claude Code prompt" section. Don't rush — each step has a gate before the next one unlocks.

---

## 1. Create the Supabase project

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) — sign in as **`yeshuawebmaster@gmail.com`** (the account-owner identity, per PLAN §8.1).
2. Click **New Project**.
3. Fill in:
   - **Name:** `ydm-prod`
   - **Database password:** generate a strong one, save to Bitwarden (`YDM / Supabase DB`)
   - **Region:** `East US (North Virginia)` → `us-east-1`
   - **Pricing plan:** Free
4. Wait for provisioning (~2 min).
5. Once the dashboard loads, go to **Project Settings → API** and copy these three values to Bitwarden under `YDM / Supabase API`:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (the one labeled *anon / public*)
   - **service_role** key (the one labeled *service_role*, marked `secret`)

**Gate:** you have 3 strings in Bitwarden before moving on.

---

## 2. Run the migrations

Supabase dashboard → **SQL Editor** → **+ New query**. Run each file in order. **Do not combine them.**

1. [`supabase/migrations/001_cms_core.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/supabase/migrations/001_cms_core.sql) — `page_content`, `assets`, `content_versions` + triggers
2. [`supabase/migrations/002_profiles_auth.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/supabase/migrations/002_profiles_auth.sql) — 2-tier profiles + auth trigger
3. [`supabase/migrations/003_domain_tables.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/supabase/migrations/003_domain_tables.sql) — sermons, events, ministries, campaigns, blog, prayer, testimonials, contact, newsletter, audit log
4. [`supabase/migrations/004_shop.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/supabase/migrations/004_shop.sql) — products, variants, orders, donations
5. [`supabase/migrations/005_rls_policies.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/supabase/migrations/005_rls_policies.sql) — Row-Level Security for everything

**For each:** open the file, copy all, paste into SQL Editor, click **Run**. You should see "Success. No rows returned". If any file errors, stop — screenshot the error and send it to me before running anything else.

**Gate:** Supabase → **Table Editor** shows ~22 tables under `public`. `page_content` has 0 rows.

---

## 3. Run the seed

Still in SQL Editor, **+ New query**:

- [`archive/wordpress/scrape/seed-page-content.sql`](computer:///Users/mikeymusiq/Documents/Claude/Projects/YDM/archive/wordpress/scrape/seed-page-content.sql) — 715 rows of page content from the WordPress scrape

This file is big (~110 KB). Paste all, click **Run**. Should finish in a few seconds.

**Gate:** `select count(*) from page_content;` returns **715**. Spot-check:
```sql
select page_key, field_key, value
from page_content
where page_key = 'home' and field_key like 'hero.%'
order by field_key;
```
You should see `hero.title = "Ministries"` (the typo-fixed one) and related hero keys.

---

## 4. Promote yourself to admin

The 2-tier roles default new users to `bishop`. You need `admin` for full CMS access.

**First, sign up** — we'll do this properly later through the site's login page. For now, create a dummy entry so you're ready:

1. Supabase → **Authentication → Users** → **+ Add user** → **Create new user**.
2. Email: `yeshuawebmaster@gmail.com`, password: anything (you'll reset later).
3. Supabase → **SQL Editor**:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'yeshuawebmaster@gmail.com';
   ```

**Gate:** `select email, role from profiles;` shows your email with `role = 'admin'`.

---

## 5. Create the GitHub org + repo

1. [github.com/organizations/new](https://github.com/organizations/new) — create **`ydministries`** (free plan). Owner = `yeshuawebmaster@gmail.com`.
2. In the new org → **New repository**:
   - **Name:** `ydm-site`
   - **Visibility:** Private
   - **Initialize:** leave unchecked (no README/.gitignore — Claude Code will scaffold)
3. Copy the repo URL (`git@github.com:ydministries/ydm-site.git`).

**Gate:** empty repo exists, URL in clipboard.

---

## 6. Open VS Code + clone the repo

```bash
cd ~/YDM              # or wherever you want the project folder
git clone git@github.com:ydministries/ydm-site.git
cd ydm-site
code .                # opens VS Code here
```

**Gate:** VS Code is open on an empty folder named `ydm-site`.

---

## 7. First Claude Code prompt — scaffold Next.js + primitives

Open Claude Code in VS Code (`⌘+Esc` to open, or run `claude` in the integrated terminal).

**Paste this prompt verbatim.** It's self-contained — Claude Code will ask for clarifications if needed, but should just run.

````
You are building the YDM (Yeshua Deliverance Ministries) website — a WordPress → Next.js migration. The architectural source of truth lives at `../YDM/PLAN.md` and `../YDM/YDM_MIGRATION_GUIDE.md` (locked decisions + build recipe). Read both before writing code.

Current project state: empty repo. Your job is to scaffold the Next.js 16 app and build the core CMS primitives. No page components yet — those come later via codegen.

**Phase 1 — Scaffold**

Initialize a Next.js 16 project with TypeScript + Tailwind + App Router in this directory:
```
npx create-next-app@16.2.2 site --typescript --tailwind --app --no-src-dir=false --import-alias "@/*"
```
Move into `site/` for everything that follows.

Install exact dependency versions from `../YDM/YDM_MIGRATION_GUIDE.md §4`. Do NOT install Resend yet — email is deferred.

**Phase 2 — Supabase clients**

Create `site/src/lib/supabase.ts` with three factory functions:
- `createBrowserClient()` — uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `createServerClient()` — uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` + cookies from `next/headers`
- `createServiceRoleClient()` — uses `SUPABASE_SERVICE_ROLE_KEY`, server-only

Create `site/.env.local.example` with all the variables from `../YDM/YDM_MIGRATION_GUIDE.md §12` (leave RESEND_* commented out).

**Phase 3 — Tailwind brand tokens**

Edit `site/tailwind.config.ts` to add the ydm-* tokens from `../YDM/PLAN.md §8.3`:
- `ydm-gold: #D38605`
- `ydm-cream: #F8F1E6`
- `ydm-ink: #1A0F00`
- `ydm-off: #FDFDFD`

Add font families:
- `font-display`: Bebas Neue (load via next/font/google)
- `font-body`: Barlow (load via next/font/google)

**Phase 4 — The core CMS primitives (zero-fallback)**

Create these components. Every one must be implemented such that TypeScript refuses to compile if someone tries to pass `children`, `fallback`, `defaultValue`, or `placeholder`:

1. `site/src/components/ContentProvider.tsx` — React context holding a `Map<field_key, PageContentRow>` for one page. Props: `{ pageKey: string, content: PageContentRow[] }` where `PageContentRow = { field_key: string, value: string, value_type: string }`.

2. `site/src/components/EditableContent.tsx` — Props: `{ fieldKey: string; as?: keyof JSX.IntrinsicElements; className?: string }`. Reads from `ContentProvider` context. Renders the `as` tag with the content text. If the key is missing: renders `[MISSING: <fieldKey>]` in development (wrapped in `<mark>` for visibility), empty string in production.

3. `site/src/components/EditableRichText.tsx` — Same as EditableContent but sanitizes + renders HTML via `isomorphic-dompurify`.

4. `site/src/components/EditableImage.tsx` — Props: `{ assetKey: string; className?: string; fill?: boolean; priority?: boolean }`. Reads from a parallel `AssetProvider` context. Renders Next.js `<Image>` from `assets.storage_path` + `alt`. Missing key → `[MISSING ASSET: <assetKey>]` in dev, nothing in prod.

5. `site/src/components/EditableLink.tsx` — Props: `{ labelKey: string; hrefKey: string; className?: string }`. Reads both keys from context. Missing → dev placeholder.

6. `site/src/components/EditableList.tsx` — Props: `{ itemPrefix: string; render: (item: PageContentRow[]) => ReactNode }`. Walks the current page's content, groups field_keys matching `<itemPrefix>.<n>.*`, passes each group to `render`.

**Phase 5 — Server-side content fetching**

Create `site/src/lib/content.ts`:
```ts
export async function fetchPageContent(pageKey: string): Promise<PageContentRow[]>
export async function fetchAssets(prefix?: string): Promise<AssetRow[]>
```
Both use `createServerClient()` (cookies-aware) and order by `field_key`.

**Phase 6 — Validator**

Create `site/scripts/validate-content.ts` — a Node script that:
1. Walks `site/src/app/(site)/**/*.tsx`
2. Uses TypeScript's AST to find every `<EditableContent fieldKey="..." />` and variants
3. Queries Supabase for all page_content rows
4. Reports: missing fieldKeys (in code but not DB), orphan DB rows (in DB but not code).
5. Exits 1 if any missing.

Wire it to `package.json` as `"validate:content": "tsx scripts/validate-content.ts"`.

**Phase 7 — ESLint no-raw-jsx-text rule**

Create `site/src/eslint-rules/no-raw-jsx-text.ts` — a custom ESLint rule that fails on any JSX text literal > 3 chars inside `src/app/(site)/**`. Exception: literals whose parent element has a `data-copy-ok` attribute (for tiny UI affordances).

Wire it into `site/eslint.config.mjs`.

**Phase 8 — Deliverables report**

When done, print:
- `site/package.json` dependencies (confirm versions match the guide)
- Tree of `site/src/` (up to 2 levels)
- Result of running `npm run validate:content` (should pass on empty project — no pages yet)
- Anything that needed a deviation from the guide, with rationale

**DO NOT build any public pages yet.** Pages come in Phase 2 via `codegen-pages.ts` which we'll prompt separately after these primitives are verified.

**DO NOT** install or configure Resend, Cloudflare Email Routing, or any email infrastructure. Email is deferred per memory.

**Report back** when all 8 phases are complete with the deliverables report. Do not move on to page codegen until I confirm.
````

**Gate:** Claude Code reports all 8 phases complete, `npm run validate:content` passes on the empty project, and the file tree matches §14 of the migration guide.

---

## 8. What comes after this prompt

Once Phase 1 scaffolding is done and you report back:

- **Prompt 2** — Port `extract_pass_1b.py` + `generate_seed_sql.py` to TypeScript at `site/scripts/`, wire `npm run seed`. This is a convenience — the SQL we already generated is all you need for the first seed.
- **Prompt 3** — Build `codegen-pages.ts`. It reads `content-map.json` and emits skeleton `page.tsx` for every `page_key`.
- **Prompt 4** — Run the codegen. Now you have empty-styled pages that render DB content.
- **Prompt 5** — Build the admin panel (AdminShell + BishopShell + page content editor with live preview).
- **Prompt 6** — First styled page (home). This is your first creative pass.
- **Prompt 7+** — Page by page.

I'll write each prompt as you finish the previous one. Don't skip ahead — each gate catches real problems cheaply.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Migration 001 errors on `auth.users` | RLS on auth schema, or wrong database | You're in the right project? Service-role key being used? |
| Seed says `0 rows affected` | Unique conflict with existing rows | OK if you re-ran. Re-check with `select count(*) from page_content;` |
| `is_staff is not found` in 005 | 005 ran before 001/002 finished | Re-run 005. |
| Claude Code CLI hangs on `create-next-app` | Node version | Need Node ≥ 20.x. `node --version` to check. |
| `next@16.2.2` not found | Version cadence | If exact version errors, fall back to latest 16.x minor. Flag it in the deliverables report. |

---

**Ping me when you hit either (a) Gate at the end of §4 (admin role set), or (b) Gate at the end of §7 (Claude Code reports back).** Anything else, just keep going.
