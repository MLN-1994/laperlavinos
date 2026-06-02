/**
 * Script de prueba local del Catalog Sync Worker.
 * Ejecutar desde la raíz del proyecto:
 *
 *   npx tsx --env-file .env.local scripts/test-catalog-sync.ts
 *
 * Requiere que .env.local tenga:
 *   HERMES_HOST, HERMES_USER, HERMES_PASSWORD, HERMES_DATABASE, HERMES_PORT
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * No toca datos de producción si apuntás a un proyecto Supabase de staging.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { runCatalogSync } from '@/lib/hermesSync';

// ── Validar env vars ──────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'HERMES_HOST',
  'HERMES_USER',
  'HERMES_PASSWORD',
  'HERMES_DATABASE',
  'HERMES_PORT',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno:', missing.join(', '));
  console.error('   Asegurate de correr: npx tsx --env-file .env.local scripts/test-catalog-sync.ts');
  process.exit(1);
}

// ── Cliente Supabase ──────────────────────────────────────────────────────────

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ── Modo dry-run: si pasás --dry-run, solo lista los productos de Hermes ──────

const isDryRun = process.argv.includes('--dry-run');

async function dryRun() {
  const { fetchAllHermesRows } = await import('@/lib/hermesClient');
  console.log('🔍 DRY RUN — leyendo productos desde Hermes...\n');
  const rows = await fetchAllHermesRows(10_000);
  console.log(`   Filas recibidas: ${rows.length}`);
  if (rows.length > 0) {
    console.log('   Muestra (primeras 5):');
    rows.slice(0, 5).forEach((r, i) => {
      console.log(`   [${i + 1}] Codigo=${r.Codigo} | ${r.Descripcion} | Precio=${r.Precio} | Stock=${r.Stock} | Grupo=${r.Grupo}`);
    });
  }
}

async function fullSync() {
  console.log('🚀 Ejecutando runCatalogSync...\n');
  const result = await runCatalogSync(supabase, 10_000);

  console.log('─── Resultado ───────────────────────────────────────');
  console.log(`  Filas leídas de Hermes : ${result.fetched}`);
  console.log(`  Upserted en Supabase   : ${result.upserted}`);
  console.log(`  Desactivados (bajas)   : ${result.deactivated}`);
  console.log(`  Duración               : ${result.durationMs} ms`);
  if (result.error) {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  } else {
    console.log('\n✅ Sync exitoso.');
  }
}

(async () => {
  try {
    if (isDryRun) {
      await dryRun();
    } else {
      await fullSync();
    }
  } catch (err) {
    console.error('❌ Excepción no manejada:', err);
    process.exit(1);
  }
  process.exit(0);
})();
