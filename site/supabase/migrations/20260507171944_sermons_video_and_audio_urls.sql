-- Phase YY — sermon video embed + audio URL field additive cutover (1/2).
--
-- Two-migration zero-downtime split. This file is migration 1, applied
-- BEFORE the Phase YY code deploy. Both old (audio_filename) and new
-- (audio_url) rows coexist briefly so production keeps reading the old
-- field while the new code propagates through Vercel.
--
-- After this migration applies and the deploy goes live + is verified,
-- migration 2 (drop_sermon_audio_filename.sql) deletes the now-redundant
-- audio_filename rows.
--
-- Pre-flight grep (Phase B) confirmed audio_filename has only 2 consumers
-- in src/ — SermonTemplate.tsx (being updated to read audio_url) and
-- EditForm.tsx's Assets-bucket matcher (harmless after DELETE; left alone
-- per scope). scripts/seed-fixups.ts:52 has a value-type mapping that
-- matches nothing at runtime once the rows are gone — also harmless.
--
-- Idempotent — safe to re-run. Both steps use ON CONFLICT DO NOTHING.

-- ── Step 1: video_url scaffold (6 rows, empty) ───────────────────────────
INSERT INTO page_content (page_key, field_key, value) VALUES
  ('sermons.gilgal-the-place-of-new-beginnings',         'video_url', ''),
  ('sermons.here-am-i-send-me-a-vision-for-mission',     'video_url', ''),
  ('sermons.jesus-is-coming-soon-signs-prophecy-hope',   'video_url', ''),
  ('sermons.jesus-the-ultimate-transformational-leader', 'video_url', ''),
  ('sermons.repent-the-kingdom-of-god-is-at-hand',       'video_url', ''),
  ('sermons.the-heritage-of-a-godly-mother',             'video_url', '')
ON CONFLICT (page_key, field_key) DO NOTHING;
-- expected: 6 rows inserted

-- ── Step 2: audio_filename → audio_url (full URL) ────────────────────────
INSERT INTO page_content (page_key, field_key, value)
SELECT page_key,
       'audio_url',
       'https://media.ydministries.ca/sermons/' || value
FROM page_content
WHERE page_key LIKE 'sermons.%'
  AND field_key = 'audio_filename'
  AND value IS NOT NULL
  AND value != ''
ON CONFLICT (page_key, field_key) DO NOTHING;
-- expected: 6 rows inserted

-- audio_filename rows are intentionally left in place by this migration.
-- The follow-up migration drop_sermon_audio_filename.sql removes them
-- after the Phase YY code deploy is verified live.
