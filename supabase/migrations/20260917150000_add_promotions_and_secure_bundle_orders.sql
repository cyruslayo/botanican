-- Phase 7A2.2: normalized promotions and server-authoritative bundle orders.
-- Infrastructure only. No production promotion is seeded.

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  promotion_type text not null default 'fixed_bundle',
  fixed_price numeric not null,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  show_on_landing boolean not null default false,
  show_in_store boolean not null default true,
  public_badge text,
  public_headline text,
  public_description text,
  member_headline text,
  member_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_type_check check (promotion_type = 'fixed_bundle'),
  constraint promotions_name_non_empty_check check (name !~ '^[[:space:]]*$'),
  constraint promotions_slug_non_empty_check check (slug !~ '^[[:space:]]*$'),
  constraint promotions_fixed_price_check check (fixed_price > 0),
  constraint promotions_fixed_price_scale_check check (fixed_price = round(fixed_price, 2)),
  constraint promotions_schedule_check check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.promotion_items (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  constraint promotion_items_quantity_check check (quantity between 1 and 99),
  constraint promotion_items_unique_product unique (promotion_id, product_id)
);

create index if not exists promotions_active_schedule_idx
  on public.promotions (is_active, starts_at, ends_at);
create index if not exists promotions_landing_idx
  on public.promotions (show_on_landing, is_active);
create index if not exists promotions_store_idx
  on public.promotions (show_in_store, is_active);
create index if not exists promotion_items_promotion_idx
  on public.promotion_items (promotion_id);
create index if not exists promotion_items_product_idx
  on public.promotion_items (product_id);

alter table public.orders
  add column if not exists inventory_reserved_at timestamptz,
  add column if not exists inventory_released_at timestamptz;

do $$
begin
  if exists (
    select 1 from public.products where price <> round(price, 2)
  ) then
    raise exception 'Existing product prices contain more than two decimal places; migration requires review.';
  end if;
  if exists (
    select 1 from public.promotions where fixed_price <> round(fixed_price, 2)
  ) then
    raise exception 'Existing promotion prices contain more than two decimal places; migration requires review.';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_price_scale_check'
  ) then
    alter table public.products
      add constraint products_price_scale_check
      check (price = round(price, 2)) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.promotions'::regclass
      and conname = 'promotions_fixed_price_scale_check'
  ) then
    alter table public.promotions
      add constraint promotions_fixed_price_scale_check
      check (fixed_price = round(fixed_price, 2)) not valid;
  end if;
end
$$;

alter table public.products validate constraint products_price_scale_check;
alter table public.promotions validate constraint promotions_fixed_price_scale_check;

drop trigger if exists promotions_touch_updated_at on public.promotions;
create trigger promotions_touch_updated_at
before update on public.promotions
for each row execute function public.touch_updated_at();

alter table public.promotions enable row level security;
alter table public.promotion_items enable row level security;

drop policy if exists promotions_admin_select on public.promotions;
drop policy if exists promotions_admin_insert on public.promotions;
drop policy if exists promotions_admin_update on public.promotions;
drop policy if exists promotions_admin_delete on public.promotions;
create policy promotions_admin_select on public.promotions
  for select to authenticated using (public.is_admin());
create policy promotions_admin_insert on public.promotions
  for insert to authenticated with check (public.is_admin());
create policy promotions_admin_update on public.promotions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy promotions_admin_delete on public.promotions
  for delete to authenticated using (public.is_admin());

drop policy if exists promotion_items_admin_select on public.promotion_items;
drop policy if exists promotion_items_admin_insert on public.promotion_items;
drop policy if exists promotion_items_admin_update on public.promotion_items;
drop policy if exists promotion_items_admin_delete on public.promotion_items;
create policy promotion_items_admin_select on public.promotion_items
  for select to authenticated using (public.is_admin());
create policy promotion_items_admin_insert on public.promotion_items
  for insert to authenticated with check (public.is_admin());
create policy promotion_items_admin_update on public.promotion_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy promotion_items_admin_delete on public.promotion_items
  for delete to authenticated using (public.is_admin());

