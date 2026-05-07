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

## Cleanup deferred

Audit artifacts left on disk for the next debugging session; remove
during the repo hygiene phase.

- `site/scripts/_audit-ministries.ts` — service-role query that pulls
  all `ministries.*` body_html rows; used by Phase OO verification.
- `site/scripts/_audit-fields.ts` — service-role query that enumerates
  every field on each ministry page; surfaced the parallel-field issue
  noted above.
- `/tmp/ministries-current.json` — pre-Phase-OO snapshot of the seven
  body_html values (rollback reference).
- `/tmp/ministries-after.txt` — post-migration verification output.
- `/tmp/ydm-min/*.html` — captured rendered HTML from each
  `/ministries/<slug>` route during Phase OO verification.
