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
- **All 6 ministry pages with body_html updates** — parallel `h3.01`,
  `p.01`–`p.06`, `image.0N` rows in `page_content` still hold
  pre-migration demo copy. Invisible on public site (template renders
  `body_html` only) but visible to Bishop in `/admin/content/ministries.X`.
  Disposition: handled by the upcoming Group B DB cleanup pass —
  DELETE if confirmed unreferenced by `templateRegistry`. No manual copy
  work needed.

### Site-wide

- **meta.description missing** on 57+ pages. Will be addressed in the
  Group B seeding pass alongside the orphan-field cleanup.

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
