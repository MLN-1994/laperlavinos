-- Ejecutar en Supabase SQL Editor.
-- Este script alinea la tabla productos_publicados con lo que hoy espera la app.
-- Sirve tanto si la tabla no existe como si existe con un esquema viejo.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.productos_publicados (
  id uuid primary key default gen_random_uuid(),
  hermes_id integer not null,
  nombre text,
  descripcion text,
  precio numeric(12, 2),
  categoria_id text,
  imagen_url text,
  destacado boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.productos_publicados
  add column if not exists nombre text;

alter table public.productos_publicados
  add column if not exists descripcion text;

alter table public.productos_publicados
  add column if not exists precio numeric(12, 2);

alter table public.productos_publicados
  add column if not exists categoria_id text;

alter table public.productos_publicados
  add column if not exists imagen_url text;

alter table public.productos_publicados
  add column if not exists destacado boolean not null default false;

alter table public.productos_publicados
  add column if not exists activo boolean not null default true;

alter table public.productos_publicados
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.productos_publicados
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Si tu tabla vieja tenia fecha_publicacion, la usamos como created_at cuando haga falta.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'productos_publicados'
      and column_name = 'fecha_publicacion'
  ) then
    execute $sql$
      update public.productos_publicados
      set created_at = coalesce(created_at, fecha_publicacion)
      where created_at is null
    $sql$;
  end if;
end
$$;

update public.productos_publicados
set updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where updated_at is null;

create unique index if not exists productos_publicados_hermes_id_key
  on public.productos_publicados(hermes_id);

create index if not exists productos_publicados_activo_idx
  on public.productos_publicados(activo);

create index if not exists productos_publicados_nombre_idx
  on public.productos_publicados(nombre);

drop trigger if exists set_productos_publicados_updated_at on public.productos_publicados;

create trigger set_productos_publicados_updated_at
before update on public.productos_publicados
for each row execute procedure public.set_updated_at();

alter table public.productos_publicados enable row level security;

comment on table public.productos_publicados is 'Productos seleccionados para la web, vinculados por hermes_id.';

-- Verificacion sugerida despues de ejecutar:
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'productos_publicados'
-- order by ordinal_position;