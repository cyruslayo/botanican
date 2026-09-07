-- Repair membership, referral, settings, and member-order boundaries.
-- This migration is intentionally additive and does not seed or delete data.

create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  owner_handle text not null,
  owner_email text,
  owner_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.referral_codes add column if not exists code text;
alter table public.referral_codes add column if not exists owner_handle text;
alter table public.referral_codes add column if not exists owner_email text;
alter table public.referral_codes add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.referral_codes add column if not exists is_active boolean default true;
alter table public.referral_codes add column if not exists created_at timestamptz default now();

create unique index if not exists referral_codes_code_unique_idx
  on public.referral_codes (lower(code));
create index if not exists referral_codes_owner_handle_idx
  on public.referral_codes (lower(owner_handle));

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  instagram_handle text not null,
  phone text not null,
  referral_code text not null,
  referred_by text not null,
  status text not null default 'pending',
  email text,
  full_name text,
  user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);

alter table public.access_requests add column if not exists instagram_handle text;
alter table public.access_requests add column if not exists phone text;
alter table public.access_requests add column if not exists referral_code text;
alter table public.access_requests add column if not exists referred_by text;
alter table public.access_requests add column if not exists status text default 'pending';
alter table public.access_requests add column if not exists email text;
alter table public.access_requests add column if not exists full_name text;
alter table public.access_requests add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.access_requests add column if not exists reviewed_at timestamptz;
alter table public.access_requests add column if not exists reviewed_by text;
alter table public.access_requests add column if not exists created_at timestamptz default now();

create index if not exists access_requests_status_idx
  on public.access_requests (status, created_at desc);
create index if not exists access_requests_handle_idx
  on public.access_requests (lower(instagram_handle));
create index if not exists access_requests_phone_idx
  on public.access_requests (phone);

update public.access_requests
set status = 'pending'
where status is null
   or status not in ('pending', 'approved', 'rejected');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.access_requests'::regclass
      and conname = 'access_requests_status_check'
  ) then
    alter table public.access_requests
      add constraint access_requests_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.validate_referral_code(p_code text)
