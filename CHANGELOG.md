# YDM Changelog

All notable changes to this project will be documented in this file.
Every push to GitHub or Vercel must be recorded here.

---

## [2026-05-07] - <commit-hash>

### Phase ZZ — Lighthouse-driven a11y + perf fixes
Targets identified by Mikey's PageSpeed Insights run on the home page (2026-05-07). Fixes scoped to the home page only — the same patterns recur on other templates and may need follow-up sweeps if Bishop runs Lighthouse there.

**Color contrast (audit Accessibility 96 → ~100):**
- New token `--color-ydm-gold-dark: #8C5A04` in `globals.css` `@theme` block. Contrast ratios verified before commit: **5.23:1 on `ydm-cream`**, **5.87:1 on `ydm-surface`** — both clear WCAG AA (≥4.5:1) for normal text.
- Swapped `text-ydm-gold` → `text-ydm-gold-dark` on 5 informational eyebrow labels rendering on cream/white backgrounds in `HomeTemplate.tsx` (founded-in-faith, leaders, leaders-card-role, get-involved, InvolveCard "Learn more" arrow).
- Eyebrows on dark backgrounds (hero, ministries carousel, sermons carousel, support overlay) deliberately left as `text-ydm-gold` — already pass at ~5.77:1.
- Header nav links (`SiteHeader.tsx`): `text-ydm-muted` → `text-ydm-ink` (13.4:1). Hover state: `text-ydm-gold-dark` (preserves accent on hover, AA-compliant).
- "Watch Live" pill (`SiteHeader.tsx`): `text-ydm-gold` → `text-ydm-ink`. Gold border preserved.
- InvolveCard body + event-card meta (`HomeTemplate.tsx`): `text-ydm-muted` → `text-ydm-text` (13.8:1).
- Added `aria-hidden="true"` to all 11 `font-script` decorative flourishes ("Join Us", "You belong here", "Get Plugged In", "Hear the Word", "Come as you are", "Be the light", "Leading with Love", "We're here for you!", "Make a difference", "Stay connected", and the mission-vision script). These are pure decoration; surrounding `<h1>`/`<h2>` carries the semantic meaning. WCAG 1.4.3 exempts incidental decoration; aria-hidden tells Lighthouse to skip them in contrast scoring.

**Performance (audit LCP):**
- Added `fetchPriority="high"` to home hero `<Image>` in `HomeTemplate.tsx`. Verified rendered HTML now has `fetchPriority="high"` on both the `<img>` element AND the `<link rel="preload">` Next.js emits for the LCP. Targets ~720ms resource-load-delay reduction per PageSpeed.

**Logo sizing (audit ~14 KiB savings):**
- Added explicit `sizes="48px"` (header) and `sizes="72px"` (welcome band) on the YDM logo `<Image>` instances. Tells Next.js's responsive image generator to pick the smallest matching variant for high-DPR viewports. The source PNG is still 300×300 — flagged as Tech debt for a one-time re-export to ~144×144 master (deeper saving).

**Best Practices (audit identical-link-text):**
- Added `aria-label={\`View details for ${e.title}\`}` to the events-grid "View Details" buttons in `HomeTemplate.tsx`. Screen readers now hear distinct accessible names per event ("View details for Weekly Bible Study Group" vs "View details for Young Adults Connect").

Out of scope (deferred):
- Sweep of the same patterns across other templates (Lighthouse run was home-only; sweep when Bishop runs other pages).
- PNG re-export of `/brand/ydm-logo.png` from 300×300 → 144×144 (binary asset edit; tracked).
- Tier-3 unused-JS / polyfill reduction (deeper profiling).

---

## [2026-05-07] - <commit-hash>

### Phase YY — Sermon video embed + audio URL migration
- Added structured `video_url` field to all 6 sermon page_keys (initially empty). Bishop pastes a YouTube URL via `/admin/content/sermons.<slug>` and the sermon page renders a privacy-enhanced (youtube-nocookie.com) iframe above the audio player. Empty / non-YouTube / garbage values render nothing — graceful fallback verified across 10 edge-case URL shapes.
- Migrated `audio_filename` → `audio_url` field per sermon. Sermons now store the FULL public URL directly instead of bare filenames. The `sermonAudioUrl()` helper in `lib/sermons.ts` is removed (no consumers remained after the template change).
- Util: `extractYouTubeId()` + `youtubeEmbedUrl()` in `src/lib/youtube.ts`. Verified extraction for `watch?v=`, `youtu.be/`, `youtu.be/?si=`, `embed/`, `shorts/`, `m.youtube.com/watch?v=`, and `watch?v=…&t=…` shapes; returns `null` for non-YouTube and garbage inputs.
- Sermon page layout (top to bottom): hero → **video embed (when set)** → audio player (when set) → body (sermon notes) → scripture cards → related sermons → share → back link.
- Bishop's workflow for new sermons: upload MP3 to R2 via existing tooling (Cloudflare dashboard or rclone), then paste the audio URL and YouTube URL into `/admin/content/sermons.<slug>`. No admin-side MP3 upload UI was added (deliberately scoped out — Mikey continues to manage R2 uploads).
- Migration shipped as a two-file zero-downtime split:
  - `20260507171944_sermons_video_and_audio_urls.sql` — additive only (INSERT 6 video_url + 6 audio_url; leaves audio_filename in place).
  - `20260507172549_drop_sermon_audio_filename.sql` — DELETE-only follow-up to be applied after the deploy verifies live audio.
