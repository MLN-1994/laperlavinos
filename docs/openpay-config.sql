-- Tabla para guardar credenciales de OpenPay desde el panel admin
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS openpay_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  environment  TEXT NOT NULL DEFAULT 'production',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo una fila activa (upsert siempre sobrescribe)
-- Sin RLS publica; acceso solo via service_role desde el servidor
ALTER TABLE openpay_config ENABLE ROW LEVEL SECURITY;

-- Ninguna policy publica: el service_role bypasea RLS automaticamente
-- (no se necesita policy adicional)
