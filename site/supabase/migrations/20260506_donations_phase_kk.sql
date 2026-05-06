-- Phase KK — Donations (Interac primary + Stripe recurring).
--
-- The 004_shop.sql scaffold already created `public.donations` with
-- most columns (id, stripe_session_id, donor_name, donor_email, amount_cad,
-- currency, is_recurring, interval, campaign_slug, message, dedication,
-- status, created_at). REST probes confirmed the table is empty (0 rows)
-- and that scaffold has been applied via Dashboard. Add the missing
-- column we need for recurring tracking, plus RLS that lets the public
-- API insert rows from the unauthenticated checkout flow and the
-- service-role webhook update them.
--
-- We DON'T DROP this time — the existing schema is mostly correct and
-- additive ALTER is safer than rebuilding (zero rows but the FK to
-- public.campaigns(slug) is referenced by other things).

alter table public.donations
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists method text default 'stripe',
  add column if not exists updated_at timestamptz not null default now();

-- New constraint on method (not enforced before)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'donations_method_ck'
  ) then
    alter table public.donations
      add constraint donations_method_ck
        check (method in ('stripe', 'interac', 'other'));
  end if;
end $$;

create index if not exists donations_subscription_idx
  on public.donations (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists donations_customer_idx
  on public.donations (stripe_customer_id)
  where stripe_customer_id is not null;

-- RLS
alter table public.donations enable row level security;

drop policy if exists "Editors read donations" on public.donations;
create policy "Editors read donations"
  on public.donations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

-- Note: INSERT and UPDATE happen exclusively via the service-role key
-- (server-side: /api/donate/checkout and /api/stripe/webhook). No anon
-- INSERT policy needed — anon clients never touch this table.

-- updated_at trigger
create or replace function public.touch_donations_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists donations_touch_updated_at on public.donations;
create trigger donations_touch_updated_at
  before update on public.donations
  for each row execute function public.touch_donations_updated_at();
