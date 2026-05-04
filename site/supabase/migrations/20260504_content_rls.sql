-- Phase S.2 — RLS for page_content + content_versions
--
-- page_content:
--   * SELECT  — open to anon + authenticated (the public site reads it).
--   * UPDATE  — authenticated users whose profile.role is 'admin' or 'bishop'.
--   * INSERT/DELETE — service role only (codegen + seed scripts own those).
--
-- content_versions:
--   * INSERT  — same admin/bishop gate as page_content UPDATE.
--   * SELECT  — same gate (so the version-history viewer in S.5 works).
--   * UPDATE/DELETE — none. The audit log is append-only.

-- ─────────────────────────────────────────────────────────────────
-- page_content
-- ─────────────────────────────────────────────────────────────────

alter table public.page_content enable row level security;

drop policy if exists "Public reads page content" on public.page_content;
create policy "Public reads page content"
  on public.page_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Editors update page content" on public.page_content;
create policy "Editors update page content"
  on public.page_content
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- content_versions
-- ─────────────────────────────────────────────────────────────────

alter table public.content_versions enable row level security;

drop policy if exists "Editors insert version" on public.content_versions;
create policy "Editors insert version"
  on public.content_versions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors read versions" on public.content_versions;
create policy "Editors read versions"
  on public.content_versions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );
