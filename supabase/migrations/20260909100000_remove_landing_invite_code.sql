-- Remove the retired public landing invite code without changing other global settings.
update public.site_settings
set value = value - 'landingInviteCode',
    updated_at = now()
where key = 'global'
  and value ? 'landingInviteCode';
