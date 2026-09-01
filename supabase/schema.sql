-- Supabase schema for Botanica

-- Profiles table mirrors Supabase Auth users and stores the role used for
-- admin authorization.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

-- Products table.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null default 0,
  inventory int not null default 0,
  category text not null,
  image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders table. Items and shipping address are stored as jsonb because the
-- client cart is freeform and does not need a relational query surface.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  status text not null default 'Pending Verification',
  shipping_address jsonb not null default '{}'::jsonb,
  receipt_url text,
  created_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_category_idx on public.products (category, is_active);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Keep products.updated_at current on update.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

-- Referral codes: each approved member gets one unique code.
-- The code is the shareable token embedded in /invite/<code> links.
create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_handle text not null,          -- e.g. '@jane_wellness'
  owner_email text,
  owner_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists referral_codes_code_idx on public.referral_codes (code);
create index if not exists referral_codes_owner_handle_idx on public.referral_codes (owner_handle);

-- Access requests: tracks every person who registers via a referral link.
-- Admin approves/rejects from /admin/referrals.
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  instagram_handle text not null unique, -- e.g. '@elena_walker'
  phone text not null,
  referral_code text not null references public.referral_codes(code),
  referred_by text not null,             -- owner_handle of the referring member
  status text not null default 'pending',-- 'pending' | 'approved' | 'rejected'
  email text,
  full_name text,
  user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);

create index if not exists access_requests_status_idx on public.access_requests (status, created_at desc);
create index if not exists access_requests_handle_idx on public.access_requests (instagram_handle);
create index if not exists access_requests_phone_idx on public.access_requests (phone);


