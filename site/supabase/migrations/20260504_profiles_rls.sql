-- Phase S.1.1 — fix recursive RLS on profiles
--
-- The previous RLS policy on `profiles` referenced `profiles` inside its USING
-- clause (classic Supabase footgun: "admins can read all" → exists(select 1
-- from profiles where id = auth.uid() and role = 'admin')). When a signed-in
-- user reads profiles, RLS evaluates the policy, which queries profiles,
-- which evaluates RLS, which queries profiles… stack depth limit exceeded
-- (PostgreSQL error 54001), and the query crashes server-side.
--
-- The middleware then sees null role and redirects to /?error=forbidden,
-- even though the underlying row has role='admin'.
--
-- Fix: drop ALL existing policies on profiles, replace with a clean
-- non-recursive self-read policy. auth.uid() comes from the JWT directly —
-- no table lookup, no recursion.
--
-- Profile mutations (role changes, etc.) stay service-role-only — this
-- migration intentionally adds NO update/insert/delete policies. v1 admin
-- elevation continues to be done via SQL by the project owner.

-- 1. Drop every existing policy on public.profiles by name.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

-- 2. Make sure RLS is enabled (sanity check; should already be on).
alter table public.profiles enable row level security;

-- 3. Authenticated users can read ONLY their own row.
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