revoke all on public.promotions from public, anon, authenticated;
grant select on public.promotions to authenticated;
revoke all on public.promotion_items from public, anon, authenticated;
grant select on public.promotion_items to authenticated;

create or replace function public.save_promotion(
  p_id uuid,
  p_name text,
  p_slug text,
  p_promotion_type text,
  p_fixed_price numeric,
  p_is_active boolean,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_show_on_landing boolean,
  p_show_in_store boolean,
  p_public_badge text,
  p_public_headline text,
  p_public_description text,
  p_member_headline text,
  p_member_description text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  saved_id uuid;
  item jsonb;
  product_id uuid;
  item_quantity numeric;
  product_ids uuid[] := '{}'::uuid[];
  item_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_name is null or p_name ~ '^[[:space:]]*$'
     or p_slug is null or p_slug ~ '^[[:space:]]*$' then
    raise exception 'Promotion name and slug are required' using errcode = '22023';
  end if;
  if p_promotion_type is distinct from 'fixed_bundle' then
    raise exception 'Only fixed bundle promotions are supported' using errcode = '22023';
  end if;
  if p_fixed_price is null or p_fixed_price <= 0 then
    raise exception 'Promotion price must be positive' using errcode = '22023';
  end if;
  if p_fixed_price <> round(p_fixed_price, 2) then
    raise exception 'Promotion price must use at most two decimal places' using errcode = '22023';
  end if;
  if p_ends_at is not null and p_starts_at is not null and p_ends_at <= p_starts_at then
    raise exception 'Promotion end must be after its start' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'A promotion must include at least one product' using errcode = '22023';
  end if;

  item_count := jsonb_array_length(p_items);
  for item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item) <> 'object'
       or nullif(trim(coalesce(item ->> 'product_id', '')), '') is null
       or jsonb_typeof(item -> 'quantity') <> 'number' then
      raise exception 'Each promotion item needs a product and quantity' using errcode = '22023';
    end if;
    begin
      product_id := (item ->> 'product_id')::uuid;
      item_quantity := (item ->> 'quantity')::numeric;
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'Promotion item product or quantity is invalid' using errcode = '22023';
    end;
    if item_quantity < 1 or item_quantity > 99 or item_quantity <> trunc(item_quantity) then
      raise exception 'Promotion item quantity must be a whole number from 1 to 99' using errcode = '22023';
    end if;
    if product_id = any(product_ids) then
      raise exception 'A product may appear only once in a promotion' using errcode = '22023';
    end if;
    product_ids := array_append(product_ids, product_id);
    if not exists (select 1 from public.products p where p.id = product_id) then
      raise exception 'Promotion product was not found' using errcode = 'P0002';
    end if;
  end loop;

  if p_id is null then
    insert into public.promotions (
      name, slug, promotion_type, fixed_price, is_active, starts_at, ends_at,
      show_on_landing, show_in_store, public_badge, public_headline,
      public_description, member_headline, member_description
    ) values (
      trim(p_name), trim(p_slug), p_promotion_type, p_fixed_price, coalesce(p_is_active, false),
      p_starts_at, p_ends_at, coalesce(p_show_on_landing, false), coalesce(p_show_in_store, true),
      nullif(trim(p_public_badge), ''), nullif(trim(p_public_headline), ''),
      nullif(trim(p_public_description), ''), nullif(trim(p_member_headline), ''),
      nullif(trim(p_member_description), '')
    ) returning id into saved_id;
  else
    update public.promotions
    set name = trim(p_name), slug = trim(p_slug), promotion_type = p_promotion_type,
        fixed_price = p_fixed_price, is_active = coalesce(p_is_active, false),
        starts_at = p_starts_at, ends_at = p_ends_at,
        show_on_landing = coalesce(p_show_on_landing, false), show_in_store = coalesce(p_show_in_store, true),
        public_badge = nullif(trim(p_public_badge), ''), public_headline = nullif(trim(p_public_headline), ''),
        public_description = nullif(trim(p_public_description), ''), member_headline = nullif(trim(p_member_headline), ''),
        member_description = nullif(trim(p_member_description), '')
    where id = p_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Promotion was not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.promotion_items where promotion_id = saved_id;
  for item in select value from jsonb_array_elements(p_items) loop
    insert into public.promotion_items (promotion_id, product_id, quantity)
    values (saved_id, (item ->> 'product_id')::uuid, (item ->> 'quantity')::integer);
  end loop;

  return saved_id;
