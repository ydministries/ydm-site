-- Phase CC — Newsletter subscribers.
--
-- Source-of-truth table for everyone who signs up via the homepage form
-- (and any future signup placement). Mirrors a subset to Resend Audiences
-- so the bishop can send broadcasts from the Resend dashboard.
--
-- ── Pre-existing table replacement ────────────────────────────────────────
-- The original `003_domain_tables.sql` (Apr 23 scaffold, applied via
-- Dashboard SQL editor) created an earlier `newsletter_subscribers`
-- table with a different shape:
--   id | email | confirmed (bool) | unsubscribe_token (text) | created_at
-- That schema lacks status/source/resend_*/metadata/updated_at and uses
-- `confirmed` boolean instead of a status enum. The Phase CC API code
-- expects the new schema, so we drop the old table (which was unused,
-- 0 rows confirmed before this migration ran) and recreate cleanly.
-- CASCADE also cleans up any old RLS policies / indexes / triggers
-- from 003 + 005_rls_policies.sql.
drop table if exists public.newsletter_subscribers cascade;

-- ── RLS ──────────────────────────────────────────────────────────────────
--   * INSERT — open to anon + authenticated. Visitors are unauthenticated;
--     they hit /api/newsletter/subscribe which uses the anon client.
--   * SELECT — admin/bishop only (mirrors form_submissions / page_content).
--   * UPDATE — admin/bishop only. The unsubscribe route uses the
--     SERVICE-ROLE key (bypasses RLS) to flip status to 'unsubscribed'
--     when a visitor clicks an unsubscribe link.
--   * DELETE — none.

create table public.newsletter_subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  status              text not null default 'subscribed'
                        check (status in ('subscribed','unsubscribed','bounced')),
  source              text default 'home',
  unsubscribe_token   uuid not null default gen_random_uuid() unique,
  resend_contact_id   text,
  resend_audience_id  text,
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, created_at desc);

create index if not exists newsletter_subscribers_unsub_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone subscribes" on public.newsletter_subscribers;
create policy "Anyone subscribes"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Editors read subscribers" on public.newsletter_subscribers;
create policy "Editors read subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors update subscribers" on public.newsletter_subscribers;
create policy "Editors update subscribers"
  on public.newsletter_subscribers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

-- updated_at trigger (fires on any UPDATE).
create or replace function public.touch_newsletter_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists newsletter_subscribers_touch_updated_at
  on public.newsletter_subscribers;
create trigger newsletter_subscribers_touch_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.touch_newsletter_updated_at();
