insert into public.page_content (page_key, field_key, value, value_type) values
  ('global', 'site_name',       'Yeshua Deliverance Ministries', 'text'),
  ('global', 'site_tagline',    'Uniting hearts in faith and fellowship', 'text'),
  ('global', 'seo.title',       'Yeshua Deliverance Ministries — Uniting hearts in faith and fellowship', 'text'),
  ('global', 'seo.description', 'Yeshua Deliverance Ministries (YDM) is a Christian community in the Greater Toronto Area. Join us for worship, deliverance, and fellowship. Watch sermons, request prayer, support our mission.', 'text'),
  ('global', 'seo.og_image',    'global.seo.og_default', 'asset_key'),
  ('global', 'seo.twitter_handle', '', 'text')
on conflict (page_key, field_key) do nothing;
