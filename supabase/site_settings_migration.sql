create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all using (public.is_admin());

insert into public.site_settings (key, value)
values (
  'global',
  jsonb_build_object(
    'bank', jsonb_build_object(
      'bankName', 'Guaranty Trust Bank (GTB)',
      'accountName', 'Botanical Wellness Ltd',
      'accountNumber', '0123456789',
      'dispatchNote', 'Orders are dispatched via private courier directly within Abuja (FCT).'
    ),
    'announcement', jsonb_build_object(
      'enabled', false,
      'message', 'Autumn Harvest BT-2481 is now available for approved members.',
      'linkText', 'Explore Oils',
      'linkUrl', '/oils'
    ),
    'heroTrustBadge', 'Members Only · Application Required',
    'apothecaryCalloutTitle', 'Looking for the Apothecary Collection?',
    'apothecaryCalloutSubtitle', 'Our tinctures are batched in limited micro-volumes. Enter your reader invite code to browse current bottle drops.'
  )
)
on conflict (key) do nothing;
