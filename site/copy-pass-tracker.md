# YDM Copy Pass Tracker

Running checklist of content fixes deferred to Bishop's copy revision
pass. Updated as audit findings surface during the pre-handover fix
sequence.

## Open items

### Ministry pages

- **ministries.ask-bishop body** — paragraphs are about Children's
  Ministry, not Ask the Bishop. Needs full body rewrite.
- **ministries.ask-bishop + ministries.partnership** — mid-body
  `please email: example@cmsmasters.com` paragraphs were intentionally
  preserved by the Phase OO migration. Replace with real contact info
  or remove during copy pass.
### Site-wide

- Phase SS first-pass meta.descriptions are sub-optimal length on 3
  blog posts (your-mission 51 chars, whats-your-view 71 chars,
  i-ruined-my-life 99 chars) and 7 ministry pages (35–59 chars each;
  derived from existing tagline rows). Bishop should expand each
  toward ~120–145 chars during the copy pass for better SEO snippet
  coverage. Edit per page via /admin/content/<page>/meta.description.

## Pending Bishop input

- **Stripe business verification** — required to activate live-mode
  Stripe payments. Until then, /shop checkout is disabled (Phase PP).
  Bishop must complete Stripe Dashboard → Settings → Business profile
  flow himself; Mikey doesn't have the org documents.
- **6 sermon pages need `video_url` populated** (Phase YY). Bishop
  pastes the YouTube URL for each sermon via
  `/admin/content/sermons.<slug>` in the `video_url` field. Template
  renders a privacy-enhanced (youtube-nocookie.com) embed automatically.
  Audio URLs already populated by the Phase YY migration; no action
  needed there. Suggested order of priority: most-recent sermons first
  (heritage-of-a-godly-mother, jesus-is-coming-soon, etc. by
  `date_published`).