returns table (
  code text,
  owner_handle text,
  is_active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select rc.code, rc.owner_handle, rc.is_active
  from public.referral_codes rc
  where lower(rc.code) = lower(trim(coalesce(p_code, '')))
    and rc.is_active = true
  limit 1;
$$;

create or replace function public.check_access_status(
  p_instagram_handle text,
  p_phone text
)
returns table (
  status text,
  instagram_handle text,
  referral_code text
)
language sql
stable
security definer
set search_path = public
as $$
  with input_values as (
    select
      case
        when trim(coalesce(p_instagram_handle, '')) = '' then ''
        when left(lower(trim(p_instagram_handle)), 1) = '@' then lower(trim(p_instagram_handle))
        else '@' || lower(trim(p_instagram_handle))
      end as normalized_handle,
      regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') as phone_digits
  )
  select
    ar.status,
    ar.instagram_handle,
    case
      when ar.status = 'approved' then (
        select rc.code
        from public.referral_codes rc
        where lower(rc.owner_handle) = lower(ar.instagram_handle)
          and rc.is_active = true
        order by rc.created_at asc
        limit 1
      )
      else null
    end as referral_code
  from public.access_requests ar
  cross join input_values input
  where input.normalized_handle <> ''
    and length(input.phone_digits) > 0
    and lower(trim(ar.instagram_handle)) = input.normalized_handle
    and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = input.phone_digits
  limit 1;
$$;

create or replace function public.review_access_request(
  p_request_id uuid,
  p_new_status text
)
returns setof public.access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.access_requests;
  member_code text;
  reviewer text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_new_status not in ('approved', 'rejected') then
    raise exception 'Review status must be approved or rejected' using errcode = '22023';
  end if;

  select * into request_row
  from public.access_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Access request not found' using errcode = 'P0002';
  end if;

  reviewer := coalesce(
    (select p.email from public.profiles p where p.id = auth.uid()),
    (auth.jwt() ->> 'email'),
    auth.uid()::text
  );

  if p_new_status = 'approved' then
    select rc.code into member_code
    from public.referral_codes rc
    where lower(rc.owner_handle) = lower(request_row.instagram_handle)
      and rc.is_active = true
    order by rc.created_at asc
    limit 1;

    if member_code is null then
      loop
        member_code := lower(substr(md5(gen_random_uuid()::text), 1, 8));
        begin
          insert into public.referral_codes (
            code,
            owner_handle,
            owner_email,
            owner_id,
            is_active
          ) values (
            member_code,
            request_row.instagram_handle,
            request_row.email,
            request_row.user_id,
            true
          );
          exit;
        exception when unique_violation then
          -- Retry with another generated code.
        end;
      end loop;
    end if;
  end if;

  update public.access_requests
  set status = p_new_status,
      reviewed_at = now(),
      reviewed_by = reviewer
  where id = p_request_id
  returning * into request_row;

  return next request_row;
end;
$$;

create or replace function public.create_member_order(
  p_instagram_handle text,
  p_phone text,
  p_items jsonb,
  p_total numeric,
  p_shipping_address jsonb,
  p_receipt_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_handle text;
  phone_digits text;
  created_order_id uuid;
begin
  normalized_handle := case
    when left(lower(trim(coalesce(p_instagram_handle, ''))), 1) = '@'
      then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  if normalized_handle = '@' or length(phone_digits) = 0 then
    raise exception 'Instagram handle and phone number are required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Approved membership is required to place an order' using errcode = '42501';
  end if;

  if p_items is null or p_shipping_address is null or nullif(trim(coalesce(p_receipt_url, '')), '') is null then
    raise exception 'Order items, shipping address, and receipt are required' using errcode = '22023';
  end if;

  if lower(trim(coalesce(p_shipping_address ->> 'instagramHandle', ''))) <> normalized_handle
     or regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '[^0-9]', '', 'g') <> phone_digits then
    raise exception 'Shipping identity does not match approved membership' using errcode = '42501';
  end if;

  insert into public.orders (
    user_id,
    items,
    total,
    status,
    shipping_address,
    receipt_url
  ) values (
    normalized_handle,
    p_items,
    p_total,
    'Pending Verification',
    p_shipping_address,
    p_receipt_url
  )
  returning id into created_order_id;

  return created_order_id;
end;
$$;

alter table public.access_requests enable row level security;
alter table public.referral_codes enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists access_requests_insert on public.access_requests;
create policy access_requests_insert on public.access_requests
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

drop policy if exists access_requests_select on public.access_requests;
create policy access_requests_select on public.access_requests
  for select to authenticated
  using (public.is_admin());

drop policy if exists access_requests_admin_update on public.access_requests;
create policy access_requests_admin_update on public.access_requests
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists referral_codes_select on public.referral_codes;
drop policy if exists referral_codes_admin_select on public.referral_codes;
drop policy if exists referral_codes_admin_insert on public.referral_codes;
drop policy if exists referral_codes_admin_update on public.referral_codes;
drop policy if exists referral_codes_admin_delete on public.referral_codes;
create policy referral_codes_admin_select on public.referral_codes
  for select to authenticated
  using (public.is_admin());
create policy referral_codes_admin_insert on public.referral_codes
  for insert to authenticated
  with check (public.is_admin());
create policy referral_codes_admin_update on public.referral_codes
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy referral_codes_admin_delete on public.referral_codes
  for delete to authenticated
  using (public.is_admin());

drop policy if exists orders_insert on public.orders;

drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.referral_codes from anon, authenticated;
grant select, insert, update, delete on public.referral_codes to authenticated;
revoke all on public.access_requests from anon;
grant insert on public.access_requests to anon;
grant select, insert, update on public.access_requests to authenticated;
revoke all on public.orders from anon;
grant select, update on public.orders to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

revoke all on function public.validate_referral_code(text) from public;
grant execute on function public.validate_referral_code(text) to anon, authenticated;
revoke all on function public.check_access_status(text, text) from public;
grant execute on function public.check_access_status(text, text) to anon, authenticated;
revoke all on function public.review_access_request(uuid, text) from public;
grant execute on function public.review_access_request(uuid, text) to authenticated;
revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) to anon, authenticated;
