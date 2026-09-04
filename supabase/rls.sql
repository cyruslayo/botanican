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

-- Orders: anonymous guest checkout can insert; admins can read/update.
-- For guest insert there is no auth.uid(), so this policy allows any insert
-- matching the client-provided user_id. Keep this in mind for production
-- hardening (e.g. add server-side validation or CAPTCHA).
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (true);

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select on public.orders
  for select using (public.is_admin());

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update using (public.is_admin());

-- Referral codes: anyone can read (to validate invite links); admins can CRUD.
alter table public.referral_codes enable row level security;
drop policy if exists referral_codes_select on public.referral_codes;
create policy referral_codes_select on public.referral_codes
  for select using (true);

drop policy if exists referral_codes_admin_insert on public.referral_codes;
create policy referral_codes_admin_insert on public.referral_codes
  for insert with check (public.is_admin());

drop policy if exists referral_codes_admin_update on public.referral_codes;
create policy referral_codes_admin_update on public.referral_codes
  for update using (public.is_admin());

-- Access requests: anonymous insert (for registration); admins can read/update.
alter table public.access_requests enable row level security;
drop policy if exists access_requests_insert on public.access_requests;
create policy access_requests_insert on public.access_requests
  for insert with check (true);

drop policy if exists access_requests_select on public.access_requests;
create policy access_requests_select on public.access_requests
  for select using (public.is_admin() or email = current_setting('request.jwt.claims', true)::json->>'email');

drop policy if exists access_requests_admin_update on public.access_requests;
create policy access_requests_admin_update on public.access_requests
  for update using (public.is_admin());

-- Site settings: public read, admin write
alter table public.site_settings enable row level security;
drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all using (public.is_admin());

