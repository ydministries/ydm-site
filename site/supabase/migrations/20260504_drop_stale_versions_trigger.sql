-- Phase S.5 fix — drop the stale audit trigger on page_content.
--
-- Symptom (reproduced 2026-05-04):
--   Updating any page_content row fails with
--   "column 'previous_value' of relation 'content_versions' does not exist".
--
-- Root cause:
--   An earlier-phase trigger on public.page_content auto-writes audit rows
--   into public.content_versions using a column named `previous_value`.
--   When content_versions was recreated in S.2 with the new schema
--   (`old_value` / `new_value`), the CASCADE only dropped FKs — the trigger
--   on page_content survived and now references a column that doesn't exist.
--
-- Fix:
--   The new saveContentField server action writes its own audit row
--   explicitly, so the trigger is redundant. Drop any trigger on
--   public.page_content whose function body references the old column
--   names. Surgical — leaves any unrelated triggers in place.
--
-- This block also DROPs the orphaned trigger function if nothing else
-- depends on it.

do $$
declare
  trg record;
  funcs_to_drop text[] := array[]::text[];
  fname text;
begin
  for trg in (
    select t.tgname, p.oid as func_oid, p.proname,
           n.nspname || '.' || p.proname as func_qual
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace n on n.oid = p.pronamespace
    where t.tgrelid = 'public.page_content'::regclass
      and not t.tgisinternal
      and (
        pg_get_functiondef(p.oid) ilike '%previous_value%'
        or pg_get_functiondef(p.oid) ilike '%content_versions%'
      )
  ) loop
    raise notice 'dropping trigger % on public.page_content (function %)',
      trg.tgname, trg.func_qual;
    execute format('drop trigger %I on public.page_content', trg.tgname);
    funcs_to_drop := array_append(funcs_to_drop, trg.func_qual);
  end loop;

  -- Try to drop each backing function. Use IF EXISTS + RESTRICT so we
  -- silently skip anything still referenced elsewhere.
  foreach fname in array funcs_to_drop loop
    begin
      execute format('drop function if exists %s() restrict', fname);
      raise notice 'dropped function %()', fname;
    exception when dependent_objects_still_exist then
      raise notice 'function %() still depends on other objects — leaving in place', fname;
    end;
  end loop;
end $$;
