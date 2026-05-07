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

- **meta.description missing** on 57+ pages. Will be addressed in the
  Group B seeding pass alongside the orphan-field cleanup.

## Pending Bishop input

- **Stripe business verification** — required to activate live-mode
  Stripe payments. Until then, /shop checkout is disabled (Phase PP).
  Bishop must complete Stripe Dashboard → Settings → Business profile
  flow himself; Mikey doesn't have the org documents.

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
- Audit warning #15 partially closed by Phase RR — `src/app/sitemap.ts`
  and `src/app/robots.ts` now use `NEXT_PUBLIC_SITE_URL` instead of a
  hardcoded literal. Two remaining files still hardcode
  `https://ydministries.ca`:
    - `src/app/api/testimonials/submit/route.ts:96` (admin URL inside
      the bishop-notification email template)
    - `src/app/api/newsletter/unsubscribe/[token]/route.ts:139-140`
      (return-to-site links inside the unsubscribe confirmation page)
  To consolidate in a later Group C prompt.
- `team.bishopwilson` has THREE independent redirect mechanisms:
  codegen `templateRegistry.redirectKeys`, the
  `archive/wordpress/scrape/site-map.json` redirect entry consumed by
  `next.config.ts`, and historically a `team.bishopwilson` row in
  `page_content` (Phase QQ swept that DB row but the page.tsx redirect
  shim still emits independently from codegen). Rationalizing these
  to one mechanism is out of scope for the audit fix sequence but
  worth a future "redirect-system audit" pass.
  (Surfaced 2026-05-06 during Phase RR Phase A.)

## Cleanup deferred

Audit artifacts left on disk for the next debugging session; remove
during the repo hygiene phase.

Untracked scripts in `site/scripts/` (4):
- `_audit-ministries.ts` — Phase OO body_html query.
- `_audit-fields.ts` — Phase OO field enumeration; surfaced parallel-
  field issue addressed by Phase QQ.
- `_audit-cleanup.ts` — Phase QQ pre-deletion snapshot generator.
- `_audit-postcleanup.ts` — Phase QQ post-deletion verification.

Untracked `/tmp` artifacts:
- `/tmp/ministries-current.json` — pre-Phase-OO body_html snapshot.
- `/tmp/ministries-after.txt` — post-Phase-OO verification output.
- `/tmp/ydm-min/*.html` — Phase OO rendered HTML captures.
- `/tmp/ydm-min-postqq/*.html` — Phase QQ rendered HTML captures.
- `/tmp/ydm-prompt3/pre-cleanup-snapshot.json` — Phase QQ pre-DELETE row dump.
- `/tmp/ydm-prompt4/{new,prod}-{sitemap.xml,urls.txt}` — Phase RR sitemap diff.
- `/tmp/strip-scripts.py`, `/tmp/find-cheapest-variant.py` — one-off helpers.
