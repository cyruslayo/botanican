-- Repair the secure order worker's ambiguous timestamp variable.
-- PostgreSQL parses CURRENT_TIME as time with time zone inside SQL expressions,
-- so use an unambiguous PL/pgSQL variable for the shared order instant.

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
  v_now timestamptz := clock_timestamp();
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
    if promotion_row.starts_at is not null and v_now < promotion_row.starts_at then
      raise exception 'PROMOTION_NOT_STARTED' using errcode = 'P7A03';
    end if;
    if promotion_row.ends_at is not null and v_now >= promotion_row.ends_at then
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
    'Pending Verification', p_shipping_address, p_receipt_url, v_now
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

revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) to service_role;