exception when unique_violation then
  raise exception 'Promotion name or slug already exists' using errcode = '23505';
end;
$$;

create or replace function public.delete_promotion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if exists (
    select 1
    from public.orders o
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(o.items) = 'array' then o.items
        else '[]'::jsonb
      end
    ) line
    where line ->> 'promotion_id' = p_id::text
  ) then
    raise exception 'Used promotions cannot be deleted; deactivate the promotion instead' using errcode = '23503';
  end if;
  delete from public.promotions where id = p_id;
  if not found then
    raise exception 'Promotion was not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.get_public_promotions()
returns table (
  id uuid,
  slug text,
  name text,
  badge text,
  headline text,
  description text,
  fixed_price numeric,
  regular_total numeric,
  is_available boolean,
  items jsonb
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    pr.id,
    pr.slug,
    pr.name,
    pr.public_badge,
    pr.public_headline,
    pr.public_description,
    pr.fixed_price,
    sum(p.price * pi.quantity),
    bool_and(coalesce(p.inventory, 0) >= pi.quantity),
    jsonb_agg(jsonb_build_object(
      'product_id', p.id,
      'slug', p.slug,
      'name', p.name,
      'quantity', pi.quantity,
      'strength_mg', p.strength_mg,
      'bottle_size_ml', p.bottle_size_ml
    ) order by pi.id)
  from public.promotions pr
  join public.promotion_items pi on pi.promotion_id = pr.id
  join public.products p on p.id = pi.product_id and p.is_active is true
  where pr.is_active is true
    and pr.show_on_landing is true
    and pr.promotion_type = 'fixed_bundle'
    and pr.fixed_price > 0
    and (pr.starts_at is null or now() >= pr.starts_at)
    and (pr.ends_at is null or now() < pr.ends_at)
  group by pr.id, pr.slug, pr.name, pr.public_badge, pr.public_headline,
    pr.public_description, pr.fixed_price
  having count(*) = (select count(*) from public.promotion_items all_items where all_items.promotion_id = pr.id)
$$;

create or replace function public.get_member_promotions(
  p_instagram_handle text,
  p_phone text
)
returns table (
  id uuid,
  slug text,
  name text,
  badge text,
  headline text,
  description text,
  fixed_price numeric,
  regular_total numeric,
  is_available boolean,
  items jsonb
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized_handle text;
  phone_digits text;
begin
  normalized_handle := case
    when trim(coalesce(p_instagram_handle, '')) = '' then ''
    when left(lower(trim(p_instagram_handle)), 1) = '@' then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  if normalized_handle = '' or length(phone_digits) = 0 then
    raise exception 'Member catalog access is not available' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Member catalog access is not available' using errcode = '42501';
  end if;

  return query
  select
    pr.id, pr.slug, pr.name, pr.public_badge,
    coalesce(pr.member_headline, pr.public_headline),
    coalesce(pr.member_description, pr.public_description),
    pr.fixed_price, sum(p.price * pi.quantity),
    bool_and(coalesce(p.inventory, 0) >= pi.quantity),
    jsonb_agg(jsonb_build_object(
      'product_id', p.id, 'slug', p.slug, 'name', p.name, 'quantity', pi.quantity,
      'strength_mg', p.strength_mg, 'bottle_size_ml', p.bottle_size_ml
    ) order by pi.id)
  from public.promotions pr
  join public.promotion_items pi on pi.promotion_id = pr.id
  join public.products p on p.id = pi.product_id and p.is_active is true
  where pr.is_active is true and pr.show_in_store is true
    and pr.promotion_type = 'fixed_bundle' and pr.fixed_price > 0
    and (pr.starts_at is null or now() >= pr.starts_at)
    and (pr.ends_at is null or now() < pr.ends_at)
  group by pr.id, pr.slug, pr.name, pr.public_badge, pr.member_headline,
    pr.public_headline, pr.member_description, pr.public_description, pr.fixed_price
  having count(*) = (select count(*) from public.promotion_items all_items where all_items.promotion_id = pr.id);
end;
$$;

revoke all on function public.save_promotion(uuid, text, text, text, numeric, boolean, timestamptz, timestamptz, boolean, boolean, text, text, text, text, text, jsonb) from public;
grant execute on function public.save_promotion(uuid, text, text, text, numeric, boolean, timestamptz, timestamptz, boolean, boolean, text, text, text, text, text, jsonb) to authenticated;
create or replace function public.set_promotion_active(
  p_promotion_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  update public.promotions
  set is_active = coalesce(p_active, false)
  where id = p_promotion_id;
  if not found then
    raise exception 'Promotion was not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_promotion_active(uuid, boolean) from public;
grant execute on function public.set_promotion_active(uuid, boolean) to authenticated;
revoke all on function public.delete_promotion(uuid) from public;
grant execute on function public.delete_promotion(uuid) to authenticated;
revoke all on function public.get_public_promotions() from public;
grant execute on function public.get_public_promotions() to anon, authenticated;
revoke all on function public.get_member_promotions(text, text) from public;
grant execute on function public.get_member_promotions(text, text) to anon, authenticated;
-- Replace the latest delivery-fee RPC with an atomic product/promotion implementation.
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
set search_path = pg_catalog, public
as $$
declare
  normalized_handle text;
  phone_digits text;
  created_order_id uuid;
  submitted_item jsonb;
  product_row public.products;
  promotion_row public.promotions;
  promotion_item_row public.promotion_items;
  submitted_product_id uuid;
  submitted_promotion_id uuid;
  submitted_quantity numeric;
  component_items jsonb;
  component_product_ids uuid[] := '{}'::uuid[];
  promotion_ids uuid[] := '{}'::uuid[];
  affected_product_ids uuid[] := '{}'::uuid[];
  required_quantities numeric[] := '{}'::numeric[];
  requirement_index integer;
  locked_product_id uuid;
  locked_promotion_id uuid;
  calculated_subtotal numeric := 0;
  has_promotion boolean := false;
  delivery_fee numeric := 5000;
  calculated_total numeric;
  trusted_items jsonb := '[]'::jsonb;
  line_type text;
  current_time timestamptz := clock_timestamp();
  component_product public.products;
  submitted_strength numeric;
  submitted_size numeric;
begin
  normalized_handle := case
    when trim(coalesce(p_instagram_handle, '')) = '' then ''
    when left(lower(trim(p_instagram_handle)), 1) = '@' then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  if normalized_handle = '' or length(phone_digits) = 0 then
    raise exception 'Instagram handle and phone number are required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.access_requests ar
    where ar.status = 'approved' and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Approved membership is required to place an order' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or p_shipping_address is null or nullif(trim(coalesce(p_receipt_url, '')), '') is null then
    raise exception 'Order items, shipping address, and receipt are required' using errcode = '22023';
  end if;
  if p_receipt_url !~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
     or not exists (select 1 from storage.objects where bucket_id = 'receipts' and name = p_receipt_url) then
    raise exception 'Receipt object does not exist' using errcode = '22023';
  end if;
  if lower(trim(coalesce(p_shipping_address ->> 'instagramHandle', ''))) <> normalized_handle
     or regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '[^0-9]', '', 'g') <> phone_digits then
    raise exception 'Shipping identity does not match approved membership' using errcode = '42501';
  end if;

  -- First pass validates line shape, aggregates products, and collects promotions.
  for submitted_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(submitted_item) <> 'object' then
      raise exception 'Every order item must be an object' using errcode = '22023';
    end if;
    line_type := coalesce(submitted_item ->> 'line_type', 'product');
    if line_type = 'product' then
      if nullif(trim(coalesce(submitted_item ->> 'id', '')), '') is null then
        raise exception 'Every product item must include an ID' using errcode = '22023';
      end if;
      begin
        submitted_product_id := (submitted_item ->> 'id')::uuid;
        submitted_quantity := (submitted_item ->> 'quantity')::numeric;
      exception when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Product ID or quantity is invalid' using errcode = '22023';
      end;
      if jsonb_typeof(submitted_item -> 'quantity') <> 'number'
         or submitted_quantity is null
         or submitted_quantity <= 0 or submitted_quantity <> trunc(submitted_quantity) then
        raise exception 'Product quantity must be a positive integer' using errcode = '22023';
      end if;
      select * into product_row from public.products where id = submitted_product_id;
      if not found or product_row.is_active is not true then
        raise exception 'Product is unavailable' using errcode = '22023';
      end if;
      requirement_index := array_position(affected_product_ids, submitted_product_id);
      if requirement_index is null then
        affected_product_ids := array_append(affected_product_ids, submitted_product_id);
        required_quantities := array_append(required_quantities, submitted_quantity);
      else
        required_quantities[requirement_index] := required_quantities[requirement_index] + submitted_quantity;
      end if;
    elsif line_type = 'promotion' then
      begin
        submitted_promotion_id := (submitted_item ->> 'promotion_id')::uuid;
        submitted_quantity := (submitted_item ->> 'quantity')::numeric;
      exception when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Promotion ID or quantity is invalid' using errcode = '22023';
      end;
      if jsonb_typeof(submitted_item -> 'quantity') <> 'number'
         or submitted_quantity is null
         or submitted_quantity < 1 or submitted_quantity > 99
         or submitted_quantity <> trunc(submitted_quantity) then
        raise exception 'Bundle quantity must be a whole number from 1 to 99' using errcode = 'P7A06';
      end if;
      has_promotion := true;
      if array_position(promotion_ids, submitted_promotion_id) is null then
        promotion_ids := array_append(promotion_ids, submitted_promotion_id);
      end if;
    else
      raise exception 'Unsupported order line type' using errcode = '22023';
    end if;
  end loop;

  -- Lock every distinct promotion in UUID order before validating its contents.
  for locked_promotion_id in
    select distinct item_values.value
    from unnest(promotion_ids) as item_values(value)
    order by item_values.value
  loop
    select * into promotion_row
    from public.promotions
    where id = locked_promotion_id
    for update;
    if not found then
      raise exception 'PROMOTION_NOT_FOUND' using errcode = 'P7A01';
    end if;
  end loop;

  -- Validate promotions and aggregate component requirements after promotion locks.
  for submitted_item in select value from jsonb_array_elements(p_items) loop
    if coalesce(submitted_item ->> 'line_type', 'product') <> 'promotion' then
      continue;
    end if;
    submitted_promotion_id := (submitted_item ->> 'promotion_id')::uuid;
    submitted_quantity := (submitted_item ->> 'quantity')::numeric;
    select * into promotion_row from public.promotions where id = submitted_promotion_id;
    if promotion_row.is_active is not true then
      raise exception 'PROMOTION_INACTIVE' using errcode = 'P7A02';
    end if;
    if not promotion_row.show_in_store then
      raise exception 'PROMOTION_HIDDEN' using errcode = 'P7A05';
    end if;
    if promotion_row.promotion_type <> 'fixed_bundle' or promotion_row.fixed_price <= 0 then
      raise exception 'PROMOTION_INVALID' using errcode = 'P7A06';
    end if;
    if promotion_row.starts_at is not null and current_time < promotion_row.starts_at then
      raise exception 'PROMOTION_NOT_STARTED' using errcode = 'P7A03';
    end if;
    if promotion_row.ends_at is not null and current_time >= promotion_row.ends_at then
      raise exception 'PROMOTION_EXPIRED' using errcode = 'P7A04';
    end if;
    component_product_ids := '{}'::uuid[];
    for promotion_item_row in
      select * from public.promotion_items
      where promotion_id = submitted_promotion_id
      order by product_id
    loop
      if promotion_item_row.quantity < 1 or promotion_item_row.quantity > 99 then
        raise exception 'PROMOTION_INVALID' using errcode = 'P7A06';
      end if;
      select * into product_row from public.products where id = promotion_item_row.product_id;
      if not found or product_row.is_active is not true then
        raise exception 'PROMOTION_COMPONENT_UNAVAILABLE' using errcode = 'P7A07';
      end if;
      component_product_ids := array_append(component_product_ids, promotion_item_row.product_id);
      requirement_index := array_position(affected_product_ids, promotion_item_row.product_id);
      if requirement_index is null then
        affected_product_ids := array_append(affected_product_ids, promotion_item_row.product_id);
        required_quantities := array_append(required_quantities, promotion_item_row.quantity * submitted_quantity);
      else
        required_quantities[requirement_index] := required_quantities[requirement_index] + promotion_item_row.quantity * submitted_quantity;
      end if;
    end loop;
    if cardinality(component_product_ids) = 0 then
      raise exception 'PROMOTION_COMPONENT_UNAVAILABLE' using errcode = 'P7A07';
    end if;
  end loop;

  -- Lock each affected product in UUID order, then validate inventory again.
  for locked_product_id in
    select distinct item_values.value from unnest(affected_product_ids) as item_values(value) order by item_values.value
  loop
    select * into product_row from public.products where id = locked_product_id for update;
    requirement_index := array_position(affected_product_ids, locked_product_id);
    if not found or product_row.is_active is not true
       or coalesce(product_row.inventory, 0) < required_quantities[requirement_index] then
      if exists (
        select 1 from public.promotion_items pi
        where pi.product_id = locked_product_id
          and pi.promotion_id = any(promotion_ids)
      ) then
        raise exception 'PROMOTION_INVENTORY' using errcode = 'P7A08';
      end if;
      raise exception 'Insufficient inventory for product' using errcode = '22023';
    end if;
  end loop;

  -- Second pass builds trusted purchase-time snapshots and authoritative pricing.
  for submitted_item in select value from jsonb_array_elements(p_items) loop
    line_type := coalesce(submitted_item ->> 'line_type', 'product');
    if line_type = 'product' then
      submitted_product_id := (submitted_item ->> 'id')::uuid;
      submitted_quantity := (submitted_item ->> 'quantity')::numeric;
      select * into product_row from public.products where id = submitted_product_id;
      begin
        submitted_strength := nullif(submitted_item ->> 'strength_mg', '')::numeric;
        submitted_size := nullif(submitted_item ->> 'bottle_size_ml', '')::numeric;
      exception when invalid_text_representation then
        raise exception 'Stale product metadata' using errcode = '22023';
      end;
      if product_row.strength_mg is null then
        if submitted_item ->> 'strength_mg' is not null then raise exception 'Stale product metadata' using errcode = '22023'; end if;
      elsif submitted_strength is distinct from product_row.strength_mg then
        raise exception 'Stale product metadata' using errcode = '22023';
      end if;
      if product_row.bottle_size_ml is null then
        if submitted_item ->> 'bottle_size_ml' is not null then raise exception 'Stale product metadata' using errcode = '22023'; end if;
      elsif submitted_size is distinct from product_row.bottle_size_ml then
        raise exception 'Stale product metadata' using errcode = '22023';
      end if;
      if (submitted_item ->> 'strain_name') is distinct from product_row.strain_name
         or (submitted_item ->> 'batch_code') is distinct from product_row.batch_code then
        raise exception 'Stale product metadata' using errcode = '22023';
      end if;
      trusted_items := trusted_items || jsonb_build_array(jsonb_build_object(
        'line_type', 'product', 'id', product_row.id, 'name', product_row.name,
        'variant', product_row.category, 'price', product_row.price, 'quantity', submitted_quantity,
        'image', product_row.image, 'strength_mg', product_row.strength_mg,
        'bottle_size_ml', product_row.bottle_size_ml, 'strain_name', product_row.strain_name,
        'batch_code', product_row.batch_code
      ));
      calculated_subtotal := calculated_subtotal + product_row.price * submitted_quantity;
    else
      submitted_promotion_id := (submitted_item ->> 'promotion_id')::uuid;
      submitted_quantity := (submitted_item ->> 'quantity')::numeric;
      select * into promotion_row from public.promotions where id = submitted_promotion_id;
      component_items := '[]'::jsonb;
      for promotion_item_row in
        select * from public.promotion_items where promotion_id = submitted_promotion_id order by product_id
      loop
        select * into component_product from public.products where id = promotion_item_row.product_id;
        component_items := component_items || jsonb_build_array(jsonb_build_object(
          'product_id', component_product.id, 'slug', component_product.slug, 'name', component_product.name,
          'quantity_per_bundle', promotion_item_row.quantity, 'strength_mg', component_product.strength_mg,
          'bottle_size_ml', component_product.bottle_size_ml
        ));
      end loop;
      trusted_items := trusted_items || jsonb_build_array(jsonb_build_object(
        'line_type', 'promotion', 'promotion_id', promotion_row.id, 'promotion_slug', promotion_row.slug,
        'promotion_name', promotion_row.name, 'name', promotion_row.name, 'price', promotion_row.fixed_price,
        'quantity', submitted_quantity, 'line_total', promotion_row.fixed_price * submitted_quantity,
        'components', component_items
      ));
      calculated_subtotal := calculated_subtotal + promotion_row.fixed_price * submitted_quantity;
    end if;
  end loop;

  calculated_total := calculated_subtotal + delivery_fee;
  if p_total is null or p_total <> calculated_total then
    if has_promotion then
      raise exception 'PROMOTION_TOTAL_MISMATCH' using errcode = 'P7A09';
    end if;
    raise exception 'Submitted order total does not match current prices and delivery fee' using errcode = '22023';
  end if;

  insert into public.orders (
    user_id, items, total, shipping_fee, status, shipping_address, receipt_url,
    inventory_reserved_at
  ) values (
    normalized_handle, trusted_items, calculated_total, delivery_fee,
    'Pending Verification', p_shipping_address, p_receipt_url, current_time
  )
  returning id into created_order_id;

  for requirement_index in 1..cardinality(affected_product_ids) loop
    update public.products
    set inventory = inventory - required_quantities[requirement_index]
    where id = affected_product_ids[requirement_index];
  end loop;
  return created_order_id;
end;
$$;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  order_row public.orders;
  order_item jsonb;
  component_item jsonb;
  line_type text;
  product_id uuid;
  line_quantity numeric;
  component_quantity numeric;
  restore_quantity numeric;
  restock_product_ids uuid[] := '{}'::uuid[];
  restock_quantities numeric[] := '{}'::numeric[];
  restock_index integer;
  locked_product_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_new_status is null
     or p_new_status not in ('Pending Verification', 'Processing', 'Shipped', 'Fulfilled', 'Cancelled') then
    raise exception 'Unsupported order status' using errcode = '22023';
  end if;

  select * into order_row
  from public.orders
  where id = p_order_id
  for update;
  if not found then
    raise exception 'Order was not found' using errcode = 'P0002';
  end if;
  if order_row.status = p_new_status then
    return;
  end if;
  if order_row.inventory_released_at is not null then
    raise exception 'Order inventory has already been released' using errcode = 'P7A10';
  end if;
  if not (
    (order_row.status = 'Pending Verification' and p_new_status in ('Processing', 'Cancelled'))
    or (order_row.status = 'Processing' and p_new_status = 'Shipped')
    or (order_row.status = 'Shipped' and p_new_status = 'Fulfilled')
  ) then
    raise exception 'Order status transition is not allowed' using errcode = 'P7A11';
  end if;

  if p_new_status = 'Cancelled' then
    -- Stage A: validate the complete historical snapshot and aggregate all requirements.
    if jsonb_typeof(order_row.items) <> 'array' then
      raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
    end if;
    for order_item in select value from jsonb_array_elements(order_row.items) loop
      if jsonb_typeof(order_item) <> 'object' then
        raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
      end if;
      line_type := coalesce(order_item ->> 'line_type', 'product');
      if line_type = 'product' then
        if nullif(trim(coalesce(order_item ->> 'id', '')), '') is null
           or jsonb_typeof(order_item -> 'quantity') <> 'number'
           or order_item ->> 'quantity' is null then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end if;
        begin
          product_id := (order_item ->> 'id')::uuid;
          line_quantity := (order_item ->> 'quantity')::numeric;
        exception when invalid_text_representation or numeric_value_out_of_range then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end;
        if product_id is null or line_quantity is null
           or line_quantity <= 0 or line_quantity <> trunc(line_quantity) then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end if;
        restock_index := array_position(restock_product_ids, product_id);
        if restock_index is null then
          restock_product_ids := array_append(restock_product_ids, product_id);
          restock_quantities := array_append(restock_quantities, line_quantity);
        else
          restock_quantities[restock_index] := restock_quantities[restock_index] + line_quantity;
        end if;
      elsif line_type = 'promotion' then
        if nullif(trim(coalesce(order_item ->> 'promotion_id', '')), '') is null
           or jsonb_typeof(order_item -> 'quantity') <> 'number'
           or order_item ->> 'quantity' is null
           or jsonb_typeof(order_item -> 'components') <> 'array'
           or jsonb_array_length(order_item -> 'components') = 0 then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end if;
        begin
          product_id := (order_item ->> 'promotion_id')::uuid;
          line_quantity := (order_item ->> 'quantity')::numeric;
        exception when invalid_text_representation or numeric_value_out_of_range then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end;
        if product_id is null or line_quantity is null
           or line_quantity < 1 or line_quantity > 99
           or line_quantity <> trunc(line_quantity) then
          raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
        end if;
        for component_item in select value from jsonb_array_elements(order_item -> 'components') loop
          if jsonb_typeof(component_item) <> 'object'
             or nullif(trim(coalesce(component_item ->> 'product_id', '')), '') is null
             or jsonb_typeof(component_item -> 'quantity_per_bundle') <> 'number'
             or component_item ->> 'quantity_per_bundle' is null then
            raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
          end if;
          begin
            product_id := (component_item ->> 'product_id')::uuid;
            component_quantity := (component_item ->> 'quantity_per_bundle')::numeric;
          exception when invalid_text_representation or numeric_value_out_of_range then
            raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
          end;
          if product_id is null or component_quantity is null
             or component_quantity < 1 or component_quantity > 99
             or component_quantity <> trunc(component_quantity) then
            raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
          end if;
          begin
            restore_quantity := line_quantity * component_quantity;
          exception when numeric_value_out_of_range then
            raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
          end;
          if restore_quantity is null or restore_quantity <= 0
             or restore_quantity <> trunc(restore_quantity) then
            raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
          end if;
          restock_index := array_position(restock_product_ids, product_id);
          if restock_index is null then
            restock_product_ids := array_append(restock_product_ids, product_id);
            restock_quantities := array_append(restock_quantities, restore_quantity);
          else
            restock_quantities[restock_index] := restock_quantities[restock_index] + restore_quantity;
          end if;
        end loop;
      else
        raise exception 'Order inventory snapshot is malformed' using errcode = '22023';
      end if;
    end loop;

    -- Legacy orders never reserved stock. They still transition safely, but do not release it.
    if order_row.inventory_reserved_at is not null then
      -- Stage B: lock and restore only after Stage A has completed successfully.
      for locked_product_id in
        select distinct item_values.value
        from unnest(restock_product_ids) as item_values(value)
        order by item_values.value
      loop
        restock_index := array_position(restock_product_ids, locked_product_id);
        perform 1 from public.products where id = locked_product_id for update;
        if not found then
          raise exception 'Order inventory snapshot references a missing product' using errcode = 'P0002';
        end if;
        update public.products
        set inventory = coalesce(inventory, 0) + restock_quantities[restock_index]
        where id = locked_product_id;
      end loop;

      update public.orders
      set status = 'Cancelled', inventory_released_at = clock_timestamp()
      where id = p_order_id;
    else
      update public.orders
      set status = 'Cancelled'
      where id = p_order_id;
    end if;
  else
    update public.orders
    set status = p_new_status
    where id = p_order_id;
  end if;
end;
$$;

revoke all on function public.update_order_status(uuid, text) from public;
grant execute on function public.update_order_status(uuid, text) to authenticated;
revoke update on public.orders from authenticated;
drop policy if exists orders_admin_update on public.orders;
revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) to anon, authenticated;
revoke all on function public.get_member_orders(text, text) from public;
grant execute on function public.get_member_orders(text, text) to anon, authenticated;
