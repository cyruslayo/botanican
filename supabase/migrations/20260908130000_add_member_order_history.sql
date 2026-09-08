-- Member-scoped order history.
-- Customers keep no direct SELECT privilege on public.orders.
-- This RPC returns only the approved member's order summary fields.

create or replace function public.get_member_orders(
  p_instagram_handle text,
  p_phone text
)
returns table (
  id uuid,
  items jsonb,
  total numeric,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
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

  if normalized_handle = '' or length(phone_digits) < 7 then
    raise exception 'Valid member identity is required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.access_requests ar
    where ar.status = 'approved'
      and lower(trim(ar.instagram_handle)) = normalized_handle
      and regexp_replace(coalesce(ar.phone, ''), '[^0-9]', '', 'g') = phone_digits
  ) then
    raise exception 'Approved membership is required to view order history' using errcode = '42501';
  end if;

  return query
  select
    o.id,
    o.items,
    o.total,
    o.status,
    o.created_at
  from public.orders o
  where lower(trim(o.user_id)) = normalized_handle
    and regexp_replace(coalesce(o.shipping_address ->> 'phone', ''), '[^0-9]', '', 'g') = phone_digits
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_member_orders(text, text) from public;
grant execute on function public.get_member_orders(text, text) to anon, authenticated;
