-- Phase Y — public form submissions audit log.
--
-- Captures every visitor form submission (Contact, Prayer, Ask, Guestbook)
-- so the bishop can browse them in the admin even if a Resend send fails or
-- the visitor's email auto-reply bounces.
--
-- RLS:
--   * INSERT — open to anon + authenticated. The /api/forms/submit route
--     records the row before sending email; this policy must allow anon
--     since visitors are unauthenticated.
--   * SELECT — admin/bishop only (mirrors the page_content editor gate).
--   * UPDATE/DELETE — none. Audit table is append-only from the visitor side;
--     the API route uses the service-role key only when it needs to mark a
--     row 'sent' / 'failed', which bypasses RLS.

create table if not exists public.form_submissions (
  id                uuid primary key default gen_random_uuid(),
  form_type         text not null,
  category          text,
  visitor_name      text,
  visitor_email     text,
  visitor_message   text not null,
  metadata          jsonb,
  resend_message_id text,
  status            text default 'pending',
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists form_submissions_type_created_idx
  on public.form_submissions (form_type, created_at desc);

alter table public.form_submissions enable row level security;

drop policy if exists "Anyone submits form" on public.form_submissions;
create policy "Anyone submits form"
  on public.form_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Editors read submissions" on public.form_submissions;
create policy "Editors read submissions"
  on public.form_submissions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );
