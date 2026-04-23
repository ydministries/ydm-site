-- 001_cms_core.sql
-- YDM CMS core: page_content + assets + content_versions
-- Run in Supabase → SQL Editor. Safe to re-run (all statements idempotent).

-- ─── page_content ───────────────────────────────────────────────────────────
create table if not exists public.page_content (
  id            uuid primary key default gen_random_uuid(),
  page_key      text not null,                    -- "home", "ministry.family", "sermon.how_to_develop_a_habit_of_worship"
  field_key     text not null,                    -- "hero.title", "body.p1", "cta.1.label"
  value         text not null default '',         -- published value (what the public site renders)
  draft_value   text,                             -- staged edit, promoted → value on publish
  value_type    text not null default 'text',
  published_at  timestamptz,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id) on delete set null,
  constraint page_content_value_type_ck
    check (value_type in ('text','richtext','markdown','html','number','url','email','phone','date','asset_key')),
  unique (page_key, field_key)
);

create index if not exists page_content_page_key_idx
  on public.page_content (page_key);

create index if not exists page_content_published_idx
  on public.page_content (published_at)
  where published_at is not null;

-- ─── assets ─────────────────────────────────────────────────────────────────
create table if not exists public.assets (
  id            uuid primary key default gen_random_uuid(),
  asset_key     text unique not null,             -- "home.hero.bg", "profile.bishopwilson.portrait"
  storage_path  text not null,                    -- path in the Supabase Storage bucket 'ydm-assets'
  alt           text,
  caption       text,
  width         int,
  height        int,
  mime_type     text,
  updated_at    timestamptz not null default now()
);

-- ─── content_versions (audit / rollback) ────────────────────────────────────
create table if not exists public.content_versions (
  id              uuid primary key default gen_random_uuid(),
  page_key        text not null,
  field_key       text not null,
  previous_value  text,
  new_value       text,
  edited_by       uuid references auth.users(id) on delete set null,
  edited_at       timestamptz not null default now()
);

create index if not exists content_versions_lookup_idx
  on public.content_versions (page_key, field_key, edited_at desc);

-- Trigger: on every page_content UPDATE, write a row to content_versions
create or replace function public.log_page_content_change()
returns trigger language plpgsql as $$
begin
  if new.value is distinct from old.value then
    insert into public.content_versions (page_key, field_key, previous_value, new_value, edited_by)
    values (old.page_key, old.field_key, old.value, new.value, new.updated_by);
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_page_content_version on public.page_content;
create trigger trg_page_content_version
  before update on public.page_content
  for each row execute function public.log_page_content_change();

-- ─── updated_at touch trigger for assets ────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_assets_touch on public.assets;
create trigger trg_assets_touch
  before update on public.assets
  for each row execute function public.touch_updated_at();
