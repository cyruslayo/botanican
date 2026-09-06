-- Create the Botanica journal article store.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  title text not null,
  subtitle text,

  category text not null default 'Monograph',
  volume text default 'Vol. I',
  issue text default 'Issue 01',
  date text default 'September 2026',
  read_time text default '5 min read',

  author_name text default 'Botanica Editorial',
  author_role text default 'Apothecary Journal',

  image_url text,
  thesis text,
  excerpt text,

  content jsonb default '[]'::jsonb,
  key_takeaways jsonb default '[]'::jsonb,

  is_featured boolean default false,

  status text not null default 'published'
    check (status in ('draft', 'published')),

  related_product_slug text,
  related_product_name text,

  callout jsonb default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_created_at_idx
  on public.articles (created_at desc);

create index if not exists articles_status_created_at_idx
  on public.articles (status, created_at desc);

alter table public.articles enable row level security;

-- Remove default browser privileges first.
revoke all on table public.articles from anon, authenticated;

-- Public visitors and signed-in users may read articles.
grant select on table public.articles to anon, authenticated;

-- Only authenticated sessions can attempt writes.
-- RLS decides whether that authenticated user is an admin.
grant insert, update, delete on table public.articles to authenticated;

drop policy if exists articles_public_read
  on public.articles;

create policy articles_public_read
  on public.articles
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists articles_admin_read
  on public.articles;

create policy articles_admin_read
  on public.articles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists articles_admin_insert
  on public.articles;

create policy articles_admin_insert
  on public.articles
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists articles_admin_update
  on public.articles;

create policy articles_admin_update
  on public.articles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists articles_admin_delete
  on public.articles;

create policy articles_admin_delete
  on public.articles
  for delete
  to authenticated
  using (public.is_admin());
