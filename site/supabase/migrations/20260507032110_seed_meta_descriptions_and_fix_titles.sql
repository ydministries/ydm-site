-- Phase SS — meta.description seed + stale meta.title fixes.
--
-- Closes audit Warnings #6 (parts of), #7, and #8:
--   #6 — 57+ pages missing meta.description, falling back to global default.
--        Seeds 42 page_content rows with first-pass copy.
--   #7 — meta.title placeholder text "Blog Page" / "Events Page".
--   #8 — events.young-adults-connect meta.title says "Yeshua Sunday Service"
--        (slug/title mismatch).
--
-- Source strategy for the 42 .description seeds (verified Phase A):
--   • seo.description (3) — already in DB; promoted to meta.description.
--   • tagline (7)         — existing short marketing line per ministry.
--   • excerpt (16)        — purpose-built blog/sermon/event/give summary.
--   • person_bio (3)      — leader-bio HTML stripped + truncated.
--   • hand-templated (13) — 10 index/landing pages + 3 overrides for
--                           garbage-prone excerpts (Gilgal, Here Am I,
--                           techfund — all flagged in Phase A review).
--
-- Auto-extracted text may not match Bishop's preferred voice/tone — copy
-- pass refines per page via /admin/content/<page>/meta.description. 7
-- ministry tagline-derived rows + 3 sub-100-char blog excerpts are
-- particularly short for SEO; tracked in copy-pass-tracker.md Open items.
--
-- /shop, /shop/success, /give/thanks, /sermons/scripture, /testimonials
-- already export metadata.description from page.tsx (template-metadata
-- bucket). /ask, /prayer already have meta.description rows in DB.
-- Those 7 routes are intentionally NOT touched here.
--
-- /shop/<slug> product pages remain on global fallback — should pull
-- from Printful product description in /shop/[slug]/page.tsx
-- generateMetadata. Tracked in copy-pass-tracker.md Tech debt.
--
-- Idempotent — safe to re-run.

