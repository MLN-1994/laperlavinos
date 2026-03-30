create extension if not exists pgcrypto;

create table if not exists public.mercado_pago_accounts (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null unique,
  user_id bigint,
  nickname text,
  email text,
  country_id text,
  public_key text,
  access_token text not null,
  refresh_token text,
  token_type text,
  scope text,
  live_mode boolean,
  expires_in integer,
  expires_at timestamptz,
  connected_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.mercado_pago_accounts enable row level security;

drop policy if exists "Bloquear acceso anon a MP accounts" on public.mercado_pago_accounts;
create policy "Bloquear acceso anon a MP accounts"
on public.mercado_pago_accounts
for all
to anon, authenticated
using (false)
with check (false);