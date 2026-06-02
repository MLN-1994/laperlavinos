-- ─────────────────────────────────────────────────────────────────────────────
-- hermes_erp_snapshot
-- Tabla de caché de productos leídos desde la vista_articulos de Hermes.
-- Sirve como read model para checkout y catálogo web (evita queries live a MySQL).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE hermes_erp_snapshot (
  hermes_id         BIGINT        PRIMARY KEY,
  nombre            TEXT          NOT NULL,
  descripcion       TEXT          NOT NULL DEFAULT '',
  precio_base       NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_disponible  NUMERIC(12,3) NOT NULL DEFAULT 0,
  grupo             TEXT,
  marca             TEXT,
  activo_en_erp     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_sync_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices útiles para filtros del catálogo
CREATE INDEX idx_hermes_snapshot_activo  ON hermes_erp_snapshot (activo_en_erp);
CREATE INDEX idx_hermes_snapshot_grupo   ON hermes_erp_snapshot (grupo) WHERE activo_en_erp = TRUE;
CREATE INDEX idx_hermes_snapshot_stock   ON hermes_erp_snapshot (stock_disponible) WHERE activo_en_erp = TRUE;

-- Trigger para mantener updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hermes_snapshot_updated_at
BEFORE UPDATE ON hermes_erp_snapshot
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: la tabla es interna (leída solo por service role desde el worker).
-- El anon/user no necesita acceso directo; se expone via API route o vista.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE hermes_erp_snapshot ENABLE ROW LEVEL SECURITY;

-- Solo el service role puede leer/escribir (las API routes usan service role key)
-- Nota: el service role bypasea RLS por defecto en Supabase, por lo que estas
-- policies protegen acceso desde clientes con anon/user key.
CREATE POLICY "Solo service role" ON hermes_erp_snapshot
  USING (FALSE);  -- bloquea todo acceso desde anon/user; service role bypasea RLS

-- ─────────────────────────────────────────────────────────────────────────────
-- Vista opcional: productos listos para mostrar en el catálogo web
-- (join con productos_publicados para obtener overrides comerciales)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_catalogo_web AS
SELECT
  pp.id                       AS producto_id,
  pp.hermes_id,
  COALESCE(snap.nombre, pp.nombre)  AS nombre,
  pp.descripcion              AS descripcion_comercial,
  COALESCE(snap.precio_base, pp.precio) AS precio_base,
  pp.en_oferta,
  pp.descuento_porcentaje,
  CASE
    WHEN pp.en_oferta AND pp.descuento_porcentaje > 0
    THEN ROUND(COALESCE(snap.precio_base, pp.precio) * (1 - pp.descuento_porcentaje / 100.0))
    ELSE COALESCE(snap.precio_base, pp.precio)
  END                         AS precio_final,
  snap.stock_disponible,
  snap.activo_en_erp,
  snap.grupo,
  snap.marca,
  pp.imagen_url,
  pp.destacado,
  pp.activo                   AS publicado_activo,
  snap.last_sync_at
FROM productos_publicados pp
LEFT JOIN hermes_erp_snapshot snap ON snap.hermes_id = pp.hermes_id
WHERE pp.activo = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migración: si ya creaste la tabla con INTEGER, correr esto antes de sync:test
-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER TABLE hermes_erp_snapshot ALTER COLUMN hermes_id TYPE BIGINT;
