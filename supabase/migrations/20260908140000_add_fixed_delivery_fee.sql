-- Add the fixed Abuja delivery fee to new orders.
-- Existing orders keep shipping_fee = 0 and retain their historical totals.

alter table public.orders
  add column if not exists shipping_fee numeric not null default 0;

create or replace function public.create_member_order(
  p_instagram_handle text,
  p_phone text,
  p_items jsonb,
  p_total numeric,
  p_shipping_address jsonb,
  p_receipt_url text
)
returns uuid
language plpgsql security definer set search_path = public
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
  calculated_subtotal numeric := 0;
  delivery_fee numeric := 5000;
  calculated_total numeric;
  trusted_items jsonb := '[]'::jsonb;
begin
  normalized_handle := case
    when left(lower(trim(coalesce(p_instagram_handle, ''))), 1) = '@' then lower(trim(p_instagram_handle))
    else '@' || lower(trim(p_instagram_handle))
  end;
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  if normalized_handle = '@' or length(phone_digits) = 0 then
    raise exception 'Instagram handle and phone number are required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.access_requests ar
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
     or p_shipping_address is null or nullif(trim(coalesce(p_receipt_url, '')), '') is null then
    raise exception 'Order items, shipping address, and receipt are required' using errcode = '22023';
  end if;
  if p_receipt_url !~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$' then
    raise exception 'Receipt path is invalid' using errcode = '22023';
  end if;
  if not exists (
    select 1 from storage.objects where bucket_id = 'receipts' and name = p_receipt_url
  ) then
    raise exception 'Receipt object does not exist' using errcode = '22023';
  end if;
  if lower(trim(coalesce(p_shipping_address ->> 'instagramHandle', ''))) <> normalized_handle
     or regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '[^0-9]', '', 'g') <> phone_digits then
    raise exception 'Shipping identity does not match approved membership' using errcode = '42501';
  end if;

  for submitted_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(submitted_item) <> 'object'
       or nullif(trim(coalesce(submitted_item ->> 'id', '')), '') is null then
      raise exception 'Every order item must include a product ID' using errcode = '22023';
    end if;
    begin
      submitted_product_id := (submitted_item ->> 'id')::uuid;
    exception when invalid_text_representation then
      raise exception 'Unknown product ID: %', submitted_item ->> 'id' using errcode = '22023';
    end;
    select * into product_row from public.products where id = submitted_product_id;
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
    select coalesce(sum((items.value ->> 'quantity')::numeric), 0) into submitted_quantity_total
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
    trusted_items := trusted_items || jsonb_build_array(jsonb_build_object(
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
    ));
    calculated_subtotal := calculated_subtotal + product_row.price * submitted_quantity;
  end loop;

  calculated_total := calculated_subtotal + delivery_fee;

  if p_total is null or p_total <> calculated_total then
    raise exception 'Submitted order total does not match current product prices and delivery fee' using errcode = '22023';
  end if;
  insert into public.orders (user_id, items, total, shipping_fee, status, shipping_address, receipt_url)
  values (normalized_handle, trusted_items, calculated_total, delivery_fee, 'Pending Verification', p_shipping_address, p_receipt_url)
  returning id into created_order_id;
  return created_order_id;
end;
$$;

revoke all on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) from public;
grant execute on function public.create_member_order(text, text, jsonb, numeric, jsonb, text) to anon, authenticated;
