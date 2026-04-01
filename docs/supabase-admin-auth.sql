-- Tabla de perfiles para marcar que usuarios pueden entrar al panel admin.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'productos_publicados'
  ) then
    execute 'alter table public.productos_publicados enable row level security';
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'banners'
  ) then
    execute 'alter table public.banners enable row level security';
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'home_publicity'
  ) then
    execute 'alter table public.home_publicity enable row level security';
  end if;
end
$$;

create table if not exists public.home_publicity (
  id text primary key default 'home',
  promo_active boolean not null default true,
  promo_title text not null,
  promo_subtitle text not null,
  promo_heading text not null,
  promo_cta_label text not null,
  promo_cta_href text,
  benefits_active boolean not null default true,
  benefit_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_publicity_singleton check (id = 'home')
);

alter table public.home_publicity add column if not exists promo_active boolean not null default true;
alter table public.home_publicity add column if not exists benefits_active boolean not null default true;

insert into public.home_publicity (
  id,
  promo_active,
  promo_title,
  promo_subtitle,
  promo_heading,
  promo_cta_label,
  promo_cta_href,
  benefits_active,
  benefit_items
)
values (
  'home',
  true,
  '12 Cuotas Sin Interés + 10% Off Pagando con American Express',
  'Válido para todos los productos con código RG2026',
  'Catálogo de Regalos 2026',
  'Descargar PDF',
  null,
  true,
  '[
    {"title":"Envio gratis","description":"CABA y AMBA desde 200.000","icon":"truck"},
    {"title":"3 cuotas sin interés","description":"Tarjetas bancarias Amex, Visa y Master.","icon":"card"},
    {"title":"15% pagando con transferencia","description":"No incluye regalos y cajas navideñas.","icon":"banknotes"}
  ]'::jsonb
)
on conflict (id) do nothing;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- Completa perfiles para usuarios que ya existian en Auth antes de crear el trigger.
insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do update set email = excluded.email;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Marca manualmente al primer administrador.
-- Reemplaza el email por el usuario que usara el panel.
-- Si prefieres hacerlo despues, puedes dejar esta linea comentada y ejecutar el update por separado.
update public.profiles
set is_admin = true,
    updated_at = now()
where email = 'admin@laperlavinos.com';

-- Politicas sugeridas para tablas que hoy escribe el frontend del admin.
-- Ajustalas si cambias los nombres de las tablas o el flujo de negocio.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'productos_publicados'
  ) then
    execute 'drop policy if exists "Admin write productos_publicados" on public.productos_publicados';
    execute $policy$
      create policy "Admin write productos_publicados"
      on public.productos_publicados
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
    $policy$;

    execute 'drop policy if exists "Public read productos_publicados" on public.productos_publicados';
    execute $policy$
      create policy "Public read productos_publicados"
      on public.productos_publicados
      for select
      using (true)
    $policy$;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'banners'
  ) then
    execute 'drop policy if exists "Admin write banners" on public.banners';
    execute $policy$
      create policy "Admin write banners"
      on public.banners
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
    $policy$;

    execute 'drop policy if exists "Public read banners" on public.banners';
    execute $policy$
      create policy "Public read banners"
      on public.banners
      for select
      using (true)
    $policy$;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'home_publicity'
  ) then
    execute 'drop policy if exists "Admin write home_publicity" on public.home_publicity';
    execute $policy$
      create policy "Admin write home_publicity"
      on public.home_publicity
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
    $policy$;

    execute 'drop policy if exists "Public read home_publicity" on public.home_publicity';
    execute $policy$
      create policy "Public read home_publicity"
      on public.home_publicity
      for select
      using (true)
    $policy$;
  end if;
end
$$;

-- Si la tienda necesita lectura publica de productos publicados y banners, manten estas policies.

-- Ejemplo para el bucket de imagenes de productos.
drop policy if exists "Public read productos bucket" on storage.objects;
create policy "Public read productos bucket"
on storage.objects
for select
using (bucket_id = 'productos');

drop policy if exists "Admin upload productos bucket" on storage.objects;
create policy "Admin upload productos bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'productos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

drop policy if exists "Admin update productos bucket" on storage.objects;
create policy "Admin update productos bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  bucket_id = 'productos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

drop policy if exists "Admin delete productos bucket" on storage.objects;
create policy "Admin delete productos bucket"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

-- Verificacion rapida despues de ejecutar:
-- select id, email, is_admin from public.profiles order by created_at desc;
-- select schemaname, tablename, policyname from pg_policies where schemaname in ('public', 'storage') order by tablename, policyname;
-- Flujo sugerido para el primer admin:
-- 1. Ejecutar este script.
-- 2. Crear el usuario en Supabase Auth si todavia no existe.
-- 3. Volver a correr solo el update de is_admin si el usuario fue creado despues del script.
-- 4. Entrar por /admin-login y luego abrir /admin.