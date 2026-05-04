-- Phase S.3 — RLS for assets
--
-- Mirrors page_content RLS (20260504_content_rls.sql):
--   * SELECT — open to anon + authenticated (the public site references
--     assets via storage_path).
--   * INSERT/UPDATE/DELETE — authenticated users whose profile.role is
--     'admin' or 'bishop'. The /admin/assets/upload route relies on this.
--
-- Codegen + seed scripts continue to bypass RLS via the service-role key.

alter table public.assets enable row level security;

drop policy if exists "Public reads assets" on public.assets;
create policy "Public reads assets"
  on public.assets
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Editors insert assets" on public.assets;
create policy "Editors insert assets"
  on public.assets
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors update assets" on public.assets;
create policy "Editors update assets"
  on public.assets
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

drop policy if exists "Editors delete assets" on public.assets;
create policy "Editors delete assets"
  on public.assets
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );
