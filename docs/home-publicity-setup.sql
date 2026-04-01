-- Ejecutar en Supabase SQL Editor en 3 bloques separados.

-- BLOQUE 1
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

alter table public.home_publicity enable row level security;


-- BLOQUE 2
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
  'Valido para todos los productos con codigo RG2026',
  'Catalogo de Regalos 2026',
  'Descargar PDF',
  null,
  true,
  '[
    {"title":"Envio gratis","description":"CABA y AMBA desde 200.000","icon":"truck"},
    {"title":"3 cuotas sin interes","description":"Tarjetas bancarias Amex, Visa y Master.","icon":"card"},
    {"title":"15% pagando con transferencia","description":"No incluye regalos y cajas navidenas.","icon":"banknotes"}
  ]'::jsonb
)
on conflict (id) do nothing;


-- BLOQUE 3
drop policy if exists "Admin write home_publicity" on public.home_publicity;

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
);

drop policy if exists "Public read home_publicity" on public.home_publicity;

create policy "Public read home_publicity"
on public.home_publicity
for select
using (true);


-- VERIFICACION
select * from public.home_publicity;