-- Fix wrong H3 headings and strip Cmsmasters demo footer from ministry pages.
--
-- Background: WordPress migration carried over Cmsmasters Faith Connect
-- demo content into 6 of 7 ministries.* body_html rows. Two distinct demo
-- artifacts exist:
--   1. Trailing demo footer (Meeting Times / Schedule / Location with the
--      fake "Lake Building 20 Lake Blvd. Redding, CA 96003" address).
--      Identical block on 6 rows.
--   2. Wrong-topic <h3> opening lines on 4 rows (e.g. ministries.ask-bishop
--      reads "Welcome to Small Groups Ministry!").
--
-- Scope: surgical. This migration only fixes the H3 line and strips the
-- trailing demo footer. Body paragraphs (some of which discuss the wrong
-- ministry, e.g. ministries.ask-bishop body is about Children's Ministry)
-- are left untouched — they belong to the upcoming copy revision pass.
--
-- ministries.partnership: H3 already correct, footer strip only.
-- ministries.leadership: H3 left as-is (topically correct, just lacks the
--   "Welcome to …!" stylistic prefix — copy-pass call).
-- ministries.worship: clean — no row touched here.
--
-- Each UPDATE chains REPLACE() calls so the row is rewritten atomically.

-- 1. ministries.ask-bishop — H3 fix + footer strip
UPDATE page_content
SET value = REPLACE(
              REPLACE(
                value,
                '<h3>Welcome to Small Groups Ministry!</h3>',
                '<h3>Welcome to Ask the Bishop!</h3>'
              ),
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.ask-bishop' AND field_key = 'body_html';

-- 2. ministries.family — H3 fix + footer strip
-- Note: the apostrophe in "Children’s" is U+2019 (right single quotation
-- mark), not the U+0027 ASCII single quote — no SQL escaping needed.
UPDATE page_content
SET value = REPLACE(
              REPLACE(
                value,
                '<h3>Welcome to Children’s Ministry!</h3>',
                '<h3>Welcome to Family Ministry!</h3>'
              ),
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.family' AND field_key = 'body_html';

-- 3. ministries.leadership — footer strip only (H3 left as-is)
UPDATE page_content
SET value = REPLACE(
              value,
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.leadership' AND field_key = 'body_html';

-- 4. ministries.outreach — H3 fix + footer strip
UPDATE page_content
SET value = REPLACE(
              REPLACE(
                value,
                '<h3>Compassion &amp; Outreach Ministry!</h3>',
                '<h3>Welcome to Compassion &amp; Outreach Ministry!</h3>'
              ),
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.outreach' AND field_key = 'body_html';

-- 5. ministries.partnership — footer strip only (H3 already correct)
-- Mid-body "example@cmsmasters.com" paragraph deliberately left in place;
-- copy pass will replace it.
UPDATE page_content
SET value = REPLACE(
              value,
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.partnership' AND field_key = 'body_html';

-- 6. ministries.wordwide — H3 fix + footer strip
-- Em dash (U+2014) in the new H3 is intentional and typographically correct
-- around the "(Online)" parenthetical. Trailing empty <p><br /><br /></p>
-- is left in place per surgical scope.
UPDATE page_content
SET value = REPLACE(
              REPLACE(
                value,
                '<h3>WOrldwide Ministry - (Online)</h3>',
                '<h3>Welcome to Worldwide Ministry — (Online)</h3>'
              ),
              '<h4>Meeting Times</h4><p>Tuesdays, 12:30pm - 3:00pm<br />Thursdays, 9:00am - 11:00am</p><h4>Schedule</h4><p>10:00 AM - Welcome kids and playtime<br />10:20 AM - Worship<br />10:35 AM - Large group lesson<br />11:00 AM - Age group split off<br />11:05 AM - Crafts and Mini Lesson<br />11:45 AM - Closing time</p><h4>Location</h4> Lake Building 20 Lake Blvd.Redding, CA 96003',
              ''
            )
WHERE page_key = 'ministries.wordwide' AND field_key = 'body_html';