- **CMSMasters demo content cleanup** (audit CRITICAL #3) — ~20 pages
  still carry residual cmsmasters Faith Connect WP-theme demo content
  embedded in body_html / per-paragraph fields:
    - `about`, `locations.maltoncog`, `locations.westtoronto`,
      `team.huel_wilson`, `team.huel_clementina` — the "A Diverse and
      Inclusive Community / Our curriculum…" school-themed block
    - 9 blog posts — the "European languages are members of the same
      family" / "wonderful serenity" filler text
    - `ministries.ask-bishop` + `ministries.partnership` — mid-body
      `please email: example@cmsmasters.com` paragraphs (intentionally
      preserved by Phase OO; copy pass replaces)
  The Phase OO migration trimmed the trailing demo footer on 6 ministry
  pages but mid-body lorem-ipsum remains. Bishop rewrites each body
  during the copy pass via `/admin/content`.
- **Image alt text refinement** (Phase TT) — Phase TT seeded 5 alt rows
  + confirmed 14 gallery rows already empty (decorative). 44 orphan
  asset rows (not currently rendered) skipped — see Tech debt. Bishop
  reviews every rendered image during the copy pass via `/admin/assets`
  and fills in real alt where the image carries information beyond the
  surrounding card/heading context. Cross-reference in `HANDOVER.md`
  Outstanding setup work.

## Tech debt / future cleanup

- Apex→www redirect returns 307 (temporary, method-preserving) on POST.
  308 (permanent) would be more semantically correct for a canonical-
  domain redirect and slightly better for SEO. Vercel platform-level
  config — change at Project Settings → Domains. Not blocking; cosmetic.
  (Surfaced 2026-05-06 during Phase PP verification.)
- `scripts/build-route-map.ts` lines 96-110 still emit
  `type: 'index_filter'` route entries for the decommissioned filter
  patterns (blog.cat.*, blog.tag.*, events.cat.*, sermons.cat.*,
  team.cat.*, ministries.cat.*). The DB rows are gone after Phase QQ
  but if anyone re-runs `build-route-map.ts` the codegen path will
  re-emit these as routes. Cosmetic loose end — clean up the script
  to skip these patterns when revisiting Phase Z work.
  (Surfaced 2026-05-06 during Phase QQ Phase A audit.)
- `team.bishopwilson` has multiple independent redirect mechanisms:
  codegen `templateRegistry.redirectKeys` (emits a redirect-shim
  page.tsx), the `archive/wordpress/scrape/site-map.json` redirect
  entry consumed by `next.config.ts`, and historically a
  `team.bishopwilson` row in `page_content` (Phase QQ swept that DB
  row). Rationalizing these to one mechanism is out of scope for the
  audit fix sequence but worth a future "redirect-system audit" pass.
  See cross-reference to the codegen-skip mechanism added in Phase WW
  below — `team.bishopwilson` is a candidate to migrate from
  `templateRegistry.redirectKeys` to `REDIRECT_ONLY_KEYS` since
  next.config.ts already handles its redirect, making the redirect-
  shim page.tsx dead code by the same logic that made guestbook's
  page.tsx dead.
  (Surfaced 2026-05-06 during Phase RR Phase A; cross-referenced
  2026-05-07 during Phase WW.)
- Two codegen skip mechanisms now exist:
  `REDIRECT_ONLY_KEYS` (Phase WW, in `scripts/codegen-pages.ts` —
  for routes whose redirect is owned by next.config.ts; emits no
  page.tsx; currently `guestbook`) and
  `templateRegistry.redirectKeys` (existing — emits a redirect-shim
  page.tsx; currently `team.bishopwilson`). The two differ in
  whether they emit a shim or nothing. A future redirect-system
  audit pass should consolidate by migrating `team.bishopwilson`
  to `REDIRECT_ONLY_KEYS` (next.config.ts already redirects it, so
  the shim is dead code).
  (Surfaced 2026-05-07 during Phase WW Phase A.)
- `/shop/<slug>` product pages still use the global meta.description
  fallback. Should pull from the Printful product description via
  `generateMetadata` in `src/app/(site)/shop/[slug]/page.tsx`. Est.
  30 LOC change. (Surfaced 2026-05-06 during Phase SS.)
- `page_content` has both `seo.description` and `meta.description`
  field_keys. Templates render `meta.description` (per Phase RR
  sitemap work + Phase SS investigation), so `seo.description` rows
  on every page are likely orphan from the original seed pipeline.
  Worth a future audit + DELETE pass similar to Phase QQ ministry-
  orphan cleanup. (Surfaced 2026-05-06 during Phase SS Phase A.)
- 44 of 63 rows in the `assets` table are orphan — not rendered by
  any current template (similar to Phase QQ's `page_content` orphans).
  Affected `asset_key` families:
    - `blog.index.image.*` (9)
    - `contact.image.*` (2)
    - `events.index.image.*` (2)
    - `sermons.index.image.*` (13)
    - `ministries.<slug>.image.*` (21, deorphaned by Phase QQ deletion
      of the referencing `page_content` URLs)
  Future asset-cleanup prompt should DELETE these after grep-confirmation
  they're truly unreferenced. (Surfaced 2026-05-06 during Phase TT.)
- `InvolveCard` component (HomeTemplate.tsx:180-203) hardcodes
  `alt=""` on its `<img>`, doesn't read from the `assets` table even
  when `assets.alt` is populated. The Phase TT seed row
  `home.image.01.alt = "Hands raised in prayer"` sits in DB but
  doesn't render because of this. Future refactor: pass `alt` as a
  prop OR replace raw `<img>` with `EditableImage` (which does the
  assets lookup). Same component is used 4× on homepage.
  (Surfaced 2026-05-06 during Phase TT Phase C.)
- 11 other page-template hero `<Image>` elements (sermons, ministries,
  about, team, live, prayer, ask, contact, campaign, location, event,
  blog) likely hardcode `alt=""` the same way `HomeTemplate.tsx:226`
  did before Phase TT. Audit each and patch in a future image-alt-
  sweep prompt. (Surfaced 2026-05-06 during Phase TT Phase A.)
- Team-portrait alt rendering: team images don't appear in the
  `assets` table per Phase TT Phase A. They render via a different
  mechanism (likely direct R2 URLs in `page_content` or hardcoded).
  To populate alt for team portraits, that mechanism needs investigation
  and potentially a parallel seed migration. (Surfaced 2026-05-06
  during Phase TT Phase A.)

- YDM logo PNG source (`site/public/brand/ydm-logo.png`) is 300×300
  served via Next.js Image. Even with the explicit `sizes="48px"` /
  `sizes="72px"` hints added in Phase ZZ, Next still has to generate
  variants from the 300×300 master. A one-time PNG re-export to
  ~144×144 max would reduce the source bytes Next.js processes.
  ~14 KiB savings on mobile per Lighthouse. Binary asset edit; not
  reachable via code changes.
  (Surfaced 2026-05-07 during Phase ZZ.)
- Phase ZZ Lighthouse fixes were scoped to the home page only (Mikey
  ran PageSpeed on `/` only). The same `text-ydm-gold` on cream/white
  eyebrows, `text-ydm-muted` on cream body text, and `font-script`
  decoratives recur across other templates (about, sermons, ministries,
  team, give, etc.). If Bishop runs Lighthouse on those pages and the
  same accessibility/contrast issues surface, sweep with the same
  fix pattern (token swap + aria-hidden on script decoratives).
  (Surfaced 2026-05-07 during Phase ZZ.)
- **Mobile Performance 92→100 deferred** (audit Info #38). Phase ZZ
  closed the LCP fetchPriority hint and logo-sizes optimizations.
  Remaining gap is tier-3: unused-JS reduction, legacy-polyfill
  trimming, and longer profiling work. Diminishing returns; not
  blocking pre-launch. Three Lighthouse runs across Phases ZZ + AAA
  showed mobile Performance variance of 87-92; desktop hits 100
  cleanly. (Surfaced 2026-05-07 during Phases ZZ + AAA.)
- **Mobile Accessibility 96→100 deferred** (audit Info #38). Phases
  ZZ + AAA shipped 17+ contrast edits (gold-dark token, white-opacity
  bumps, Plan-Your-Visit gold-light, aria-hidden on script
  decoratives) but Lighthouse continued to flag at least one element
  (likely a script decorative — axe-core's color-contrast rule
  doesn't respect aria-hidden). Score plateaued at 96 on home mobile
  + desktop. Chasing the last 4 points would require either: (a)
  recoloring decorative scripts away from gold/amber to a passing
  hue (loses brand visual), or (b) replacing scripts with inline SVG
  images (binary asset complexity). Accepted as a design tradeoff;
  cross-template sweep deferred separately. (Surfaced 2026-05-07
  during Phase AAA.)

## Cleanup deferred

Audit artifacts left on disk for the next debugging session.

Phase VV resolved the `site/scripts/_audit-*.ts` pile by gitignoring
the glob — 13 scripts remain on disk for re-runs but no longer pollute
`git status` (count grew from 11 → 13 in Phase YY when
`_audit-sermons.ts` and `_audit-sermon-audio-fields.ts` were added
during the sermon audio_url migration verification). `printful/`
(Bishop's local design-asset working dir) is also gitignored.

Untracked `/tmp` artifacts:
- `/tmp/ministries-current.json` — pre-Phase-OO body_html snapshot.
- `/tmp/ministries-after.txt` — post-Phase-OO verification output.
- `/tmp/ydm-min/*.html` — Phase OO rendered HTML captures.
- `/tmp/ydm-min-postqq/*.html` — Phase QQ rendered HTML captures.
- `/tmp/ydm-prompt3/pre-cleanup-snapshot.json` — Phase QQ pre-DELETE row dump.
- `/tmp/ydm-prompt4/{new,prod}-{sitemap.xml,urls.txt}` — Phase RR sitemap diff.
- `/tmp/ydm-prompt5/{state,plans}.json` — Phase SS bucket plan dumps.
- `/tmp/verify-prod-meta.sh` — Phase SS production verification script.
- `/tmp/strip-scripts.py`, `/tmp/find-cheapest-variant.py` — one-off helpers.
