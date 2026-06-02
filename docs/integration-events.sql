-- ─────────────────────────────────────────────────────────────────────────────
-- integration_events — Tabla outbox/retry para integración con Hermes ERP
-- ─────────────────────────────────────────────────────────────────────────────
-- Ejecutar en el SQL Editor de Supabase.
-- Propósito: garantizar que cada venta aprobada sea registrada en Hermes,
-- incluso si la conexión MySQL falla momentáneamente.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS integration_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      text        NOT NULL,                          -- 'hermes_venta'
  web_order_id    uuid        NOT NULL,
  idempotency_key text        UNIQUE NOT NULL,                   -- 'hermes_venta:{web_order_id}'
  status          text        NOT NULL DEFAULT 'pending',        -- pending | processing | done | failed | dead
  retry_count     int         NOT NULL DEFAULT 0,
  next_retry_at   timestamptz NOT NULL DEFAULT now(),
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Índice para que el procesador de eventos sea eficiente
CREATE INDEX IF NOT EXISTS idx_integration_events_pending
  ON integration_events(status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- RLS: solo el service role puede leer/escribir
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on integration_events"
  ON integration_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger para mantener updated_at al día
-- (Si el trigger update_updated_at_column ya existe de otra tabla, omitir la función)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integration_events_updated_at
  BEFORE UPDATE ON integration_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
