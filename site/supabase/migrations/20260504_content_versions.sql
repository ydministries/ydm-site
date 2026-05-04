-- Phase S.2 — content_versions audit log
--
-- Append-only history of every saveContentField mutation made through the
-- admin UI. One row per actual value change (no-op saves are skipped by the
-- server action). The version-history viewer (S.5) will read from this table.
--
-- Inserts come from the saveContentField server action. RLS lives in
-- 20260504_content_rls.sql.

create table if not exists public.content_versions (
  id          uuid primary key default gen_random_uuid(),
  page_key    text not null,
  field_key   text not null,
  old_value   text,
  new_value   text,
  value_type  text,
  changed_by  uuid references auth.users(id) on delete set null,
  changed_at  timestamptz not null default now()
);

create index if not exists content_versions_page_field_idx
  on public.content_versions (page_key, field_key, changed_at desc);
