-- 004_shop.sql
-- YDM shop: Printful-synced products + Stripe Checkout orders.
-- Per PLAN.md §8.5 + YDM_MIGRATION_GUIDE.md §11.2. Run after 003.

create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  printful_product_id   text unique not null,
  slug                  text unique not null,
  title                 text not null,
  description           text,
  thumbnail_url         text,
  base_price_cad        int,                    -- cents
  currency              text not null default 'CAD',
  active                boolean not null default true,
  synced_at             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists products_active_idx on public.products (active);

create table if not exists public.product_variants (
  id                      uuid primary key default gen_random_uuid(),
  product_id              uuid not null references public.products(id) on delete cascade,
  printful_variant_id     text unique not null,
  name                    text not null,         -- "Black / M"
  sku                     text,
  price_cad               int not null,          -- cents
  size                    text,
  color                   text,
  thumbnail_url           text,
  active                  boolean not null default true
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, active);

create table if not exists public.orders (
  id                        uuid primary key default gen_random_uuid(),
  stripe_session_id         text unique,
  printful_order_id         text unique,
  customer_email            text not null,
  customer_name             text,
  shipping_address          jsonb,
  total_cad                 int not null,        -- cents
  currency                  text not null default 'CAD',
  status                    text not null default 'pending',
  fulfillment_status        text,                -- printful webhook updates this
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint orders_status_ck check (status in ('pending','paid','fulfilling','shipped','delivered','cancelled','refunded'))
);

create index if not exists orders_email_idx on public.orders (customer_email, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders(id) on delete cascade,
  variant_id            uuid references public.product_variants(id) on delete set null,
  printful_variant_id   text not null,
  name                  text not null,           -- snapshot at order time
  quantity              int not null default 1,
  unit_price_cad        int not null             -- cents, snapshot at order time
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ─── donations ─────────────────────────────────────────────────────────────
create table if not exists public.donations (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique,
  donor_name            text,
  donor_email           text,
  amount_cad            int not null,             -- cents
  currency              text not null default 'CAD',
  is_recurring          boolean not null default false,
  interval              text,                      -- "month", null for one-time
  campaign_slug         text references public.campaigns(slug) on delete set null,
  message               text,
  dedication            text,
  status                text not null default 'pending',
  created_at            timestamptz not null default now(),
  constraint donations_status_ck check (status in ('pending','succeeded','failed','refunded')),
  constraint donations_interval_ck check (interval is null or interval in ('month','year'))
);

create index if not exists donations_campaign_idx on public.donations (campaign_slug, created_at desc);
create index if not exists donations_status_idx on public.donations (status, created_at desc);

-- Touch triggers
do $$
declare t text;
begin
  foreach t in array array['products','orders']
  loop
    execute format('drop trigger if exists trg_%s_touch on public.%s', t, t);
    execute format('create trigger trg_%s_touch before update on public.%s for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;
