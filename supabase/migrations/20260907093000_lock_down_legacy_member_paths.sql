-- Migration B: run only after the RPC-based frontend is deployed.
-- This migration removes legacy direct writes and makes receipt objects private.

do $$
begin
  if to_regprocedure('public.submit_access_request(text, text, text)') is null then
    raise exception 'Migration prerequisite missing: public.submit_access_request(text, text, text)';
  end if;
  if to_regprocedure('public.create_member_order(text, text, jsonb, numeric, jsonb, text)') is null then
    raise exception 'Migration prerequisite missing: public.create_member_order(...)';
  end if;
  if to_regclass('public.orders') is null then
    raise exception 'Migration prerequisite missing: public.orders';
  end if;
end
$$;

-- Convert recognized Supabase public receipt URLs to their object paths only.
do $$
declare
  unconverted_count bigint;
begin
  update public.orders
  set receipt_url = regexp_replace(
    receipt_url,
    '^https?://[^/]+/storage/v1/object/public/receipts/([^?#]+)$',
    '\1'
  )
  where receipt_url ~ '^https?://[^/]+/storage/v1/object/public/receipts/[^?#]+$';

  select count(*) into unconverted_count
  from public.orders
  where receipt_url like '%/storage/v1/object/public/receipts/%'
    and receipt_url !~ '^https?://[^/]+/storage/v1/object/public/receipts/[^?#]+$';

  if unconverted_count > 0 then
    raise warning 'Receipt migration skipped % legacy receipt URLs with an unrecognized format', unconverted_count;
  end if;
end
$$;

-- Close legacy direct membership writes. The RPC remains executable by anon/authenticated.
drop policy if exists access_requests_insert on public.access_requests;
revoke insert on public.access_requests from public, anon, authenticated;

-- Close legacy direct order writes. Admin SELECT/UPDATE remains available.
drop policy if exists orders_insert on public.orders;
revoke insert on public.orders from public, anon, authenticated;

-- Remove the transition-time public referral table read. Admin table access remains.
drop policy if exists referral_codes_select on public.referral_codes;
revoke select on public.referral_codes from anon;

-- Preserve the existing bucket and file limits, but make receipt objects private.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf']::text[]
where id = 'receipts';

drop policy if exists receipts_transition_upload on storage.objects;
drop policy if exists receipts_anon_upload on storage.objects;
drop policy if exists receipts_admin_read on storage.objects;
drop policy if exists receipts_read_restrictive on storage.objects;
drop policy if exists receipts_insert_restrictive on storage.objects;

-- Restrictive policies close any permissive legacy Storage policies for receipts
-- without changing access rules for other buckets.
create policy receipts_read_restrictive on storage.objects
  as restrictive
  for select to public
  using (bucket_id <> 'receipts' or public.is_admin());

create policy receipts_insert_restrictive on storage.objects
  as restrictive
  for insert to public
  with check (
    bucket_id <> 'receipts'
    or (
      bucket_id = 'receipts'
      and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
    )
  );

create policy receipts_anon_upload on storage.objects
  for insert to anon
  with check (
    bucket_id = 'receipts'
    and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
  );

create policy receipts_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and public.is_admin());

-- Clear historical payment placeholders only when all three values match.
update public.site_settings
set value = jsonb_set(
  jsonb_set(
    jsonb_set(value, '{bank,bankName}', '""'::jsonb, true),
    '{bank,accountName}', '""'::jsonb, true
  ),
  '{bank,accountNumber}', '""'::jsonb, true
),
updated_at = now()
where key = 'global'
  and value #>> '{bank,bankName}' = 'Guaranty Trust Bank (GTB)'
  and value #>> '{bank,accountName}' = 'Botanical Wellness Ltd'
  and value #>> '{bank,accountNumber}' = '0123456789';
