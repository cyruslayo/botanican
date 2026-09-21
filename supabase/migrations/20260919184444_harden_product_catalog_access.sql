-- Phase 7B: products are no longer a direct customer-facing table API.
-- Approved members read catalog data through protected SECURITY DEFINER RPCs;
-- authenticated admins retain direct CRUD through products RLS policies.

alter table public.products enable row level security;
drop policy if exists products_select on public.products;

-- Remove direct table access from PUBLIC and anon. SECURITY DEFINER catalog,
-- promotion, and order functions do not depend on caller table privileges.
revoke all privileges on table public.products from public;
revoke all privileges on table public.products from anon;

-- Keep only the privileges required by the existing admin UI. RLS policies
-- remain the authorization boundary for authenticated non-admin users.
revoke all privileges on table public.products from authenticated;
grant select, insert, update, delete on table public.products to authenticated;
