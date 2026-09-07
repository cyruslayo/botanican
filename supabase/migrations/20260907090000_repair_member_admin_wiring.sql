-- Repair membership, referral, settings, and member-order boundaries.
-- This migration is intentionally additive and does not seed or delete data.

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Migration prerequisite missing: public.profiles';
  end if;
  if to_regclass('public.products') is null then
    raise exception 'Migration prerequisite missing: public.products';
  end if;
  if to_regclass('public.orders') is null then
    raise exception 'Migration prerequisite missing: public.orders';
  end if;
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Migration prerequisite missing: public.is_admin()';
  end if;
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name in ('strength_mg', 'bottle_size_ml', 'strain_name', 'batch_code')
    group by table_schema, table_name
    having count(*) = 4
  ) then
    raise exception 'Migration prerequisite missing: product metadata columns';
  end if;
end
$$;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.referral_codes'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (code)'
  ) then
    alter table public.referral_codes
      add constraint referral_codes_code_unique unique (code);
  end if;
end
$$;

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  instagram_handle text not null,
  phone text not null,
  referral_code text not null references public.referral_codes(code),
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

do $$
declare
  duplicate_count bigint;
begin
  select count(*) into duplicate_count
  from (
    select lower(instagram_handle)
    from public.access_requests
    group by lower(instagram_handle)
    having count(*) > 1
  ) duplicates;
  if duplicate_count > 0 then
    raise exception 'Migration prerequisite failed: % normalized Instagram-handle duplicates exist', duplicate_count;
  end if;
end
$$;

create unique index if not exists access_requests_instagram_handle_lower_unique_idx
  on public.access_requests (lower(instagram_handle));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.access_requests'::regclass
      and conname = 'access_requests_referral_code_fkey'
  ) then
    alter table public.access_requests
      add constraint access_requests_referral_code_fkey
      foreign key (referral_code) references public.referral_codes(code) not valid;
  end if;
end
$$;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', true, 5242880, array['image/jpeg', 'image/png', 'application/pdf']::text[])
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf']::text[]
where id = 'receipts';

drop policy if exists receipts_transition_upload on storage.objects;
create policy receipts_transition_upload on storage.objects
  for insert to anon
  with check (
    bucket_id = 'receipts'
    and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
  );

drop policy if exists receipts_anon_upload on storage.objects;
create policy receipts_anon_upload on storage.objects
  for insert to anon
  with check (
    bucket_id = 'receipts'
    and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
  );

drop policy if exists receipts_admin_read on storage.objects;
create policy receipts_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and public.is_admin());

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

