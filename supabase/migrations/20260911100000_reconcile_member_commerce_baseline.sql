-- Reconcile the pre-7A2.2 member-commerce baseline without replaying the
-- destructive installation migration or changing business data.
--
-- This migration only makes the intended ACLs deterministic. Table schemas,
-- RLS policies, function bodies, receipt policies, catalog RPCs, and settings
-- values remain untouched.

do $$
begin
  if to_regclass('public.site_settings') is null then
    raise exception 'Reconciliation prerequisite missing: public.site_settings';
  end if;

  if to_regprocedure('public.review_access_request(uuid,text)') is null then
    raise exception 'Reconciliation prerequisite missing: public.review_access_request(uuid,text)';
  end if;
end
$$;

-- review_access_request is an administrative operation. Remove inherited and
-- explicit anonymous execution while retaining execution for authenticated
-- callers; the function body continues to enforce public.is_admin().
revoke all privileges
  on function public.review_access_request(uuid, text)
  from public, anon, authenticated;
grant execute
  on function public.review_access_request(uuid, text)
  to authenticated;

-- Public settings reads are required by the storefront. Only authenticated
-- callers retain the table privileges used by the existing admin settings
-- workflow; RLS remains the authorization boundary for those writes.
revoke all privileges
  on table public.site_settings
  from public, anon, authenticated;
grant select
  on table public.site_settings
  to anon, authenticated;
grant insert, update, delete
  on table public.site_settings
  to authenticated;
