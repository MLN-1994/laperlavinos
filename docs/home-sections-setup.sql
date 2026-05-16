-- ──────────────────────────────────────────────────────────────────────────────
-- home_sections: secciones editoriales de la home (El Elegido + Vino del Mes)
-- Ejecutar en Supabase > SQL Editor
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS home_sections (
  tipo            TEXT PRIMARY KEY,          -- 'el_elegido' | 'vino_del_mes'
  producto_id     TEXT,                      -- id del producto seleccionado
  producto_nombre TEXT,                      -- nombre del producto (denormalizado)
  imagen_url      TEXT,                      -- imagen_url del producto (denormalizado)
  titulo          TEXT,                      -- titular grande, ej: "Malbec de altura, Valle de Uco"
  subtitulo       TEXT,                      -- línea pequeña, ej: "EL ELEGIDO · MAYO 2026"
  cita            TEXT,                      -- descripción / frase editorial
  cta_label       TEXT DEFAULT 'Ver más',    -- texto del botón
  cta_href        TEXT DEFAULT '/productos', -- link del botón
  activo          BOOLEAN DEFAULT true,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Filas iniciales (el admin las editará desde el panel)
INSERT INTO home_sections (tipo, titulo, subtitulo, cita, cta_label, cta_href)
VALUES
  (
    'el_elegido',
    'Malbec de altura, Valle de Uco',
    'EL ELEGIDO · MAYO 2026',
    '"Una uva con tensión, mineral, perfecta para asado de fin de semana. Lo elegimos por su balance entre fruta y crianza."',
    'Ver más',
    '/productos?categoria=VINOS+TINTOS'
  ),
  (
    'vino_del_mes',
    'Malbec de altura, Valle de Uco',
    'VINO DEL MES · MAYO 2026 · POR BODEGA DESTACADA',
    '"Una uva con tensión, mineral, perfecta para asado de fin de semana. Lo elegimos por su balance entre fruta y crianza."',
    'Conocer la historia',
    '/productos'
  )
ON CONFLICT (tipo) DO NOTHING;

-- RLS
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read home_sections"
  ON home_sections FOR SELECT USING (true);

CREATE POLICY "Admin write home_sections"
  ON home_sections FOR ALL USING (true);
-- Restringir antes de producción: USING (auth.role() = 'authenticated')