- NOTE: migration 2 was applied alongside migration 1 in a single SQL Editor session, collapsing the intended two-step zero-downtime pattern into a single cutover. Pre-launch state (no public traffic) made this functionally a no-op. The two-migration pattern still holds as the standard for future cutovers — sequence matters when real visitors are involved.
- Sanitize.ts iframe decision documented (audit Warning #13 closed via decision: structured `video_url` field replaces the need for allowlist widening; `<iframe>` stays out of the user-supplied-HTML allowlist; documented in the file's header comment block).

---

## [2026-05-07] - <commit-hash>

### Phase XX — Documentation drift cleanup
Closes audit Warnings #19 and #20.

**Surgical fixes (7):**
- `README.md` — tech stack table:
  - Tailwind row: `Tailwind CSS 3.4 with custom YDM tokens` → `Tailwind CSS v4 (no tailwind.config.ts; brand tokens in @theme block in src/app/globals.css)`.
  - Removed phantom `Rich Text | TipTap 3.22.x` row (TipTap not in package.json or src/).
  - Replaced phantom `Sharp + yet-another-react-lightbox` row with `Cloudflare R2 + next/image` (the actual image story).
  - Added Printful row (Phase LL was missing from this table).
- `PROJECT.md` — status + stack one-liner:
  - "11 feature phases shipped 2026-05-05/06" → "22+ phases shipped through 2026-05-07 (Phase WW — audit fix sequence)" with cross-reference to CHANGELOG.
  - Removed TipTap from Stack list, added Printful + Cloudflare R2, Tailwind → v4.
- `HANDOVER.md` — public-routes + redirect count:
  - Removed `/guestbook` row from the public-routes table (Phase WW removed the codegen artifact; it's now a redirect entry, not a route).
  - "Plus 65+ legacy WordPress URL redirects" → "Plus 54 legacy WordPress URL redirects" (audit Warning #20; 65 was the site-map.json raw count, 54 is the active count after trailing-slash strip + Phase JJ guestbook addition).

**Structural updates (5):**
- `PROJECT.md` Database Tables — replaced ~30-line list of fictional tables (`pages`, `page_sections`, `team_members`, `posts`, `gallery_items`, `guestbook_entries`, etc.) with the actual 10-table list (page_content, assets, content_versions, profiles, form_submissions, newsletter_subscribers, testimonials, donations, orders, order_items).
- `PROJECT.md` — deleted three empty TODO placeholder sections (Public Pages, Admin Pages, API Routes). HANDOVER.md carries the real route inventory.
- `PROJECT.md` — deleted Session Log section (CHANGELOG is the canonical phase-by-phase history; Session Log was a parallel source of truth that stopped at handover).
- `HANDOVER.md` "Today's deliverables" header — added "(through handover, 2026-05-05/06)" qualifier and a one-line pointer: "For phases shipped after handover (MM onward, audit fix sequence), see CHANGELOG.md." Original phase table preserved as the handover snapshot.
- `HANDOVER.md` Outstanding setup work — removed two Stripe items duplicated by the Known issues subsection's 5-step runbook (added in Phase PP). Updated alt-text item to reflect Phase TT's partial seed and the 44 orphan rows tracked separately.

`CLAUDE.md` reviewed in Phase A and confirmed clean — no edits.

---

## [2026-05-07] - <commit-hash>

### Phase WW — Dead code purge
- Deleted unused helper components (deprecated since Phase Y, zero references in `src/`):
  - `src/components/templates/_helpers/ContactForm.tsx`
  - `src/components/templates/_helpers/MailtoForm.tsx`
- Removed the `/guestbook` codegen stack: `src/app/(site)/guestbook/page.tsx`, `src/components/templates/GuestbookTemplate.tsx`, and the `guestbook:` entry in `templateRegistry.byKey`. The `/guestbook → /testimonials` 308 redirect in `next.config.ts` (Phase JJ) is unchanged and continues to serve.
- Added `REDIRECT_ONLY_KEYS = new Set(["guestbook"])` to `scripts/codegen-pages.ts` with an early-skip in the main loop, mirroring the Phase Z `index_filter` skip pattern. Future codegen re-runs will not regenerate the guestbook page.tsx. Chosen over adding to `templateRegistry.redirectKeys` because next.config.ts already owns the redirect — duplicating it would create the same anti-pattern flagged in tracker for `team.bishopwilson`.
- Verified production build no longer emits a `/guestbook` route or any `*guestbook*` chunk in `.next/server/`. `/testimonials` continues to render with `<h1>Testimonies</h1>`. 5 control routes (`/`, `/about`, `/sermons`, `/shop`, `/ministries/family`) all return 200.
- Closes audit Warning #12.

---

## [2026-05-07] - <commit-hash>

### Phase VV — Repo hygiene
- **#16** — Renamed `src/middleware.ts` → `src/proxy.ts`, function name `middleware` → `proxy`, log prefix `[middleware]` → `[proxy]`. JSDoc reference in `lib/supabase/middleware.ts` updated to point at the new path. Next.js 16 deprecation warning gone at dev startup.
- **#17** — Migrated `fast-xml-parser` (used by `site/scripts/import-from-xml.ts`) from root `/package.json` to `site/package.json` devDependencies. Deleted root `/package.json`, `/package-lock.json`, and `/node_modules/`. "Detected additional lockfiles" warning gone at dev startup.
- **#18** — Rewrote `site/eslint.config.mjs` to load `@next/eslint-plugin-next` and `eslint-plugin-react-hooks` directly (transitive deps from `eslint-config-next` 16.2.2). FlatCompat path failed on a circular-JSON crash in the React plugin chain; direct plugin imports work. Lint now actually enforces the rules referenced in `// eslint-disable-next-line` comments throughout the codebase.
- **#40** — Added `*.tsbuildinfo`, `**/.temp/`, `site/scripts/_audit-*.ts`, and `printful/` (Bishop's local design-asset working dir) to root `.gitignore`. `git rm --cached` on `site/tsconfig.tsbuildinfo` and `supabase/.temp/cli-latest` so the new patterns actually clean up the working-tree noise.
- Inline lint fixes (4 issues, within ≤5 budget once rules actually run):
  - Removed unused `Image` import from `site/src/app/(site)/shop/page.tsx`.
  - Renamed unused `kind` destructure to `_kind` in `site/src/app/admin/orders/page.tsx:186` (matches `argsIgnorePattern: "^_"`).
  - Moved misplaced `// eslint-disable-next-line @next/next/no-img-element` comment in `EditableImage.tsx` from above `return (` to immediately above the `<img>` element it intends to suppress.
  - Added `// eslint-disable-next-line react-hooks/set-state-in-effect` with justification comment on `ProductView.tsx:81` — gallery↔variant sync is intentional in-effect setState.
  - The `'onBuy' is defined but never used` warning on `ProductView.tsx:106` is intentionally preserved — Phase TT comment block explains it's dead code while `SHOP_CHECKOUT_ENABLED=false`.
- Closes audit Warnings #16, #17, #18, #40.

---

## [2026-05-07] - <commit-hash>

### Phase UU — Site URL centralization closeout
- Replaced hardcoded `https://ydministries.ca` with `NEXT_PUBLIC_SITE_URL` fallback in:
  - `src/app/api/testimonials/submit/route.ts` — admin URL inside the bishop-notification email template (1 occurrence).
  - `src/app/api/newsletter/unsubscribe/[token]/route.ts` — return-to-site links inside the unsubscribe confirmation HTML (2 occurrences).
- Module-level `const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca"` matches the convention from the 6 already-converted files. The visible "Return to ydministries.ca" link text is intentionally unchanged — that's brand copy, not a URL.
- Closes audit Warning #15 fully (Phase RR closed sitemap.ts + robots.ts; this closes the remaining 2 files).

---

## [2026-05-06] - <commit-hash>

### Phase TT — LCP hero alt + asset alt-text seed
- Audit Warning #10 (no eager/priority hint on LCP image) investigated and confirmed **pre-resolved**. Next.js 16 emits `<link rel="preload" as="image" imageSrcSet="...">` in `<head>` for every priority-flagged hero across 12 templates — modern LCP optimization. The audit's grep targeted `loading="eager"` on `<img>` and missed the preload mechanism. No code change shipped for #10.
- Audit Warning #9 (assets.alt all NULL) — partial fix:
  - Hardcoded `alt="Hands raised in worship"` on the home LCP hero `<Image>` in `HomeTemplate.tsx:226` (was `alt=""`). Brand-static `/brand/hero-worship.jpeg` is the actual LCP, not in the assets table.
  - Migration `20260507034815_seed_asset_alt_text.sql` updates 5 rows in `assets`:
    - `home.image.01.alt` → `"Hands raised in prayer"` (forward-looking metadata; renders only when `InvolveCard` is later refactored to read alt from assets — see Tech debt).
    - `home.image.02-04.alt` → `""` (decorative within InvolveCard heading context per WCAG decorative-in-described-context).
    - `admin.<uuid>.<timestamp>.alt` → `""` (intentionally blank vs not yet set, distinguishes in /admin/assets editor).
  - 14 gallery rows confirmed already correctly `""` (decorative photo grid). No change.
  - 44 orphan asset rows skipped — they don't render today; tracked for a future asset-cleanup pass analogous to Phase QQ.
- Bishop refines all alt during copy pass via /admin/assets.

---

## [2026-05-06] - <commit-hash>

### Phase SS — meta.description seed + stale meta.title fixes
- Closes audit Warning #6 (parts of) — seeded 42 meta.description rows in page_content for pages that previously fell back to the global default. Sources verified Phase A:
  - 3 from existing seo.description rows (home, about, contact) — promoted to meta.description.
  - 7 from existing tagline rows (each ministries.* page).
  - 16 from existing excerpt rows (sermons, blog, events, give campaigns) minus 3 overrides.
  - 3 from existing person_bio rows (HTML-stripped + sentence-truncated; team pages).
  - 13 hand-templated for index/landing pages (gallery, give, ministries, sermons, blog, events, team, live, locations) plus 3 overrides for excerpts that pulled garbage (sermons.gilgal misattribution, sermons.here-am-i venue/date prefix, give.techfund WP-demo residue).
- Closes audit Warnings #7 and #8 — 3 stale meta.title fixes:
  - blog.index "Blog Page" → "Blog"
  - events.index "Events Page" → "Events"
  - events.young-adults-connect "Yeshua Sunday Service" → "Young Adults Connect" (slug/title mismatch)
- Page-keys with explicit meta.description: 4 → 46. Verified on production HTML for 16 sampled pages — all render new descriptions; no global-fallback leak.
- 7 routes intentionally not touched: /ask + /prayer (already had DB rows) and /shop, /shop/success, /give/thanks, /sermons/scripture, /testimonials (export metadata.description from page.tsx).
- /shop/<slug> product pages still use the global fallback — should pull from Printful product description in /shop/[slug]/page.tsx generateMetadata. Tracked in copy-pass-tracker.md Tech debt.
- First-pass copy may not match Bishop's preferred voice — copy pass refines via /admin/content/<page>/meta.description. 3 sub-100-char blog excerpts and 7 short ministry taglines flagged for SEO expansion in copy-pass-tracker.md Open items.

---

## [2026-05-06] - <commit-hash>

### Phase RR — Sitemap regen from live routes + robots URL env var
- `src/app/sitemap.ts` now derives URLs from a hardcoded STATIC_ROUTES list inside the file (49 entries) plus a runtime expansion of `/shop/[slug]` from Printful's catalog. The previous source — `archive/wordpress/scrape/route-map.json` — was frozen pre-launch and missed every post-codegen hand-authored route.
- Added 9 URLs that were live since Phases II–LL but missing from the sitemap: `/testimonials` (Phase JJ), `/sermons/scripture` (Phase II), `/shop` + `/shop/success` + 4 Printful product pages (Phase LL), `/give/thanks` (Phase KK).
- Removed 2 URLs that were 308-redirect sources: `/guestbook` (→ /testimonials) and `/team/bishopwilson` (→ /team/bishop-huel-wilson).
- Net: 46 → 53 URLs.
- `revalidate = 3600` so new Printful products surface in the sitemap within an hour without redeploy. Listing call wrapped in try/catch — sitemap still ships every static route if Printful is unreachable.
- Build/dev-time drift check (~20 lines at file bottom) walks `src/app/(site)/**/page.tsx` and warns if any page.tsx route is missing from STATIC_ROUTES. Silently no-ops on Vercel runtime where the source tree isn't bundled.
- `src/app/sitemap.ts` and `src/app/robots.ts` now read `NEXT_PUBLIC_SITE_URL` (with hardcoded fallback) instead of hardcoding the URL. Audit warning #15 partially closed; two remaining files (`api/testimonials/submit/route.ts`, `api/newsletter/unsubscribe/[token]/route.ts`) still hardcode and are deferred to a Group C consolidation.

---

## [2026-05-06] - <commit-hash>

### Phase QQ — DB cleanup: stale page_keys + ministry orphan fields
- Deleted 36 rows for decommissioned Phase Z filter routes (blog.cat.*, blog.tag.*, blog.author.ydm-admin, events.cat.*, sermons.cat.*, team.cat.*). Pages were removed in Phase Z but DB rows lingered.
- Deleted 130 orphan field_key rows on ministries.* pages that weren't read by the ministry template (h3.0N, p.01–p.08, image.0N + .alt + .url variants, slug, date_published, h1.01). Public-facing rendering byte-identical to post-Phase-OO baseline; admin editor /content list is now cleaner for the upcoming copy pass.
- Keep-list verified against MinistryTemplate.tsx + lib/ministries.ts: body_html, meta.title, hero_image, tagline, leader_name, leader_role, leader_bio (plus four future-proof entries that don't exist on ministries.* today).
- Pre-deletion snapshot saved to /tmp/ydm-prompt3/pre-cleanup-snapshot.json (untracked, available for manual rollback if needed).

---

## [2026-05-06] - <commit-hash>

### Phase PP — Shop checkout disabled pending Stripe verification
- /shop/[slug] buy button(s) replaced with a disabled "Currently unavailable" state and explanatory subtext.
- /shop landing banner added: "Our online shop is taking a brief pause while we finalize payment setup."
- /api/shop/checkout returns 503 at handler entry, gated on SHOP_CHECKOUT_ENABLED env var.
- Vercel Production env requires SHOP_CHECKOUT_ENABLED=false manually set; Preview/Dev unaffected.
- Stripe live-mode flip (originally Prompt 2 of audit fix sequence) deferred until Bishop Wilson completes Stripe business verification.

---

## [2026-05-06] - <commit-hash>

### Phase OO — Ministry page H3 fixes + demo footer strip
- Fixed H3 heading on 4 ministry pages where heading text didn't match the page topic: ask-bishop, family, outreach, wordwide.
- Stripped trailing demo footer block (Lake Building / Redding CA address from cmsmasters Faith Connect WP theme) from 6 ministry pages: ask-bishop, family, leadership, outreach, partnership, wordwide.
- leadership and partnership H3s left untouched (topically correct; pattern alignment deferred to copy pass).
- worship page already clean — no change.
- Body paragraphs under each H3 intentionally preserved; full rewrite deferred to Bishop's copy revision pass (see copy-pass-tracker.md).
- Migration applied via Supabase Dashboard SQL Editor; verified clean against rendered DOM on all 7 ministry pages.

---

## [2026-05-06] - 7770411

### Phase NN — Shop UX polish
- feat(NN): product image lightbox — clicking the hero image OR clicking an already-selected color thumb opens a fullscreen overlay with prev/next/Esc keyboard nav, body-scroll lock, click-backdrop-to-close. Lightbox auto-syncs the selected variant when navigating between colors so closing leaves the user on the visual they last viewed.
- feat(NN): variant thumbs grid extended from 4 across to 6 across on desktop (more colors visible without scrolling); small "Tap a color to switch · double-tap or click hero to enlarge" hint added.
- chore(NN): "How it works" step 3 changed `Printful prints and ships directly to you` → `Your item is custom made and ships directly to you` per Mikey's polish pass.
- fix(NN): `lib/printful.ts` filter changed from `!is_ignored` to `synced > 0`. Root cause of "only 4 products showing on /shop" — the `is_ignored` flag was hiding products that legitimately belonged in the catalog. Now we filter only on whether variants are synced (no point showing an empty product).

---

## [2026-05-06] - 9d88ac7

### Phase MM — Handover docs
- docs(MM): `HANDOVER.md` (root) — comprehensive maintainer reference: every public + admin route, env var inventory, bishop's daily task playbook, post-handover setup checklist, troubleshooting, common-failure recipes
- docs(MM): `SMOKE_TEST.md` (root) — pre-handover verification checklist covering public-site walkthrough, admin walkthrough as both roles, email cutover sanity, Stripe + Shop happy paths (when accounts ready), auth flows
- docs(MM): `README.md` — added "Live at ydministries.ca" banner + maintainer pointers to HANDOVER + SMOKE_TEST + CHANGELOG
- docs(MM): `PROJECT.md` — refreshed "setting up" status to "live in production"; replaced stale outstanding-work checklist with operational items only; updated session log with all milestones through 2026-05-06

---

## [2026-05-06] - e11ff45

### Phase LL — Shop (Printful + Stripe)
- feat(LL): `lib/printful.ts` — env-gated wrapper for Printful Sync Products API. `listProducts()` / `getProductBySlug()` / `getProductById()` with Next.js fetch revalidation (5 min). `createPrintfulOrder()` for webhook-triggered fulfillment. Catalog NOT synced to Supabase — fetched at request time.
- feat(LL): `/shop` public catalog (hand-authored). 3-up grid with Printful thumbnails. Graceful empty states for "PRINTFUL_API_KEY unset" and "no products yet" — no broken-shop appearance.
- feat(LL): `/shop/[slug]` product detail page with image gallery (1 hero + 4 thumbs from variant preview files), variant select, and `BuyNow` client island that POSTs to `/api/shop/checkout`.
- feat(LL): `/api/shop/checkout` POST — validates variant against live Printful catalog (don't trust client price), creates Stripe Checkout Session in `mode='payment'` with shipping address collection enabled (CA/US/GB/AU/NZ), phone collection on. Metadata flags `ydm_kind='shop'` so the webhook can branch.
- feat(LL): `/api/stripe/webhook` extended — `checkout.session.completed` now branches on `ydm_kind`. Shop branch: insert into `orders` (status='paid', fulfillment_status='pending'), insert `order_items`, create Printful order via `createPrintfulOrder()`, update `printful_order_id` + fulfillment_status='submitted'. If Printful submission fails, fulfillment_status='submission_failed' and a `notes` field flags the orphan for manual reconcile. Donation branch (recurring) unchanged.
- feat(LL): `/shop/success` post-checkout success page — branded thank-you with link to keep shopping.
- feat(LL): `/admin/orders` admin browser — chronological table with payment status pill + fulfillment status pill. Top-of-page banner alerts admin when there are orphaned-paid orders that failed Printful submission. Bishop sees customer name + email + total + status; admin additionally sees printful_order_id.
- chore(LL): migration `20260506_shop_phase_ll.sql` adds `stripe_payment_intent_id`, `tracking_url`, `printful_recipient` (jsonb), `notes` columns to existing `orders` table from 004_shop scaffold; enables RLS on `orders` + `order_items` with admin/bishop SELECT (INSERT/UPDATE happen via service-role from webhook).
- chore(LL): `next.config.ts` adds Printful CDN hostnames (`files.cdn.printful.com`, `*.cdn.printful.com`, `*.printful.com`) to image remotePatterns.
- chore(LL): public site nav gains "Shop" link between Testimonies and Contact. Admin sidebar gains "Orders" link in both ADMIN_SIDEBAR and BISHOP_SIDEBAR.
- env: requires `PRINTFUL_API_KEY` plus the existing `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Without Printful key: catalog shows "Shop opening soon", routes still build, no errors. Without Stripe keys: BuyNow button hits 503 with a friendly message.
- v1 limitation noted: cart is single-quantity Buy Now (one product per checkout). Multi-item cart is v2.
- v1 limitation noted: Printful orders are created in DRAFT status (Bishop reviews + confirms in Printful dashboard). Auto-confirm can be flipped on later via Printful settings.

---

## [2026-05-06] - 434ce54

### Phase KK — Donations (Interac primary + Stripe recurring)
- feat(KK): completely redesigned `/give` page — two-column layout. LEFT: gold-bordered Interac e-Transfer card (primary path) with copy-paste-ready `donate@ydministries.ca`, 5-step instructions, "auto-deposit enabled" badge, zero-fees framing. RIGHT: Stripe Checkout recurring card with 4 preset tiers ($25/$50/$100/$250 monthly) + custom amount input ($5–$5000 range).
- feat(KK): `lib/stripe.ts` — env-gated `getStripe()` returns null when `STRIPE_SECRET_KEY` is unset; `isStripeConfigured()` + `DONATION_TIERS_CAD` constants. Pinned API version `2024-12-18.acacia`.
- feat(KK): `/api/donate/checkout` POST — creates Stripe Checkout Session in subscription mode with CAD currency, monthly recurring, billing-address collected, metadata propagated to subscription. Returns `{ url }` for client-side redirect.
- feat(KK): `/api/stripe/webhook` POST — verifies signature with `STRIPE_WEBHOOK_SECRET`, raw-body friendly. Handles `checkout.session.completed` (first month), `invoice.paid` (subsequent months, dedupes via `billing_reason='subscription_create'` skip), `invoice.payment_failed` (marks last donation row failed), `customer.subscription.deleted` (logs cancel marker).
- feat(KK): `_helpers/StripeRecurringForm.tsx` client component — preset tier buttons + custom-amount input, honeypot, validates 5–5000 CAD range, redirects to Stripe Checkout URL on submit.
- feat(KK): `/give/thanks` post-Checkout success page — branded "Your monthly partnership has begun" confirmation with sermon CTA. Stripe handles receipt email; we just acknowledge.
- feat(KK): `/admin/donations` browser — chronological ledger of Stripe donations with totals (active monthly partners count + total $ received). Bishop sees donor name + amount + date + status; admin additionally sees stripe_subscription_id. Note: Interac e-Transfer gifts aren't tracked here (they land in the donate@ inbox).
- chore(KK): admin sidebar gains "Donations" link in both ADMIN_SIDEBAR and BISHOP_SIDEBAR.
- chore(KK): migration `20260506_donations_phase_kk.sql` adds `stripe_subscription_id`, `stripe_customer_id`, `method` (with check constraint), `updated_at` columns to existing `donations` table from 004_shop scaffold; adds RLS for admin/bishop SELECT (INSERT/UPDATE happen via service-role from server-side). Additive ALTER — no DROP since the existing schema is mostly correct and table is empty.
- env: requires `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Gracefully degrades when unset — Stripe card shows "Coming soon" placeholder, Interac path stays fully functional.

---

## [2026-05-06] - b6c07f7

### Phase JJ — Curated testimonials (replaces guestbook)
- feat(JJ): `testimonials` Supabase table — name + message + relationship + visitor_email + status (pending/approved/rejected) + is_featured + metadata + created_at/updated_at. RLS: anon INSERT (status=pending only), public SELECT for status=approved, admin/bishop SELECT all + UPDATE + DELETE.
- feat(JJ): `lib/testimonials.ts` — `getApprovedTestimonials()` (featured first, then date desc) and `getAllTestimonialsForAdmin()` (pending oldest-first, approved newest, rejected last).
- feat(JJ): `/testimonials` public page (hand-authored, NOT codegen) — hero, optional featured section with gold-bordered large card, 3-up grid for non-featured, submission form below. Empty state encourages first submission.
- feat(JJ): `_helpers/TestimonialForm.tsx` client component — name + relationship + email (hidden) + message, honeypot, character count, submit/success/error states.
- feat(JJ): `/api/testimonials/submit` POST — honeypot + validate + insert with status='pending' + email-notify bishop with link to moderation queue.
- feat(JJ): `/admin/testimonials` moderation — three sections (Pending review / Live / Rejected) with per-row Approve, Reject, Reopen, Feature/Unfeature, Delete actions. Pending count badge surfaces on bishop landing card.
- feat(JJ): admin landing card "Testimonies" added with `${pending} to review` badge for bishop / `${pending} pending` for admin. Bishop view re-laid-out to lg:grid-cols-3 to fit the 5th card.
- feat(JJ): admin sidebar gains "Testimonies" link in both ADMIN_SIDEBAR (between Messages and Subscribers) and BISHOP_SIDEBAR.
- feat(JJ): public site nav gains "Testimonies" link between Events and Contact.
- chore(JJ): `/guestbook` → `/testimonials` 308 redirect added in next.config (replaces old unmoderated guestbook flow). Existing GuestbookTemplate stays as dead code (codegen will keep regenerating /guestbook/page.tsx; redirect wins; cleanup deferred).

---

## [2026-05-05] - b19c5f6

### Phase II — Sermon series + scripture index
- feat(II): `/sermons/scripture` — public scripture index (NOT in route-map.json; hand-authored, codegen-skipped). Lists every Bible passage referenced across all sermons grouped by book → chapter → verse. Each entry shows the verse text (cached by Phase K), translation, and links to the sermon(s) that mentioned it. Same gold-accent / cream / display-font styling as other site pages.
- feat(II): `lib/scriptureIndex.ts` — `parseRef()` handles `Joshua 4:19-20` / `Matthew 16:18` / `Romans 12` / `1 Corinthians 13:1-3` shapes including leading-number books and common aliases (Psalm/Psalms, Song of Songs/Solomon). `BOOK_ORDER` is the canonical 66-book Protestant ordering used for sorting.
- feat(II): `getScriptureIndex()` aggregates refs across all sermons in one round-trip; same `ref` string from multiple sermons merges into one entry with multiple sermon links. Verse-range overlaps (e.g. `Joshua 4:17-20` vs `Joshua 4:19-20`) stay separate entries by design — preserves what each sermon actually quoted.
- feat(II): `lib/sermons.ts` — `SermonListItem` extends `RecentSermon` with `series` field. `getAllSermons()` now reads optional `series_name` page_content field. New `groupSermonsBySeries()` helper sorts named series alphabetically, standalone sermons last (rendered as "More Sermons" header).
- feat(II): `SermonsIndexTemplate` renders grouped or flat depending on whether any sermon has `series_name` set — fallback is flat view (current UX). When at least one series is assigned, all sermons render in series sections with "Series" eyebrow + series name as the section header.
- feat(II): "Browse by scripture →" link on `/sermons` hero pointing to the new index. Reverse "← Back to all sermons" link on the scripture index hero.
- note: no sermons have `series_name` seeded — bishop opts in via `/admin/content/sermons.<slug>` adding the `series_name` field whenever he wants to group sermons. Until then, the flat view (current UX) keeps rendering. Series feature is dormant-but-ready.

---

## [2026-05-05] - 5c361bb

### Phase HH — /admin/users invite UI
- feat(HH): `/admin/users` page (admin-only — bishop redirects to /admin) listing all editors with role pill + last-sign-in + joined date, plus a separate "Pending invites" section for unconfirmed accounts
- feat(HH): invite form posts to `inviteUserAction` server action — calls `auth.admin.inviteUserByEmail()` with redirectTo `/admin/auth/reset`, then UPDATEs the auto-created profile row to admin if requested (default bishop). Branded YDM-gold invite email arrives via Resend SMTP.
- feat(HH): per-row `RoleSelect` client component auto-submits on change (server action handles the UPDATE), `Revoke` button calls `deleteUserAction` (deletes profile + auth user). Both server-side guards prevent self-demotion / self-deletion.
- feat(HH): `Cancel invite` action on pending invites — uses the same delete path
- feat(HH): 5th branded auth email template `docs/auth-email-templates/invite-user.html` — gold accent, "You're invited" eyebrow, "Set up my account" CTA, deep-links to `/admin/auth/reset?token_hash=...&type=invite`
- feat(HH): `/admin/auth/reset` now handles `type=invite` in addition to `type=recovery` — same UX (set a password) with adapted headline ("Welcome to YDM admin" vs "Set a new password")
- fix(HH): reset page now robust to three landing flows — (1) query-param `?token_hash=…&type=…` from branded templates, (2) URL-hash `#access_token=…&type=…` from default templates / verify-endpoint redirects, (3) existing session. Prior implementation only handled (1) and silently failed (1) when SSR client raced the useEffect. Added explicit hash parsing → `setSession()` for (2), and an `onAuthStateChange` listener with 3s timeout for the race window.
- chore(HH): admin landing's Users card flipped from "Coming soon" → live (links to `/admin/users`); admin sidebar gains a Users entry between Assets and Profile (bishop sidebar unchanged — Users is admin-only)
- ops(HH): requires the `Invite User` template to be pasted into Supabase Dashboard (Auth → Email Templates) with subject `You're invited to manage the YDM website` for the branded email to fire

---

## [2026-05-05] - 9420372

### Phase EE — Resend Auth SMTP + branded auth emails + password reset + signup lockdown
- security(EE): removed public Sign Up tab from /admin/login. The previous tab let anyone create a `bishop`-role profile (via the on_auth_user_created trigger) and gain content-edit access — gap closed at the UI layer.
- security(EE): paired with toggling off "Allow new users to sign up" in Supabase Auth settings (Dashboard) — defense in depth at the API layer too. Direct calls to `auth.signUp()` are now rejected.
- security(EE): /admin/login now only offers Sign In + Forgot password. Footer card directs would-be users to email yeshuawebmaster@gmail.com for invitation. New editors are added by Mikey via Supabase Dashboard → Authentication → Users → Invite User (sends a magic link via the new branded SMTP) or via direct SQL with service-role.
- security(EE): error param surfaced on /admin/login if /admin/auth/callback bounces with a verifyOtp failure — no silent dead-ends.
- feat(EE): `/admin/auth/reset` client page — handles both URL-hash recovery flow (legacy Supabase `#access_token=…&type=recovery`) AND token-hash query flow (`?token_hash=…&type=recovery` from our branded templates), shows a "set new password" form, redirects to /admin on success, friendly error message for expired/used links
- feat(EE): `/admin/auth/callback` route now handles `?token_hash=…&type=signup|magiclink|email_change` via `verifyOtp` in addition to the existing OAuth `?code=…` PKCE flow — branded YDM email templates can now use the canonical callback for everything except recovery (which deep-links to /admin/auth/reset)
- feat(EE): 4 branded auth email templates saved to `docs/auth-email-templates/` (confirm-signup, magic-link, reset-password, change-email) — gold accent rule, cream bg, "YESHUA DELIVERANCE MINISTRIES" heading, matches newsletter welcome email styling. Templates are version-controlled here as source of truth; live copies live in Supabase Dashboard → Authentication → Emails.
- feat(EE): templates use `{{ .SiteURL }}/admin/auth/{callback,reset}?token_hash={{ .TokenHash }}&type=…` instead of `{{ .ConfirmationURL }}` so deep-links work without needing Site URL changes — recovery goes straight to the password form, signup confirmation lands on /admin
- chore(EE): /admin/login forgot-password handler now redirects to `/admin/auth/reset` (was `/admin/login` which silently dropped the recovery hash)
- ops(EE): Resend wired as Supabase Auth SMTP provider via Dashboard → Auth → SMTP Settings (host: smtp.resend.com, port 465, user: `resend`, password: existing RESEND_API_KEY, sender: noreply@ydministries.ca). Fixes silent-drop / 4-emails-per-hour bottleneck on Supabase's default SMTP that prevented bishop signup confirmation from arriving.

---

## [2026-05-05] - efefd88

### Phase DD — Bishop Mode dashboard
- feat(DD): role-aware admin landing — bishop sees 4 plain-language cards (Edit pages / Messages / Newsletter / Photos) with friendly framing + a "click pencil to edit live" tip card; admin keeps the technical 6-card view including Profile + Users (soon)
- feat(DD): role-aware sidebar — bishop labels (Home / Edit pages / Messages / Newsletter / Photos / My account) vs admin labels (Dashboard / Content / Messages / Subscribers / Assets / Profile)
- feat(DD): `/admin/messages` — server-rendered form_submissions browser, filter chips by type (contact / prayer / ask / guestbook) with live counts, message-card list with name + email + category + truncated body, mailto reply button, admin-only failed-send badge + error-string surface
- feat(DD): `/admin/subscribers` — newsletter_subscribers browser, filter chips (active / unsubscribed / all), table with email + status pill + source (admin only) + signup date + per-row Remove/Re-add buttons (server actions); CSV export route at `/admin/subscribers/export?status=...`
- feat(DD): `getCurrentProfile()` non-throwing helper in `lib/apiAuth.ts` (sibling to `requireAdmin`/`requireBishop`) — for layouts/landing that branch on role rather than gate on it
- chore(DD): server actions return Promise&lt;void&gt; per React form-action contract; revalidatePath on the subscribers list refreshes the table after Remove/Re-add

---

## [2026-05-05] - b910970

### Phase CC — Newsletter signup
- feat(CC): `newsletter_subscribers` Supabase table — email (unique), status (subscribed/unsubscribed/bounced), source, unsubscribe_token (uuid default), resend_contact_id, resend_audience_id, metadata jsonb. RLS: anon INSERT, admin/bishop SELECT+UPDATE; service-role bypass for the unsubscribe flow.
- feat(CC): `lib/newsletter.ts` — Resend Audience integration (contacts.create/update via SDK 6.12.2), brand-styled welcome HTML email, bishop-notify helper, plausible-email validator, unsubscribe URL builder.
- feat(CC): `/api/newsletter/subscribe` POST — honeypot + validate + upsert (re-subscribe path supported) + push to Resend Audience + welcome email + bishop notification, all best-effort with the DB row as source of truth.
- feat(CC): `/api/newsletter/unsubscribe/[token]` GET — service-role flip to status='unsubscribed', sync to Resend, render inline brand-styled confirmation page (success / already / invalid / error).
- feat(CC): wire `NewsletterForm` (was preventDefault stub) — submitting / success / error states, accessible (sr-only label, aria-describedby, role=alert), honeypot field, disabled-during-submit.
- env: requires `RESEND_NEWSLETTER_AUDIENCE_ID` (graceful skip if unset — DB still works, audience push is the only thing that no-ops). Live audience: `a9fd8c6e-cedf-4e72-ab09-ac8db579fea8`.
- chore(CC): subscribe route uses service-role (was anon during initial implementation). Anon RLS only grants INSERT but PostgREST upsert needs INSERT + UPDATE + RETURNING — anon's UPDATE branch silently failed. Service-role mirrors the existing unsubscribe pattern; route-level honeypot + email validation are the gatekeeper.
- chore(CC): migration replaces a pre-existing empty `newsletter_subscribers` table from the orphaned `003_domain_tables.sql` scaffold — `DROP TABLE IF EXISTS … CASCADE` then `CREATE TABLE` (no `IF NOT EXISTS`) so the schema is authoritative, not idempotent.

---

## [2026-05-05] - 04e31d3

### Phase AA — Photo Gallery
- feat(AA): GalleryTemplate — masonry grid (CSS columns, 4-col desktop / 2 tablet / 1 mobile, 10px gap mirroring the live elementor config) + lightbox client component (`_helpers/GalleryGrid.tsx`)
- feat(AA): lightbox supports prev/next, keyboard nav (← → Esc), touch swipe, body-scroll lock, focus-visible ring, click-backdrop-to-close, position counter (n / N), per-photo caption
- feat(AA): `lib/gallery.ts` — getAllGalleryPhotos() reads `assets` rows where asset_key LIKE 'gallery.image.%', ordered ASC for stable curated sequence
- chore(AA): seeded 14 gallery photos into Supabase `assets` (asset_key = `gallery.image.01..14`) from the live elementor masonry widget; all images already on R2 (verified against media-manifest.json)
- chore(AA): registered `gallery` in templateRegistry.byKey; gallery is now the last route to graduate from per-key dump fallback (46/46 live routes templated)
- note: photos are currently demo-theme stock (CMSMasters Faith Connect); bishop will replace via /admin/assets — alt + caption are admin-editable per-asset

---

## [2026-05-05] - f84d3cd

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
