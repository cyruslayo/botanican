-- Phase 8 hardening: protect profile roles, allow rejected members to reapply,
-- validate required delivery fields, and make client order retries idempotent.

-- A member may update personal profile fields, but never promote itself to admin.
-- Admins retain the ability to manage profile roles.
alter table public.profiles enable row level security;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (public.is_admin() or (auth.uid() = id and role = 'customer'));

-- Rejected applications reuse the existing unique handle row instead of asking
-- the member to submit a duplicate handle that the database must reject.
create or replace function public.submit_access_request(
  p_instagram_handle text,
  p_phone text,
  p_referral_code text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized_handle text;
  normalized_code text;
  phone_digits text;
  validated_code text;
  referring_handle text;
  existing_request_id uuid;
  existing_status text;
  created_request_id uuid;
begin
  normalized_handle := case
    when trim(coalesce(p_instagram_handle, '')) = '' then ''
    when left(lower(trim(p_instagram_handle)), 1) = '@' then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  normalized_code := lower(trim(coalesce(p_referral_code, '')));
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  if normalized_handle = '' or length(phone_digits) < 7 or normalized_code = '' then
    raise exception 'Instagram handle, valid phone, and referral code are required' using errcode = '22023';
  end if;

  select rc.code, rc.owner_handle
    into validated_code, referring_handle
  from public.referral_codes rc
  where lower(rc.code) = normalized_code
    and rc.is_active = true
  limit 1;

  if referring_handle is null then
    raise exception 'Referral code is invalid or inactive' using errcode = '22023';
  end if;

  select ar.id, ar.status
    into existing_request_id, existing_status
  from public.access_requests ar
  where lower(trim(ar.instagram_handle)) = normalized_handle
  for update;

  if existing_request_id is not null then
    if existing_status = 'rejected' then
      update public.access_requests
      set phone = trim(p_phone),
          referral_code = validated_code,
          referred_by = referring_handle,
          status = 'pending',
          reviewed_at = null,
          reviewed_by = null,
          created_at = clock_timestamp()
      where id = existing_request_id;
      return existing_request_id;
    end if;

    raise exception 'Instagram handle is already registered' using errcode = '23505';
  end if;

  insert into public.access_requests (
    instagram_handle, phone, referral_code, referred_by, status, reviewed_at, reviewed_by
  ) values (
    normalized_handle, trim(p_phone), validated_code, referring_handle, 'pending', null, null
  ) returning id into created_request_id;

  return created_request_id;
end;
$$;

revoke all on function public.submit_access_request(text, text, text) from public;
grant execute on function public.submit_access_request(text, text, text) to anon, authenticated;

-- Every new order must carry the fields the checkout form presents as required.
-- Keep validation NOT VALID until legacy rows are reviewed during deployment.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_shipping_address_required_check'
  ) then
    alter table public.orders
      add constraint orders_shipping_address_required_check
      check (
        jsonb_typeof(shipping_address) = 'object'
        and nullif(trim(shipping_address ->> 'region'), '') is not null
        and nullif(trim(shipping_address ->> 'address'), '') is not null
      ) not valid;
  end if;
end
$$;

-- The key is stored inside the existing shipping snapshot to avoid exposing a
-- new customer-facing table column. The advisory lock protects retries; this
-- lookup index avoids making deployment depend on legacy key contents.
create index if not exists orders_client_order_id_idx
  on public.orders (
    user_id,
    (shipping_address ->> 'clientOrderId')
  )
  where (shipping_address ->> 'clientOrderId') like 'botanica-%';

-- Keep the original six-argument implementation as the trusted order worker,
-- but expose only this seven-argument idempotent entry point to the client.
create or replace function public.create_member_order(
  p_instagram_handle text,
  p_phone text,
  p_items jsonb,
  p_total numeric,
  p_shipping_address jsonb,
  p_receipt_url text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized_handle text;
  normalized_key text;
  existing_order_id uuid;
  shipping_with_key jsonb;
begin
  normalized_handle := case
    when trim(coalesce(p_instagram_handle, '')) = '' then ''
    when left(lower(trim(p_instagram_handle)), 1) = '@' then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  normalized_key := trim(coalesce(p_idempotency_key, ''));

  if normalized_handle = ''
     or normalized_key = ''
     or length(normalized_key) > 128
     or normalized_key not like 'botanica-%' then
    raise exception 'Valid member identity and order key are required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') =
        regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
  ) then
    raise exception 'Approved membership is required to place an order' using errcode = '42501';
  end if;

  -- Serialize the same member/key pair so a retry that follows a lost response
  -- observes the committed order instead of reserving inventory a second time.
  perform pg_advisory_xact_lock(
    hashtextextended(normalized_handle || ':' || normalized_key, 0)
  );

  select o.id
    into existing_order_id
  from public.orders o
  where lower(trim(o.user_id)) = normalized_handle
    and o.shipping_address ->> 'clientOrderId' = normalized_key
  order by o.created_at desc
  limit 1;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  shipping_with_key := jsonb_set(
    coalesce(p_shipping_address, '{}'::jsonb),
    '{clientOrderId}',
    to_jsonb(normalized_key),
    true
  );

  return public.create_member_order(
    p_instagram_handle,
    p_phone,
    p_items,
    p_total,
    shipping_with_key,
    p_receipt_url
  );
end;
$$;

revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public, anon, authenticated;
revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text, text) from public;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text, text) to anon, authenticated;
