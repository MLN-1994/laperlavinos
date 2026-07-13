-- Fix de overflow en sync de catalogo Hermes -> Supabase
-- Fecha: 2026-06-17
-- Contexto: la vista public.vista_catalogo_web depende de public.hermes_erp_snapshot.precio_base,
-- por eso no se puede alterar el tipo sin recrear la vista.

-- 1) Backup rapido de la definicion actual de la vista
SELECT pg_get_viewdef('public.vista_catalogo_web'::regclass, true);

-- 2) Migracion atomica
BEGIN;

DROP VIEW IF EXISTS public.vista_catalogo_web;

ALTER TABLE public.hermes_erp_snapshot
  ALTER COLUMN precio_base TYPE NUMERIC(18,2);

ALTER TABLE public.hermes_erp_snapshot
  ALTER COLUMN stock_disponible TYPE NUMERIC(18,3);

CREATE VIEW public.vista_catalogo_web AS
SELECT
  pp.id AS producto_id,
  pp.hermes_id,
  COALESCE(snap.nombre, pp.nombre) AS nombre,
  pp.descripcion AS descripcion_comercial,
  COALESCE(snap.precio_base, pp.precio) AS precio_base,
  pp.en_oferta,
  pp.descuento_porcentaje,
  CASE
    WHEN pp.en_oferta AND pp.descuento_porcentaje > 0
    THEN ROUND(COALESCE(snap.precio_base, pp.precio) * (1 - pp.descuento_porcentaje / 100.0))
    ELSE COALESCE(snap.precio_base, pp.precio)
  END AS precio_final,
  snap.stock_disponible,
  snap.activo_en_erp,
  snap.grupo,
  snap.marca,
  pp.imagen_url,
  pp.destacado,
  pp.activo AS publicado_activo,
  snap.last_sync_at
FROM public.productos_publicados pp
LEFT JOIN public.hermes_erp_snapshot snap ON snap.hermes_id = pp.hermes_id
WHERE pp.activo = TRUE;

COMMIT;

-- 3) Verificacion de precision aplicada
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'hermes_erp_snapshot'
  AND column_name IN ('precio_base', 'stock_disponible')
ORDER BY column_name;

-- 4) Verificacion rapida de salud del snapshot
SELECT
  MAX(last_sync_at) AS ultimo_sync_ok,
  COUNT(*) AS total_snapshot,
  SUM(CASE WHEN activo_en_erp THEN 1 ELSE 0 END) AS activos_snapshot
FROM public.hermes_erp_snapshot;

-- 5) Despues de ejecutar este script:
-- - Ir a GitHub Actions
-- - Ejecutar manualmente: Catalog Sync & Process Events
-- - Confirmar que ambos steps terminan con HTTP 200
