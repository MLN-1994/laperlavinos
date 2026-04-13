-- Ejecutar en Supabase SQL Editor.

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

create table if not exists public.web_orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pendiente',
  payment_status text,
  external_reference text not null unique,
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  buyer_name text not null,
  buyer_email text,
  buyer_phone text,
  buyer_document_type text,
  buyer_document_number text,
  buyer_address text,
  subtotal_amount numeric(12, 2),
  shipping_amount numeric(12, 2),
  shipping_provider text,
  shipping_service text,
  shipping_payload jsonb,
  total_amount numeric(12, 2) not null,
  currency_id text not null default 'ARS',
  raw_checkout_payload jsonb,
  raw_webhook_payload jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint web_orders_status_check check (
    status in (
      'pendiente',
      'checkout_generado',
      'pago_aprobado',
      'pago_rechazado',
      'pago_cancelado',
      'error_webhook',
      'pendiente_integracion_hermes',
      'integrado_hermes'
    )
  ),
  constraint web_orders_payment_status_check check (
    payment_status is null
    or payment_status in (
      'pending',
      'in_process',
      'approved',
      'rejected',
      'cancelled',
      'refunded',
      'charged_back'
    )
  ),
  constraint web_orders_subtotal_amount_check check (subtotal_amount is null or subtotal_amount >= 0),
  constraint web_orders_shipping_amount_check check (shipping_amount is null or shipping_amount >= 0),
  constraint web_orders_total_amount_check check (total_amount >= 0)
);

create table if not exists public.web_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.web_orders(id) on delete cascade,
  product_id text not null,
  hermes_id integer,
  title text not null,
  quantity integer not null,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  product_snapshot jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint web_order_items_quantity_check check (quantity > 0),
  constraint web_order_items_unit_price_check check (unit_price >= 0),
  constraint web_order_items_line_total_check check (line_total >= 0)
);

create index if not exists web_orders_status_idx
  on public.web_orders(status);

create index if not exists web_orders_created_at_idx
  on public.web_orders(created_at desc);

create index if not exists web_orders_payment_status_idx
  on public.web_orders(payment_status);

create index if not exists web_order_items_order_id_idx
  on public.web_order_items(order_id);

drop trigger if exists set_web_orders_updated_at on public.web_orders;

create trigger set_web_orders_updated_at
before update on public.web_orders
for each row execute procedure public.set_updated_at();

alter table public.web_orders enable row level security;
alter table public.web_order_items enable row level security;

drop policy if exists "Bloquear acceso directo web_orders" on public.web_orders;
create policy "Bloquear acceso directo web_orders"
on public.web_orders
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Bloquear acceso directo web_order_items" on public.web_order_items;
create policy "Bloquear acceso directo web_order_items"
on public.web_order_items
for all
to anon, authenticated
using (false)
with check (false);

comment on table public.web_orders is 'Pedidos web internos para trazabilidad de checkout y pagos.';
comment on table public.web_order_items is 'Items asociados a cada pedido web.';