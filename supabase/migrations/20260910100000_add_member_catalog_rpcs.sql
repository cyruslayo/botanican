-- Add approved-member catalog RPCs without changing the existing products
-- table access used by the current storefront.

create or replace function public.get_member_catalog(
  p_instagram_handle text,
  p_phone text,
  p_category text
)
returns table (
  id uuid,
  slug text,
  name text,
  price numeric,
  category text,
  image text,
  is_available boolean,
  strength_mg numeric,
  bottle_size_ml numeric,
  strain_name text,
  batch_code text
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
    select 1
    from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Member catalog access is not available' using errcode = '42501';
  end if;

  if nullif(trim(coalesce(p_category, '')), '') is null then
    raise exception 'Catalog category is required' using errcode = '22023';
  end if;

  return query
  select
    p.id,
    p.slug,
    p.name,
    p.price,
    p.category,
    p.image,
    (p.inventory > 0) as is_available,
    p.strength_mg,
    p.bottle_size_ml,
    p.strain_name,
    p.batch_code
  from public.products p
  where p.is_active is true
    and p.category = p_category
  order by p.created_at desc;
end;
$$;

create or replace function public.get_member_product(
  p_instagram_handle text,
  p_phone text,
  p_slug text
)
returns table (
  id uuid,
  slug text,
  name text,
  price numeric,
  category text,
  image text,
  is_available boolean,
  strength_mg numeric,
  bottle_size_ml numeric,
  strain_name text,
  batch_code text,
  description text
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
    select 1
    from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Member catalog access is not available' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.slug,
    p.name,
    p.price,
    p.category,
    p.image,
    (p.inventory > 0) as is_available,
    p.strength_mg,
    p.bottle_size_ml,
    p.strain_name,
    p.batch_code,
    p.description
  from public.products p
  where p.is_active is true
    and p.slug = p_slug;
end;
$$;

revoke all on function public.get_member_catalog(text, text, text) from public;
grant execute on function public.get_member_catalog(text, text, text) to anon, authenticated;

revoke all on function public.get_member_product(text, text, text) from public;
grant execute on function public.get_member_product(text, text, text) to anon, authenticated;
