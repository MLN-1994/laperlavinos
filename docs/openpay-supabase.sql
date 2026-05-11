-- ─────────────────────────────────────────────────────────────────────────────
-- Migración: columna openpay_order_uuid en web_orders
-- Correr en Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE web_orders
  ADD COLUMN IF NOT EXISTS openpay_order_uuid TEXT;

-- Índice para búsqueda rápida desde el webhook
CREATE INDEX IF NOT EXISTS web_orders_openpay_order_uuid_idx
  ON web_orders (openpay_order_uuid)
  WHERE openpay_order_uuid IS NOT NULL;

-- Ampliar el check de status para incluir 'pago_rechazado_openpay' si se quiere
-- (opcional, ya debería estar bien con los estados actuales)
-- Verificar constraint actual:
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'web_orders_status_check';
