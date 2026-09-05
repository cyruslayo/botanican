-- Add optional, administrator-controlled tincture and batch metadata.
alter table public.products
  add column if not exists strength_mg numeric null,
  add column if not exists bottle_size_ml numeric null,
  add column if not exists strain_name text null,
  add column if not exists batch_code text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_strength_mg_non_negative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_strength_mg_non_negative
      check (strength_mg is null or strength_mg >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_bottle_size_ml_non_negative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_bottle_size_ml_non_negative
      check (bottle_size_ml is null or bottle_size_ml >= 0);
  end if;
end $$;
