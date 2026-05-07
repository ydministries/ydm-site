-- Phase TT — partial alt-text seed (audit Warning #9, scope-reduced).
--
-- Background — Phase A investigation findings:
--
-- (1) Audit Warning #10 (no eager/priority hint on LCP image) — INVESTIGATED
--     AND PRE-RESOLVED. Every hero image across 12 templates already uses
--     <Image priority>; Next.js 16 emits the LCP hint as
--       <link rel="preload" as="image" imageSrcSet=...>
--     in <head>, NOT as fetchpriority="high" on the <img> tag. The audit's
--     grep targeted the <img> attribute and missed the head-preload
--     mechanism. No code change shipped.
--
-- (2) Audit Warning #9 (all 63 asset rows have NULL alt) — REFINED.
--     Reality after Phase A:
--       • 49 rows actually NULL (14 gallery rows are already "").
--       • 44 of 63 are orphan — no current template renders them. Tracked
--         in copy-pass-tracker.md "Tech debt / future cleanup" for a
--         future asset-cleanup prompt analogous to Phase QQ.
--       • 18 rows actually render today (4 home + 14 gallery). Of those:
--         - home.image.01 (hero) gets a brief descriptive alt — this is
--           the only asset with a semantic filename ("man-hands-palm-
--           praying-worship-...") so derivation is honest.
--         - home.image.02–04 (InvolveCards) get alt='' because each card's
--           visible heading already conveys the content ("Pray With Us",
--           "Serve With Us", "Partner With Us"). Repeating the heading
--           in alt creates screen-reader redundancy. WCAG decorative-
--           in-described-context guidance: empty alt is correct.
--         - 14 gallery.image.* rows are already alt='' from a prior seed
--           and are intentionally left as-is — a community-photo grid
--           where each image is decorative within the gallery context.
--           Bishop can add per-photo descriptive alts during copy pass
--           if a specific photo carries semantic content.
--       • 1 admin upload (asset_key admin.<uuid>.<timestamp>) gets alt=''
--         (explicit empty rather than NULL, so /admin/assets distinguishes
--         "intentionally empty" from "not yet set").
--
-- Net: 5 UPDATEs covering only assets actually rendered or otherwise
-- worth distinguishing from "not yet set". Auto-extracted alt is first-
-- pass; Bishop refines during copy pass via /admin/assets.

-- The hero image — semantic filename, descriptive alt.
UPDATE assets
SET alt = 'Hands raised in prayer'
WHERE asset_key = 'home.image.01' AND alt IS NULL;
-- expected: 1 row

-- InvolveCards — empty alt (heading conveys the content).
UPDATE assets
SET alt = ''
WHERE asset_key IN ('home.image.02', 'home.image.03', 'home.image.04')
  AND alt IS NULL;
-- expected: 3 rows

-- Admin upload — explicit empty so /admin/assets shows "intentionally
-- blank" rather than "not yet set". Bishop fills in real alt when he
-- knows what the image is.
UPDATE assets
SET alt = ''
WHERE asset_key = 'admin.2767c226-c8d2-4d80-b6fe-95e2dd7004e0.1777931499833'
  AND alt IS NULL;
-- expected: 1 row

-- Total expected: 5 row updates.