create or replace function public.submit_access_request(
  p_instagram_handle text,
  p_phone text,
  p_referral_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_handle text;
  normalized_code text;
  phone_digits text;
  validated_code text;
  referring_handle text;
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

  select rc.code, rc.owner_handle into validated_code, referring_handle
  from public.referral_codes rc
  where lower(rc.code) = normalized_code
    and rc.is_active = true
  limit 1;

  if referring_handle is null then
    raise exception 'Referral code is invalid or inactive' using errcode = '22023';
  end if;

  insert into public.access_requests (
    instagram_handle,
    phone,
    referral_code,
    referred_by,
    status,
    reviewed_at,
    reviewed_by
  ) values (
    normalized_handle,
    trim(p_phone),
    validated_code,
    referring_handle,
    'pending',
    null,
    null
  )
  returning id into created_request_id;

  return created_request_id;
end;
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
        where case
          when left(lower(trim(rc.owner_handle)), 1) = '@' then lower(trim(rc.owner_handle))
          else '@' || lower(trim(rc.owner_handle))
        end = case
          when left(lower(trim(ar.instagram_handle)), 1) = '@' then lower(trim(ar.instagram_handle))
          else '@' || lower(trim(ar.instagram_handle))
        end
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
  normalized_member_handle text;
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

  normalized_member_handle := case
    when left(lower(trim(request_row.instagram_handle)), 1) = '@' then lower(trim(request_row.instagram_handle))
    else '@' || lower(trim(request_row.instagram_handle))
  end;

  reviewer := coalesce(
    (select p.email from public.profiles p where p.id = auth.uid()),
    (auth.jwt() ->> 'email'),
    auth.uid()::text
  );

  if p_new_status = 'approved' then
    select rc.code into member_code
    from public.referral_codes rc
     where case
       when left(lower(trim(rc.owner_handle)), 1) = '@' then lower(trim(rc.owner_handle))
       else '@' || lower(trim(rc.owner_handle))
     end = normalized_member_handle
      and rc.is_active = true
    order by rc.created_at asc
    limit 1;

    if member_code is null then
      select rc.code into member_code
      from public.referral_codes rc
       where case
         when left(lower(trim(rc.owner_handle)), 1) = '@' then lower(trim(rc.owner_handle))
         else '@' || lower(trim(rc.owner_handle))
       end = normalized_member_handle
      order by rc.created_at asc
      limit 1;

      if member_code is not null then
        update public.referral_codes
        set is_active = true
        where code = member_code;
      end if;
    end if;

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
  elsif p_new_status = 'rejected' then
    update public.referral_codes
    set is_active = false
    where case
      when left(lower(trim(owner_handle)), 1) = '@' then lower(trim(owner_handle))
      else '@' || lower(trim(owner_handle))
    end = normalized_member_handle
      and is_active = true;
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
  submitted_item jsonb;
  product_row public.products;
  submitted_product_id uuid;
  submitted_quantity numeric;
  submitted_quantity_total numeric;
  calculated_total numeric := 0;
  trusted_items jsonb := '[]'::jsonb;
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

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order items, shipping address, and receipt are required' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) = 0
     or p_shipping_address is null
     or nullif(trim(coalesce(p_receipt_url, '')), '') is null then
    raise exception 'Order items, shipping address, and receipt are required' using errcode = '22023';
  end if;
  if p_receipt_url !~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$' then
    raise exception 'Receipt path is invalid' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from storage.objects
    where bucket_id = 'receipts'
      and name = p_receipt_url
  ) then
    raise exception 'Receipt object does not exist' using errcode = '22023';
  end if;

  if lower(trim(coalesce(p_shipping_address ->> 'instagramHandle', ''))) <> normalized_handle
     or regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '[^0-9]', '', 'g') <> phone_digits then
    raise exception 'Shipping identity does not match approved membership' using errcode = '42501';
  end if;

  for submitted_item in
    select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(submitted_item) <> 'object'
       or nullif(trim(coalesce(submitted_item ->> 'id', '')), '') is null then
      raise exception 'Every order item must include a product ID' using errcode = '22023';
    end if;

    begin
      submitted_product_id := (submitted_item ->> 'id')::uuid;
    exception when invalid_text_representation then
      raise exception 'Unknown product ID: %', submitted_item ->> 'id' using errcode = '22023';
    end;

    select * into product_row
    from public.products
    where id = submitted_product_id;

    if not found then
      raise exception 'Unknown product ID: %', submitted_product_id using errcode = 'P0002';
    end if;
    if product_row.is_active is not true then
      raise exception 'Product is inactive: %', product_row.name using errcode = '22023';
    end if;

    if jsonb_typeof(submitted_item -> 'quantity') <> 'number' then
      raise exception 'Product quantity must be a positive integer' using errcode = '22023';
    end if;
    begin
      submitted_quantity := (submitted_item ->> 'quantity')::numeric;
    exception when invalid_text_representation then
      raise exception 'Product quantity must be a positive integer' using errcode = '22023';
    end;
    if submitted_quantity <= 0 or submitted_quantity <> trunc(submitted_quantity) then
      raise exception 'Product quantity must be a positive integer' using errcode = '22023';
    end if;

    select coalesce(sum((items.value ->> 'quantity')::numeric), 0)
      into submitted_quantity_total
    from jsonb_array_elements(p_items) as items(value)
    where (items.value ->> 'id')::uuid = submitted_product_id;
    if submitted_quantity_total > coalesce(product_row.inventory, 0) then
      raise exception 'Insufficient inventory for product: %', product_row.name using errcode = '22023';
    end if;

    if product_row.strength_mg is null then
      if submitted_item ->> 'strength_mg' is not null then
        raise exception 'Stale product metadata for: %', product_row.name using errcode = '22023';
      end if;
    elsif submitted_item ->> 'strength_mg' is null
       or (submitted_item ->> 'strength_mg')::numeric <> product_row.strength_mg then
      raise exception 'Stale product metadata for: %', product_row.name using errcode = '22023';
    end if;

    if product_row.bottle_size_ml is null then
      if submitted_item ->> 'bottle_size_ml' is not null then
        raise exception 'Stale product metadata for: %', product_row.name using errcode = '22023';
      end if;
    elsif submitted_item ->> 'bottle_size_ml' is null
       or (submitted_item ->> 'bottle_size_ml')::numeric <> product_row.bottle_size_ml then
      raise exception 'Stale product metadata for: %', product_row.name using errcode = '22023';
    end if;

    if (submitted_item ->> 'strain_name') is distinct from product_row.strain_name
       or (submitted_item ->> 'batch_code') is distinct from product_row.batch_code then
      raise exception 'Stale product metadata for: %', product_row.name using errcode = '22023';
    end if;

    trusted_items := trusted_items || jsonb_build_array(
      jsonb_build_object(
        'id', product_row.id,
        'name', product_row.name,
        'variant', product_row.category,
        'price', product_row.price,
        'quantity', submitted_quantity,
        'image', product_row.image,
        'strength_mg', product_row.strength_mg,
        'bottle_size_ml', product_row.bottle_size_ml,
        'strain_name', product_row.strain_name,
        'batch_code', product_row.batch_code
      )
    );
    calculated_total := calculated_total + (product_row.price * submitted_quantity);
  end loop;

  if p_total is null or p_total <> calculated_total then
    raise exception 'Submitted order total does not match current product prices' using errcode = '22023';
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
    trusted_items,
    calculated_total,
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

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'access_requests'
      and policyname = 'access_requests_insert'
  ) then
    create policy access_requests_insert on public.access_requests
      for insert to anon, authenticated
      with check (
        status = 'pending'
        and reviewed_at is null
        and reviewed_by is null
      );
  end if;
end
$$;
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
create policy referral_codes_select on public.referral_codes
  for select to anon, authenticated
  using (is_active = true);
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

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_insert'
  ) then
    create policy orders_insert on public.orders
      for insert
      with check (true);
  end if;
end
$$;

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
grant select on public.referral_codes to anon;
grant select, insert, update, delete on public.referral_codes to authenticated;
grant insert on public.access_requests to anon, authenticated;
grant select, update on public.access_requests to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

revoke all on function public.validate_referral_code(text) from public;
grant execute on function public.validate_referral_code(text) to anon, authenticated;
revoke all on function public.submit_access_request(text, text, text) from public;
grant execute on function public.submit_access_request(text, text, text) to anon, authenticated;
revoke all on function public.check_access_status(text, text) from public;
grant execute on function public.check_access_status(text, text) to anon, authenticated;
revoke all on function public.review_access_request(uuid, text) from public;
grant execute on function public.review_access_request(uuid, text) to authenticated;
revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) to anon, authenticated;
