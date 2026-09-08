-- Fix checkout receipt uploads without making receipt objects publicly readable.
-- Supabase Storage may SELECT inserted object metadata while completing an upload.
-- Permit that SELECT only for the upload operation itself.

drop policy if exists receipts_anon_upload on storage.objects;
drop policy if exists receipts_checkout_upload on storage.objects;
drop policy if exists receipts_upload_returning_select on storage.objects;
drop policy if exists receipts_admin_read on storage.objects;
drop policy if exists receipts_read_restrictive on storage.objects;
drop policy if exists receipts_insert_restrictive on storage.objects;

create policy receipts_read_restrictive on storage.objects
  as restrictive for select to public
  using (
    bucket_id <> 'receipts'
    or public.is_admin()
    or storage.allow_only_operation('storage.object.upload')
  );

create policy receipts_insert_restrictive on storage.objects
  as restrictive for insert to public
  with check (
    bucket_id <> 'receipts'
    or name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
  );

create policy receipts_checkout_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'receipts'
    and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
  );

create policy receipts_upload_returning_select on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'receipts'
    and name ~ '^receipts/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and storage.allow_only_operation('storage.object.upload')
  );

create policy receipts_admin_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and public.is_admin()
  );
