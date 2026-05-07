-- Phase QQ — DB cleanup: stale page_keys + ministry orphan fields.
--
-- Two related cleanups:
--
-- (1) 18 stale page_keys for the index_filter routes that Phase Z
--     decommissioned (commit f84d3cd). The page.tsx files were removed
--     but the seeded page_content rows lingered, bloating the admin
--     /content list. Live-code references in src/lib/{blog,events,
--     sermons,team,ministries,scriptureIndex}.ts are all defensive
--     `.not("page_key", "like", "X.%")` exclusions — DELETE is a no-op
--     to those lib calls.
--
-- (2) 26 distinct field_keys on ministries.* page rows that the current
--     MinistryTemplate (and lib/ministries.ts) never read. Verified by
--     grep against src/components/templates/MinistryTemplate.tsx and
--     src/lib/ministries.ts: only body_html, meta.title, hero_image,
--     tagline, leader_name, leader_role, leader_bio are consumed. The
--     other rows (h3.0N, p.0N, image.0N + .alt + .url, slug,
--     date_published, h1.01) were seeded from the WP scrape but are
--     orphan post-template-redesign. They surface in
--     /admin/content/ministries.X as confusing extra fields for Bishop.
--
-- Rendering must be byte-identical to the post-Phase-OO public-site
-- baseline. The migration removes only DB rows the template never reads.
--
-- Pre-deletion snapshot (rollback reference):
--   /tmp/ydm-prompt3/pre-cleanup-snapshot.json (untracked, dev machine)

-- (1) Stale page_keys for decommissioned Phase Z filter routes
DELETE FROM page_content WHERE
  page_key LIKE 'blog.cat.%' OR
  page_key LIKE 'blog.tag.%' OR
  page_key = 'blog.author.ydm-admin' OR
  page_key LIKE 'events.cat.%' OR
  page_key LIKE 'sermons.cat.%' OR
  page_key LIKE 'team.cat.%';
-- expected: 36 rows

-- (2) Orphan ministry field_keys not consumed by current template.
-- Keep-list verified against MinistryTemplate.tsx + lib/ministries.ts.
-- The trailing 4 (meta.description, title, hero.title, hero.subtitle)
-- don't exist on any ministries.* row today but are kept defensively in
-- case the copy pass adds them per-page later.
DELETE FROM page_content WHERE
  page_key LIKE 'ministries.%' AND
  field_key NOT IN (
    'body_html', 'meta.title',
    'hero_image', 'tagline',
    'leader_name', 'leader_role', 'leader_bio',
    'meta.description', 'title', 'hero.title', 'hero.subtitle'
  );
-- expected: 130 rows
