# Sermon Audio URLs — Cloudflare R2

Generated 2026-04-23 — sermon MP3s hosted in Cloudflare R2 bucket `ydm-media`.
Use these URLs as the `audio_url` / `file_url` value when populating sermons rows.

Base URL: `https://media.ydministries.ca/sermons/`

## Uploaded (11 local files → 10 unique objects in R2)

The Feb and March copies of `RF_Podcast_He_Gets_Us_2023-1-...674-1.mp3` are
identical files (same size, same content), so only one copy exists in R2.

| # | Filename | Size | Public URL | Status |
|---|----------|------|------------|--------|
| 1 | Bishop-Huel-O.-Wilson-Here-Am-I-Send-Me_-A-Vision-for-Mission-Isaiah-6-Live-@-EUMCNYC.mp3 | 75 MB | [link](https://media.ydministries.ca/sermons/Bishop-Huel-O.-Wilson-Here-Am-I-Send-Me_-A-Vision-for-Mission-Isaiah-6-Live-%40-EUMCNYC.mp3) | ✅ |
| 2 | Gilgal_-The-Place-of-New-Beginnings-_-Bishop-Huel-Wilson-Sermon.mp3 | 10 MB | [link](https://media.ydministries.ca/sermons/Gilgal_-The-Place-of-New-Beginnings-_-Bishop-Huel-Wilson-Sermon.mp3) | ✅ |
| 3 | Jesus-is-Coming-Soon_-Signs-Prophecy-Hope-_-Bishop-Huel-Wilson-Sermon.mp3 | 47 MB | [link](https://media.ydministries.ca/sermons/Jesus-is-Coming-Soon_-Signs-Prophecy-Hope-_-Bishop-Huel-Wilson-Sermon.mp3) | ✅ |
| 4 | Jesus_-The-Ultimate-Transformational-Leader-How-He-Changes-Lives-Bishop-Huel-Wilson-YDM.mp3 | 26 MB | [link](https://media.ydministries.ca/sermons/Jesus_-The-Ultimate-Transformational-Leader-How-He-Changes-Lives-Bishop-Huel-Wilson-YDM.mp3) | ✅ |
| 5 | Repent_-The-Kingdom-of-God-Is-At-Hand-_-Bishop-Huel-Wilson-Sermon.mp3 | 28 MB | [link](https://media.ydministries.ca/sermons/Repent_-The-Kingdom-of-God-Is-At-Hand-_-Bishop-Huel-Wilson-Sermon.mp3) | ✅ |
| 6 | The-Heritage-of-a-Godly-Mother_-Honoring-Mothers-on-Mothers-Day-_-Bishop-Huel-Wilson.mp3 | 37 MB | [link](https://media.ydministries.ca/sermons/The-Heritage-of-a-Godly-Mother_-Honoring-Mothers-on-Mothers-Day-_-Bishop-Huel-Wilson.mp3) | ✅ |
| 7 | RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1.mp3 | 2 MB | [link](https://media.ydministries.ca/sermons/RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1.mp3) | ✅ |
| 8 | RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-1.mp3 | 2 MB | [link](https://media.ydministries.ca/sermons/RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-1.mp3) | ✅ |
| 9 | RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-2.mp3 | 2 MB | [link](https://media.ydministries.ca/sermons/RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-2.mp3) | ✅ |
| 10 | RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-3.mp3 | 2 MB | [link](https://media.ydministries.ca/sermons/RF_Podcast_He_Gets_Us_2023-1-00.00.33.981-00.01.24.674-1-3.mp3) | ✅ |

## Migration note

Source: Cloudflare R2 (ydm-media bucket), accessed via https://media.ydministries.ca/sermons/.
Supabase Storage is NOT used for media assets on this project.

Migrated from Supabase Storage to R2 on 2026-04-23. The Supabase `sermons` bucket
(objects, policies, and bucket) was fully deleted on 2026-04-23.

R2 eliminates the Supabase free-tier 50 MB upload cap, so all files are stored at
original full quality (no compression needed). The Bishop Wilson sermon (#1) is the
full 75 MB / 192 kbps stereo original.

## Local originals

All source MP3s are preserved locally (gitignored) at:
- `archive/wordpress/exports/uploads/2025/02/*.mp3` (7 files)
- `archive/wordpress/exports/uploads/2025/03/*.mp3` (4 files)
