-- Per-page SEO rows: seo.title + seo.description for every page_key.
-- Titles derived from hero.title or page_key; descriptions are generic
-- placeholders that Mikey can refine in the admin panel.

INSERT INTO public.page_content (page_key, field_key, value, value_type) VALUES
  -- about
  ('about', 'seo.title', 'About Yeshua Deliverance Ministries', 'text'),
  ('about', 'seo.description', 'Learn about Yeshua Deliverance Ministries — our mission, vision, values, and beliefs.', 'text'),
  -- blog_page
  ('blog_page', 'seo.title', 'Blog', 'text'),
  ('blog_page', 'seo.description', 'Read the latest articles and reflections from Yeshua Deliverance Ministries.', 'text'),
  -- campaigns
  ('campaign.supportydm', 'seo.title', 'Support Our Ministry', 'text'),
  ('campaign.supportydm', 'seo.description', 'Partner with YDM to spread the love of Christ. Every gift makes a difference.', 'text'),
  ('campaign.techfund', 'seo.title', 'YDM Tech Fund', 'text'),
  ('campaign.techfund', 'seo.description', 'Help YDM upgrade its technology to better serve our community and reach more people online.', 'text'),
  -- contact
  ('contact', 'seo.title', 'Contact Us', 'text'),
  ('contact', 'seo.description', 'Get in touch with Yeshua Deliverance Ministries — general inquiries, prayer requests, speaking invitations, and more.', 'text'),
  -- events
  ('event.weekly_bible_study_group', 'seo.title', 'Weekly Bible Study Group', 'text'),
  ('event.weekly_bible_study_group', 'seo.description', 'Join our weekly Bible study group every Thursday at 7:00 PM.', 'text'),
  ('event.young_adults_connect', 'seo.title', 'Young Adults Connect', 'text'),
  ('event.young_adults_connect', 'seo.description', 'A gathering for young adults to connect, worship, and grow together.', 'text'),
  ('events_page', 'seo.title', 'Events', 'text'),
  ('events_page', 'seo.description', 'Upcoming events at Yeshua Deliverance Ministries — services, Bible study, and community gatherings.', 'text'),
  -- home
  ('home', 'seo.title', 'Home', 'text'),
  ('home', 'seo.description', 'Welcome to Yeshua Deliverance Ministries — a Christ-centered community for worship and growth in the Greater Toronto Area.', 'text'),
  -- sermons listing
  ('latest_sermons', 'seo.title', 'Sermon Library', 'text'),
  ('latest_sermons', 'seo.description', 'Watch and listen to sermons from Bishop Huel O. Wilson and guest speakers.', 'text'),
  -- ministries
  ('ministry.ask_bishop', 'seo.title', 'Ask Bishop', 'text'),
  ('ministry.ask_bishop', 'seo.description', 'Submit your questions to Bishop Huel O. Wilson.', 'text'),
  ('ministry.family', 'seo.title', 'Family Ministry', 'text'),
  ('ministry.family', 'seo.description', 'Strengthening families through faith, fellowship, and biblical teaching.', 'text'),
  ('ministry.leadership', 'seo.title', 'Leadership & Development', 'text'),
  ('ministry.leadership', 'seo.description', 'Developing leaders who serve with excellence and integrity.', 'text'),
  ('ministry.outreach', 'seo.title', 'Compassion & Outreach', 'text'),
  ('ministry.outreach', 'seo.description', 'Serving our community and the world with the love of Christ.', 'text'),
  ('ministry.partnership', 'seo.title', 'Partnership & Support Ministry', 'text'),
  ('ministry.partnership', 'seo.description', 'Partner with YDM to expand our reach and deepen our impact.', 'text'),
  ('ministry.wordwide', 'seo.title', 'Worldwide Ministry (Online)', 'text'),
  ('ministry.wordwide', 'seo.description', 'Reaching the world online with the gospel of Jesus Christ.', 'text'),
  ('ministry.worship', 'seo.title', 'Worship Ministry', 'text'),
  ('ministry.worship', 'seo.description', 'Leading the congregation in Spirit-filled worship.', 'text'),
  -- listing pages
  ('our_campaigns', 'seo.title', 'Give', 'text'),
  ('our_campaigns', 'seo.description', 'Support the mission of Yeshua Deliverance Ministries through giving.', 'text'),
  ('our_ministries', 'seo.title', 'Our Ministries', 'text'),
  ('our_ministries', 'seo.description', 'Explore the ministries of Yeshua Deliverance Ministries.', 'text'),
  ('our_team', 'seo.title', 'Our Team', 'text'),
  ('our_team', 'seo.description', 'Meet the leaders and team behind Yeshua Deliverance Ministries.', 'text'),
  -- prayer
  ('prayer_requests', 'seo.title', 'Prayer Requests', 'text'),
  ('prayer_requests', 'seo.description', 'Submit a prayer request or pray with others at YDM.', 'text'),
  -- profiles
  ('profile.bishopwilson', 'seo.title', 'Bishop Huel O. Wilson', 'text'),
  ('profile.bishopwilson', 'seo.description', 'Bishop Huel O. Wilson — founder and senior pastor of Yeshua Deliverance Ministries.', 'text'),
  ('profile.clementinawilson', 'seo.title', 'Clementina Wilson', 'text'),
  ('profile.clementinawilson', 'seo.description', 'Clementina Wilson — co-leader and pillar of Yeshua Deliverance Ministries.', 'text'),
  -- sermons (individual)
  ('sermon.discovering_the_power_of_waiting', 'seo.title', 'Discovering the Power of Waiting', 'text'),
  ('sermon.discovering_the_power_of_waiting', 'seo.description', 'A sermon by Bishop Huel O. Wilson on the power of waiting on the Lord.', 'text'),
  ('sermon.do_not_lose_heart_your_future_in_christ_is_beyond_all_comparison', 'seo.title', 'Do Not Lose Heart – Your Future in Christ is Beyond All Comparison', 'text'),
  ('sermon.do_not_lose_heart_your_future_in_christ_is_beyond_all_comparison', 'seo.description', 'A sermon on perseverance and the incomparable future promised in Christ.', 'text'),
  ('sermon.experiencing_the_freedom_of_gods_presence', 'seo.title', 'Experiencing the Freedom of God''s Presence', 'text'),
  ('sermon.experiencing_the_freedom_of_gods_presence', 'seo.description', 'Discover what it means to walk in the freedom of God''s presence.', 'text'),
  ('sermon.four_things_our_church_should_still_focus_on', 'seo.title', 'Four Things Our Church Should Still Focus On', 'text'),
  ('sermon.four_things_our_church_should_still_focus_on', 'seo.description', 'A call to refocus on the essentials of church life and mission.', 'text'),
  ('sermon.how_do_i_intercede_for_family_who_dont_believe_in_jesus', 'seo.title', 'How Do I Intercede For Family Who Don''t Believe In Jesus?', 'text'),
  ('sermon.how_do_i_intercede_for_family_who_dont_believe_in_jesus', 'seo.description', 'Practical guidance on praying for unsaved family members.', 'text'),
  ('sermon.how_to_develop_a_habit_of_worship', 'seo.title', 'How to Develop a Habit of Worship', 'text'),
  ('sermon.how_to_develop_a_habit_of_worship', 'seo.description', 'Learn how to cultivate a lifestyle of worship in your daily walk.', 'text'),
  ('sermon.i_ruined_my_lifeis_there_hope_for_me', 'seo.title', 'I Ruined My Life…Is There Hope for Me?', 'text'),
  ('sermon.i_ruined_my_lifeis_there_hope_for_me', 'seo.description', 'A message of hope and restoration for anyone who feels beyond redemption.', 'text'),
  ('sermon.westtoronto', 'seo.title', 'West Toronto Church of God', 'text'),
  ('sermon.westtoronto', 'seo.description', 'A sermon delivered at West Toronto Church of God.', 'text'),
  ('sermon.whats_your_view_of_marriage', 'seo.title', 'What''s Your View of Marriage?', 'text'),
  ('sermon.whats_your_view_of_marriage', 'seo.description', 'A biblical perspective on the institution of marriage.', 'text'),
  ('sermon.your_mission_should_you_choose_to_accept_it', 'seo.title', 'Your Mission – Should You Choose to Accept It', 'text'),
  ('sermon.your_mission_should_you_choose_to_accept_it', 'seo.description', 'Embracing the Great Commission as a personal call to action.', 'text'),
  -- singletons
  ('singleton.ask', 'seo.title', 'Ask Bishop Wilson', 'text'),
  ('singleton.ask', 'seo.description', 'Submit your question to Bishop Huel O. Wilson.', 'text'),
  ('singleton.gallery', 'seo.title', 'Photo Gallery', 'text'),
  ('singleton.gallery', 'seo.description', 'Browse photos from Yeshua Deliverance Ministries events and services.', 'text'),
  ('singleton.huel_clementina', 'seo.title', 'Huel & Clementina Wilson', 'text'),
  ('singleton.huel_clementina', 'seo.description', 'The story of Bishop Huel and Clementina Wilson and their ministry journey.', 'text'),
  ('singleton.huelwilsonbio', 'seo.title', 'Bishop Wilson – Biography', 'text'),
  ('singleton.huelwilsonbio', 'seo.description', 'The life, ministry, and vision of Bishop Huel O. Wilson.', 'text'),
  ('singleton.live', 'seo.title', 'Watch Live', 'text'),
  ('singleton.live', 'seo.description', 'Watch Yeshua Deliverance Ministries services live online.', 'text'),
  ('singleton.maltoncog', 'seo.title', 'Malton Church of God', 'text'),
  ('singleton.maltoncog', 'seo.description', 'Learn about the Malton Church of God community.', 'text')
ON CONFLICT (page_key, field_key) DO NOTHING;
