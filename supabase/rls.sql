-- Row Level Security for Botanica

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Helper: true when the requesting user's profile has role = 'admin'.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles: users read/update their own row; admins read everything.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Products: public read of active products, admin read of everything,
-- admin write.
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (is_active = true);

drop policy if exists products_admin_select on public.products;
create policy products_admin_select on public.products
  for select using (public.is_admin());

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products
  for insert with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
  for update using (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
  for delete using (public.is_admin());

-- Orders are created through the create_member_order security-definer RPC.
drop policy if exists orders_insert on public.orders;

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select on public.orders
  for select using (public.is_admin());

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update using (public.is_admin());

-- Referral codes are admin-only at the table boundary. Public validation uses
-- the redacted validate_referral_code RPC from the repair migration.
alter table public.referral_codes enable row level security;
drop policy if exists referral_codes_select on public.referral_codes;
drop policy if exists referral_codes_admin_select on public.referral_codes;
create policy referral_codes_admin_select on public.referral_codes
  for select using (public.is_admin());

drop policy if exists referral_codes_admin_insert on public.referral_codes;
create policy referral_codes_admin_insert on public.referral_codes
  for insert with check (public.is_admin());

drop policy if exists referral_codes_admin_update on public.referral_codes;
create policy referral_codes_admin_update on public.referral_codes
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists referral_codes_admin_delete on public.referral_codes;
create policy referral_codes_admin_delete on public.referral_codes
  for delete using (public.is_admin());

-- Access requests are submitted through the security-definer
-- submit_access_request RPC. There is no direct public INSERT policy.
alter table public.access_requests enable row level security;
drop policy if exists access_requests_insert on public.access_requests;

drop policy if exists access_requests_select on public.access_requests;
create policy access_requests_select on public.access_requests
  for select using (public.is_admin());

drop policy if exists access_requests_admin_update on public.access_requests;
create policy access_requests_admin_update on public.access_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- Site settings: public read, admin write
alter table public.site_settings enable row level security;
drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all using (public.is_admin());
