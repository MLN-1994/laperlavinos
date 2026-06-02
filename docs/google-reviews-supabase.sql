-- Sistema de resenas estilo Google para Home
-- Ejecutar en Supabase SQL Editor

create table if not exists public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  source_tag text not null default '@Google',
  published_ago text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null,
  source_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_client_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_client_reviews_updated_at on public.client_reviews;
create trigger trg_client_reviews_updated_at
before update on public.client_reviews
for each row
execute function public.set_client_reviews_updated_at();

alter table public.client_reviews enable row level security;

-- Lectura publica para que se vean en la web
create policy if not exists "Public read client reviews"
on public.client_reviews
for select
using (is_active = true);

-- Escritura solo para usuarios autenticados (admin en Supabase)
create policy if not exists "Authenticated insert client reviews"
on public.client_reviews
for insert
to authenticated
with check (true);

create policy if not exists "Authenticated update client reviews"
on public.client_reviews
for update
to authenticated
using (true)
with check (true);

create policy if not exists "Authenticated delete client reviews"
on public.client_reviews
for delete
to authenticated
using (true);

create index if not exists idx_client_reviews_active_sort
on public.client_reviews (is_active, sort_order, created_at desc);

-- Carga inicial: ultimos 3 comentarios compartidos
insert into public.client_reviews (
  author_name,
  source_tag,
  published_ago,
  rating,
  review_text,
  sort_order,
  source_url,
  is_active
)
values
  (
    'Mariana Oyague',
    '@Google',
    'hace 9 meses',
    4,
    'Bueno precios buena atencion',
    1,
    null,
    true
  ),
  (
    'Martin Cardena',
    '@Google',
    'hace 3 anos',
    4,
    'Excelente atencion, algunas cosas en precio razonable, otras un poco alto.',
    2,
    null,
    true
  ),
  (
    'Daniel Tarayre',
    '@Google',
    'hace un ano',
    5,
    'Buena atencion y buena variedad',
    3,
    null,
    true
  );