-- ── Part 1: 42 meta.description seeds ────────────────────────────────────
-- Uses ON CONFLICT (page_key, field_key) DO NOTHING so re-running this
-- migration is safe; will not overwrite Bishop's later edits.
INSERT INTO page_content (page_key, field_key, value) VALUES
  -- Group 1: seo.description (already-in-DB) → promoted to meta.description
  ('home',    'meta.description', 'Welcome to Yeshua Deliverance Ministries — a Christ-centered community for worship and growth in the Greater Toronto Area.'),
  ('about',   'meta.description', 'Learn about Yeshua Deliverance Ministries — our mission, vision, values, and beliefs.'),
  ('contact', 'meta.description', 'Get in touch with Yeshua Deliverance Ministries — general inquiries, prayer requests, speaking invitations, and more.'),

  -- Group 2: ministries — tagline-derived
  ('ministries.ask-bishop',  'meta.description', 'Submit your faith and scripture questions to Bishop Wilson.'),
  ('ministries.family',      'meta.description', 'Strengthening homes and raising children in faith.'),
  ('ministries.leadership',  'meta.description', 'Raising up the next generation of Christ-centered leaders.'),
  ('ministries.outreach',    'meta.description', 'Serving our community with the love of Christ.'),
  ('ministries.partnership', 'meta.description', 'Stand with YDM as we expand our reach.'),
  ('ministries.wordwide',    'meta.description', 'Carrying the gospel beyond borders.'),
  ('ministries.worship',     'meta.description', 'Encounter God through music, song, and creative arts.'),

  -- Group 3: excerpt-derived (with 3 hand-template overrides — see below)
  -- OVERRIDE: gilgal — original excerpt attributed to "Pastor Greg Laurie"
  -- (unverified). Hand-template avoids potential misattribution.
  ('sermons.gilgal-the-place-of-new-beginnings',         'meta.description', 'A sermon at Yeshua Deliverance Ministries on Gilgal as a place of new beginnings — and the call to release past worries to God''s care.'),
  -- OVERRIDE: here-am-i — original excerpt prefixed with venue/date
  -- metadata ("EBENEZER URBAN MINISTRY CENTER - June 30 2024..."),
  -- which reads as garbage for SEO.
  ('sermons.here-am-i-send-me-a-vision-for-mission',     'meta.description', 'Bishop Huel Wilson preaches on Isaiah''s call to mission and what it means to say ''Here am I, send me'' as a believer today.'),
  ('sermons.jesus-is-coming-soon-signs-prophecy-hope',   'meta.description', 'This sermon, "Jesus is Coming Soon: Signs, Prophecy, & Hope," provides a comprehensive look at the doctrine of Christ''s second coming, emphasizing its…'),
  ('sermons.jesus-the-ultimate-transformational-leader', 'meta.description', 'Join Bishop Huel Wilson as he delves into the depths of Jesus''s ministry, revealing Him as the ultimate model of transformational leadership.'),
  ('sermons.repent-the-kingdom-of-god-is-at-hand',       'meta.description', 'In this powerful sermon, Bishop Huel Wilson explains the vital biblical message of repentance as a sincere turning from self to God.'),
  ('sermons.the-heritage-of-a-godly-mother',             'meta.description', 'In this heartfelt Mother''s Day sermon, Bishop Huel Wilson explores the invaluable heritage passed down by godly mothers.'),

  ('blog.discovering-the-power-of-waiting',                                'meta.description', 'In our day-to-day lives, there are so many things we end up waiting for. We wait for the bus, in traffic, and in the grocery store line.'),
  ('blog.do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison','meta.description', 'So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day.'),
  ('blog.experiencing-the-freedom-of-gods-presence',                       'meta.description', 'It was never God''s intent that we who were created in His image would experience slavery, oppression or evil of any kind.'),
  ('blog.four-things-our-church-should-still-focus-on',                    'meta.description', 'There is the adage that "change is the only constant" and most of us would agree that the past few years have been exceptionally turbulent.'),
  ('blog.how-do-i-intercede-for-family-who-dont-believe-in-jesus',         'meta.description', 'Sometimes the hardest people group to pray for is family, because there may be a lot of history, years of unresolved issues, or perhaps despite your best…'),
  ('blog.how-to-develop-a-habit-of-worship',                               'meta.description', 'We often talk about developing a daily habit of prayer and reading God''s Word. But what about worship?'),
  ('blog.i-ruined-my-lifeis-there-hope-for-me',                            'meta.description', 'I know that I for one have done things in my life that I certainly regret. I think all of us have.'),
  ('blog.whats-your-view-of-marriage',                                     'meta.description', 'Growing up, I was not enamoured with the thought of my own wedding day.'),
  ('blog.your-mission-should-you-choose-to-accept-it',                     'meta.description', 'Most of us know exactly where that line comes from.'),

  ('events.weekly-bible-study-group', 'meta.description', 'Dive deeper into God''s Word with us! Join our weekly Bible study for meaningful discussions and spiritual growth.'),
  ('events.young-adults-connect',     'meta.description', 'Come and worship with us as we exalt Yeshua the Messiah through the ministry of the Word and the fellowship of believers. Message by Bishop H. O Wilson.'),

  ('give.supportydm', 'meta.description', 'Support our ministry today—your generosity helps us spread the Gospel, serve families, and impact lives for Christ.'),
  -- OVERRIDE: techfund — original excerpt mentioned "education thrives,
  -- healthcare is accessible to all" (WP-demo residue inappropriate for
  -- a tech fund). Hand-template aligns with the campaign's actual scope.
  ('give.techfund',   'meta.description', 'Support YDM''s tech fund — your gift helps us upgrade the audio and video infrastructure for both in-person and online worship.'),

  -- Group 4: team — person_bio derived
  ('team.huel_wilson',        'meta.description', 'Bishop Huel O. Wilson is the founder and senior pastor of Yeshua Deliverance Ministries, a Christ-centered community based in Mississauga, Ontario.'),
  ('team.clementinawilson',   'meta.description', 'Clementina Wilson serves as the First Lady of Yeshua Deliverance Ministries and leads the family ministry alongside her husband, Bishop Huel O. Wilson.'),
  ('team.huel_clementina',    'meta.description', 'Bishop Huel O. Wilson and his wife Clementina founded Yeshua Deliverance Ministries with one shared conviction: every soul deserves a place to encounter…'),

  -- Group 5: hand-templated (no usable purpose-built field)
  ('gallery',                'meta.description', 'Photos from worship services, ministry events, and community life at Yeshua Deliverance Ministries.'),
  ('give.index',             'meta.description', 'Support YDM through Interac e-Transfer or monthly recurring giving — every gift advances the gospel and the ministry''s mission.'),
  ('ministries.index',       'meta.description', 'Explore the seven ministries of Yeshua Deliverance Ministries — worship, family, leadership, outreach, partnership, worldwide, and Ask the Bishop.'),
  ('sermons.index',          'meta.description', 'Browse sermons by Bishop Huel O. Wilson and the YDM teaching team — preaching, biblical exposition, and pastoral teaching.'),
  ('blog.index',             'meta.description', 'Faith reflections, scripture insights, and pastoral encouragement from Bishop Wilson and the YDM community.'),
  ('events.index',           'meta.description', 'Upcoming services, Bible studies, and community gatherings at Yeshua Deliverance Ministries.'),
  ('team.index',             'meta.description', 'Meet Bishop Huel O. Wilson, First Lady Clementina Wilson, and the leadership team of Yeshua Deliverance Ministries.'),
  ('live',                   'meta.description', 'Watch YDM services live online — Sunday worship, Bible study, and ministry broadcasts via the @YDMWorldwide channel.'),
  ('locations.maltoncog',    'meta.description', 'Yeshua Deliverance Ministries at Mississauga Church of God — 2460 The Collegeway. Sunday service every 4th Sunday at 1 PM, Bible study Thursdays 7 PM.'),
  ('locations.westtoronto',  'meta.description', 'Yeshua Deliverance Ministries — West Toronto Church of God location. Contact us for current service times and visit arrangements.')
ON CONFLICT (page_key, field_key) DO NOTHING;

-- ── Part 2: 3 stale meta.title fixes (audit Warnings #7, #8) ─────────────
-- Each WHERE clause was verified Phase B pre-flight to match exactly one
-- row containing the expected old value.

UPDATE page_content SET value = 'Blog'
  WHERE page_key = 'blog.index' AND field_key = 'meta.title';
-- expected: 1 row (was "Blog Page")

UPDATE page_content SET value = 'Events'
  WHERE page_key = 'events.index' AND field_key = 'meta.title';
-- expected: 1 row (was "Events Page")

UPDATE page_content SET value = 'Young Adults Connect'
  WHERE page_key = 'events.young-adults-connect' AND field_key = 'meta.title';
-- expected: 1 row (was "Yeshua Sunday Service" — title/slug mismatch)
