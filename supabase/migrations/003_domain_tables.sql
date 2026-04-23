-- 003_domain_tables.sql
-- YDM domain tables: sermons, events, ministries, campaigns, blog, prayer, testimonials,
-- contact submissions, newsletter subscribers, audit log.
-- Per PLAN.md §3.1 + YDM_MIGRATION_GUIDE.md §5.3. Run after 002.

-- ─── sermon series ──────────────────────────────────────────────────────────
create table if not exists public.sermon_series (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── sermons ───────────────────────────────────────────────────────────────
create table if not exists public.sermons (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  speaker         text,
  preached_at     date,
  series_id       uuid references public.sermon_series(id) on delete set null,
  video_provider  text,
  video_id        text,
  transcript      text,
  notes           text,
  excerpt         text,
  hero_asset_key  text references public.assets(asset_key) on delete set null,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint sermons_provider_ck
    check (video_provider is null or video_provider in ('youtube','vimeo','rumble'))
);

create index if not exists sermons_published_idx on public.sermons (published, preached_at desc);
create index if not exists sermons_series_idx on public.sermons (series_id);

-- ─── sermon scripture refs ──────────────────────────────────────────────────
create table if not exists public.sermon_scripture_refs (
  id          uuid primary key default gen_random_uuid(),
  sermon_id   uuid not null references public.sermons(id) on delete cascade,
  reference   text not null,                -- "John 3:16"
  version     text not null default 'ESV',
  sort_order  int not null default 0
);

create index if not exists sermon_refs_sermon_idx on public.sermon_scripture_refs (sermon_id);

-- ─── events ────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  location        text,
  hero_asset_key  text references public.assets(asset_key) on delete set null,
  capacity        int,
  price_cad       int,                        -- cents; null = free
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists events_published_idx on public.events (published, starts_at);

-- ─── ministries ────────────────────────────────────────────────────────────
create table if not exists public.ministries (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  summary     text,
  hero_asset_key text references public.assets(asset_key) on delete set null,
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ministries_published_idx on public.ministries (published, sort_order);

-- ─── campaigns ─────────────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  goal_cad    int,
  raised_cad  int not null default 0,
  description text,
  hero_asset_key text references public.assets(asset_key) on delete set null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists campaigns_active_idx on public.campaigns (active);

-- ─── blog posts ────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body            text,
  hero_asset_key  text references public.assets(asset_key) on delete set null,
  author_id       uuid references public.profiles(id) on delete set null,
  category        text,
  published       boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);

create table if not exists public.blog_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  name        text,
  email       text,
  body        text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists blog_comments_post_idx on public.blog_comments (post_id, approved);

-- ─── prayer requests ───────────────────────────────────────────────────────
create table if not exists public.prayer_requests (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text,
  request         text not null,
  share_publicly  boolean not null default false,
  approved        boolean not null default false,
  is_anonymous    boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists prayer_requests_wall_idx
  on public.prayer_requests (approved, share_publicly, created_at desc);

-- ─── testimonials ──────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  body        text not null,
  photo_asset_key text references public.assets(asset_key) on delete set null,
  approved    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists testimonials_public_idx on public.testimonials (approved, sort_order);

-- ─── contact submissions ───────────────────────────────────────────────────
-- 9 categories per PLAN.md §8.7
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  email       text not null,
  org         text,
  order_ref   text,
  message     text not null,
  routed_to   text,                    -- "info@", "prayer@", "bishop@", "shop@"
  created_at  timestamptz not null default now(),
  constraint contact_category_ck check (category in (
    'general','prayer','speaking','ask_bishop','the_word',
    'shop','leadership_training','family_ministry','outreach'
  ))
);

create index if not exists contact_submissions_recent_idx
  on public.contact_submissions (created_at desc);

-- ─── newsletter subscribers ────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  confirmed           boolean not null default false,
  unsubscribe_token   text unique not null default gen_random_uuid()::text,
  created_at          timestamptz not null default now()
);

-- ─── audit log ─────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references public.profiles(id) on delete set null,
  action        text not null,
  subject_table text,
  subject_id    uuid,
  meta          jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_recent_idx on public.audit_log (created_at desc);

-- Touch triggers for all domain tables that have updated_at
do $$
declare t text;
begin
  foreach t in array array['sermons','events','ministries','campaigns','blog_posts']
  loop
    execute format('drop trigger if exists trg_%s_touch on public.%s', t, t);
    execute format('create trigger trg_%s_touch before update on public.%s for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;
