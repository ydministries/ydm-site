-- Phase YY — sermon audio_filename cleanup (migration 2/2).
--
-- Run AFTER the Phase YY code deploy is live and verified. The Phase YY
-- template (SermonTemplate.tsx) reads audio_url, not audio_filename;
-- once the deploy is in production and audio is confirmed playing from
-- the migrated audio_url rows, the old audio_filename rows are
-- redundant and safe to drop.
--
-- Apply order:
--   1. Migration 1 (20260507171944_sermons_video_and_audio_urls.sql) —
--      adds video_url + audio_url; leaves audio_filename in place.
--   2. Phase YY code deploy via `git push origin main` — Vercel rebuilds
--      with the template that reads audio_url.
--   3. Verify a sermon page (e.g. /sermons/gilgal-the-place-of-new-
--      beginnings) plays audio cleanly from the new audio_url path.
--   4. THIS migration — drops the audio_filename rows.
--
-- Idempotent — safe to re-run (re-running deletes 0 rows after the first
-- successful apply).

DELETE FROM page_content
WHERE page_key LIKE 'sermons.%' AND field_key = 'audio_filename';
-- expected: 6 rows deleted on first apply, 0 on subsequent re-runs
