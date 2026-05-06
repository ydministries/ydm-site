-- Phase JJ — Testimonials.
--
-- Replaces the old unmoderated guestbook with a curated testimonials
-- module. Visitors submit; only admin/bishop-approved entries surface
-- on the public /testimonials grid.
--
-- RLS:
--   * INSERT — anon + authenticated. Visitors hit /api/testimonials/submit
--     which uses the anon client. Only allowed to insert with
--     status='pending' (enforced by check + RLS).
--   * SELECT public-approved — `anon` can read rows where status='approved'.
--   * SELECT all — admin/bishop only.
--   * UPDATE / DELETE — admin/bishop only.
--
-- ── Pre-existing table replacement ──────────────────────────────────────
-- The original `003_domain_tables.sql` (Apr 23 scaffold, applied via
-- Dashboard SQL editor) created an earlier `testimonials` table with a
-- different shape:
--   id | name | role | body | photo_asset_key | approved (bool) | sort_order | created_at
-- That schema lacks message/relationship/status/is_featured/visitor_email
-- /metadata/updated_at and uses approved-bool instead of a status enum.
-- The Phase JJ API code expects the new schema, so we drop the old table
-- (verified empty — 0 rows — before this migration ran) and recreate
-- cleanly. CASCADE clears any old RLS policies / indexes / triggers from
-- 003 + 005_rls_policies.sql.
drop table if exists public.testimonials cascade;

create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  message       text not null,
  relationship  text,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  is_featured   boolean not null default false,
  visitor_email text,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists testimonials_status_created_idx
  on public.testimonials (status, created_at desc);

create index if not exists testimonials_featured_idx
  on public.testimonials (is_featured)
  where is_featured = true;

alter table public.testimonials enable row level security;

drop policy if exists "Anyone submits testimonial" on public.testimonials;
create policy "Anyone submits testimonial"
  on public.testimonials
  for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Public reads approved testimonials" on public.testimonials;
create policy "Public reads approved testimonials"
  on public.testimonials
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Editors read all testimonials" on public.testimonials;
create policy "Editors read all testimonials"
  on public.testimonials
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors update testimonials" on public.testimonials;
create policy "Editors update testimonials"
  on public.testimonials
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors delete testimonials" on public.testimonials;
create policy "Editors delete testimonials"
  on public.testimonials
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

-- updated_at trigger
create or replace function public.touch_testimonials_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists testimonials_touch_updated_at on public.testimonials;
create trigger testimonials_touch_updated_at
  before update on public.testimonials
  for each row execute function public.touch_testimonials_updated_at();
