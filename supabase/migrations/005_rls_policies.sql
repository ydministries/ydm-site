-- 005_rls_policies.sql
-- Row-level security. Two-tier model: anyone can read published content, only admin+bishop can write.
-- RLS checks profiles.role (a table column), NEVER app_metadata JWT claims —
-- JWT metadata drifts out of sync (FOM lesson).

-- ─── helper: current user is staff (admin or bishop) ────────────────────────
create or replace function public.is_staff() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','bishop')
  );
$$;

create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── page_content ───────────────────────────────────────────────────────────
alter table public.page_content enable row level security;

drop policy if exists page_content_read on public.page_content;
create policy page_content_read on public.page_content
  for select using (true);

drop policy if exists page_content_write on public.page_content;
create policy page_content_write on public.page_content
  for all using (public.is_staff()) with check (public.is_staff());

-- ─── assets ────────────────────────────────────────────────────────────────
alter table public.assets enable row level security;

drop policy if exists assets_read on public.assets;
create policy assets_read on public.assets for select using (true);

drop policy if exists assets_write on public.assets;
create policy assets_write on public.assets
  for all using (public.is_staff()) with check (public.is_staff());

-- ─── content_versions (staff only) ─────────────────────────────────────────
alter table public.content_versions enable row level security;

drop policy if exists content_versions_staff on public.content_versions;
create policy content_versions_staff on public.content_versions
  for select using (public.is_staff());

-- ─── profiles ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_write_admin on public.profiles;
create policy profiles_write_admin on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── domain tables: public reads published, staff writes ───────────────────
-- sermons
alter table public.sermons enable row level security;
drop policy if exists sermons_read on public.sermons;
create policy sermons_read on public.sermons for select using (published or public.is_staff());
drop policy if exists sermons_write on public.sermons;
create policy sermons_write on public.sermons for all using (public.is_staff()) with check (public.is_staff());

alter table public.sermon_series enable row level security;
drop policy if exists series_read on public.sermon_series;
create policy series_read on public.sermon_series for select using (true);
drop policy if exists series_write on public.sermon_series;
create policy series_write on public.sermon_series for all using (public.is_staff()) with check (public.is_staff());

alter table public.sermon_scripture_refs enable row level security;
drop policy if exists refs_read on public.sermon_scripture_refs;
create policy refs_read on public.sermon_scripture_refs for select using (true);
drop policy if exists refs_write on public.sermon_scripture_refs;
create policy refs_write on public.sermon_scripture_refs for all using (public.is_staff()) with check (public.is_staff());

-- events
alter table public.events enable row level security;
drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (published or public.is_staff());
drop policy if exists events_write on public.events;
create policy events_write on public.events for all using (public.is_staff()) with check (public.is_staff());

-- ministries
alter table public.ministries enable row level security;
drop policy if exists ministries_read on public.ministries;
create policy ministries_read on public.ministries for select using (published or public.is_staff());
drop policy if exists ministries_write on public.ministries;
create policy ministries_write on public.ministries for all using (public.is_staff()) with check (public.is_staff());

-- campaigns
alter table public.campaigns enable row level security;
drop policy if exists campaigns_read on public.campaigns;
create policy campaigns_read on public.campaigns for select using (active or public.is_staff());
drop policy if exists campaigns_write on public.campaigns;
create policy campaigns_write on public.campaigns for all using (public.is_staff()) with check (public.is_staff());

-- blog_posts
alter table public.blog_posts enable row level security;
drop policy if exists blog_read on public.blog_posts;
create policy blog_read on public.blog_posts for select using (published or public.is_staff());
drop policy if exists blog_write on public.blog_posts;
create policy blog_write on public.blog_posts for all using (public.is_staff()) with check (public.is_staff());

alter table public.blog_comments enable row level security;
drop policy if exists comments_read on public.blog_comments;
create policy comments_read on public.blog_comments for select using (approved or public.is_staff());
drop policy if exists comments_insert on public.blog_comments;
create policy comments_insert on public.blog_comments for insert with check (true);
drop policy if exists comments_write on public.blog_comments;
create policy comments_write on public.blog_comments for all using (public.is_staff()) with check (public.is_staff());

-- prayer_requests: public can insert, staff moderates
alter table public.prayer_requests enable row level security;
drop policy if exists prayer_read_wall on public.prayer_requests;
create policy prayer_read_wall on public.prayer_requests for select using ((approved and share_publicly) or public.is_staff());
drop policy if exists prayer_insert on public.prayer_requests;
create policy prayer_insert on public.prayer_requests for insert with check (true);
drop policy if exists prayer_write on public.prayer_requests;
create policy prayer_write on public.prayer_requests for all using (public.is_staff()) with check (public.is_staff());

-- testimonials
alter table public.testimonials enable row level security;
drop policy if exists testimonials_read on public.testimonials;
create policy testimonials_read on public.testimonials for select using (approved or public.is_staff());
drop policy if exists testimonials_write on public.testimonials;
create policy testimonials_write on public.testimonials for all using (public.is_staff()) with check (public.is_staff());

-- contact_submissions: public can insert, staff reads
alter table public.contact_submissions enable row level security;
drop policy if exists contact_insert on public.contact_submissions;
create policy contact_insert on public.contact_submissions for insert with check (true);
drop policy if exists contact_staff on public.contact_submissions;
create policy contact_staff on public.contact_submissions for select using (public.is_staff());

-- newsletter_subscribers: public can insert, staff reads
alter table public.newsletter_subscribers enable row level security;
drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers for insert with check (true);
drop policy if exists newsletter_staff on public.newsletter_subscribers;
create policy newsletter_staff on public.newsletter_subscribers for all using (public.is_staff()) with check (public.is_staff());

-- shop tables
alter table public.products enable row level security;
drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (active or public.is_staff());
drop policy if exists products_write on public.products;
create policy products_write on public.products for all using (public.is_staff()) with check (public.is_staff());

alter table public.product_variants enable row level security;
drop policy if exists variants_read on public.product_variants;
create policy variants_read on public.product_variants for select using (active or public.is_staff());
drop policy if exists variants_write on public.product_variants;
create policy variants_write on public.product_variants for all using (public.is_staff()) with check (public.is_staff());

alter table public.orders enable row level security;
drop policy if exists orders_staff on public.orders;
create policy orders_staff on public.orders for all using (public.is_staff()) with check (public.is_staff());
-- orders are populated by server-side webhook code using service-role key (bypasses RLS)

alter table public.order_items enable row level security;
drop policy if exists order_items_staff on public.order_items;
create policy order_items_staff on public.order_items for all using (public.is_staff()) with check (public.is_staff());

alter table public.donations enable row level security;
drop policy if exists donations_staff on public.donations;
create policy donations_staff on public.donations for all using (public.is_staff()) with check (public.is_staff());
-- donations are populated by server-side Stripe webhook using service-role key (bypasses RLS)

-- audit_log: admin-only reads
alter table public.audit_log enable row level security;
drop policy if exists audit_log_admin on public.audit_log;
create policy audit_log_admin on public.audit_log for select using (public.is_admin());
