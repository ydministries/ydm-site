-- Phase LL — Shop (Printful + Stripe).
--
-- The 004_shop.sql scaffold already created `orders`, `order_items`,
-- `products`, and `product_variants`. This Phase LL migration:
-- 1. Adds the columns we need that 004 didn't ship (stripe_payment_intent_id,
--    tracking_url for Printful fulfillment updates)
-- 2. Enables RLS — orders contain PII (shipping address, customer email).
--    Only admin/bishop should SELECT. INSERT/UPDATE happen via service-role
--    from /api/stripe/webhook.
--
-- We're NOT using the products / product_variants tables in v1. Catalog is
-- fetched from Printful's API at request time (Next.js fetch with 5-min
-- revalidate). product_variants stays empty and unused; can be wired up
-- later if Bishop wants offline catalog browsing.

alter table public.orders
  add column if not exists stripe_payment_intent_id text,
  add column if not exists tracking_url text,
  add column if not exists printful_recipient jsonb,
  add column if not exists notes text;

create index if not exists orders_payment_intent_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists orders_printful_idx
  on public.orders (printful_order_id)
  where printful_order_id is not null;

-- RLS on orders + order_items
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Editors read orders" on public.orders;
create policy "Editors read orders"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

drop policy if exists "Editors read order_items" on public.order_items;
create policy "Editors read order_items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'bishop')
    )
  );

-- INSERT/UPDATE happen exclusively via service-role from the Stripe
-- webhook handler. No anon policies needed.

-- Touch trigger for orders (already exists per 004 do-block, but we want
-- to be sure it exists with the function we use elsewhere).
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();
