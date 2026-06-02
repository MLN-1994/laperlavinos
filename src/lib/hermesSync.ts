/**
 * hermesSync.ts
 * Lógica pura de sincronización Hermes → Supabase (hermes_erp_snapshot).
 *
 * Estrategia: full-sync incremental por diferencia de conjuntos.
 *   1. Traer todos los registros de Hermes.
 *   2. Upsert bulk en Supabase (ON CONFLICT hermes_id → UPDATE).
 *   3. Marcar activo_en_erp=false para IDs que desaparecieron de la vista.
 *
 * Sin side effects de HTTP: esta lib no hace fetch() ni usa NextResponse.
 * El caller (API route o cron) inyecta el cliente Supabase.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { fetchAllHermesRows, type HermesRawRow } from '@/lib/hermesClient';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SnapshotInsert = Database['public']['Tables']['hermes_erp_snapshot']['Insert'];

export interface SyncResult {
  fetched: number;
  upserted: number;
  deactivated: number;
  durationMs: number;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parsea y normaliza una fila cruda de Hermes. Devuelve null si el Codigo es inválido.
 *  Notas:
 *  - Hermes usa IDs negativos (ej. -100205) — son válidos.
 *  - Se descartan: 0, NaN, y valores fuera de Number.MAX_SAFE_INTEGER (pérdida de precisión JS). */
function parseRow(row: HermesRawRow, syncedAt: string): SnapshotInsert | null {
  const hermesId = parseInt(String(row.Codigo), 10);
  if (!Number.isFinite(hermesId) || hermesId === 0) return null;
  if (!Number.isSafeInteger(hermesId)) {
    console.warn(`[hermesSync] Codigo fuera de rango seguro, omitido: ${row.Codigo}`);
    return null;
  }

  return {
    hermes_id: hermesId,
    nombre: row.Descripcion?.trim() || 'Sin nombre',
    descripcion: row.Descripcion?.trim() || '',
    precio_base: Number(row.Precio) || 0,
    stock_disponible: row.Stock !== null && row.Stock !== undefined ? Number(row.Stock) : 0,
    grupo: row.Grupo?.trim() || null,
    marca: row.Marca?.trim() || null,
    activo_en_erp: true,
    last_sync_at: syncedAt,
  };
}

/** Upsert en batches para evitar payloads gigantes en una sola request a Supabase. */
async function upsertBatched(
  supabase: SupabaseClient<Database>,
  rows: SnapshotInsert[],
  batchSize = 200,
): Promise<number> {
  let totalUpserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error, count } = await supabase
      .from('hermes_erp_snapshot')
      .upsert(batch, { onConflict: 'hermes_id', count: 'exact' });

    if (error) throw new Error(`Upsert batch [${i}..${i + batch.length}]: ${error.message}`);
    totalUpserted += count ?? batch.length;
  }

  return totalUpserted;
}

/** Marca activo_en_erp=false para IDs ya no presentes en la vista de Hermes. */
async function deactivateMissing(
  supabase: SupabaseClient<Database>,
  activeIds: number[],
  syncedAt: string,
): Promise<number> {
  // Obtener todos los IDs activos actuales en Supabase
  const { data: existing, error } = await supabase
    .from('hermes_erp_snapshot')
    .select('hermes_id')
    .eq('activo_en_erp', true);

  if (error) throw new Error(`Lectura de snapshot activos: ${error.message}`);
  if (!existing || existing.length === 0) return 0;

  const activeSet = new Set(activeIds);
  const missingIds = existing
    .map((r) => r.hermes_id)
    .filter((id) => !activeSet.has(id));

  if (missingIds.length === 0) return 0;

  const { error: updateError, count } = await supabase
    .from('hermes_erp_snapshot')
    .update({ activo_en_erp: false, last_sync_at: syncedAt })
    .in('hermes_id', missingIds)
    .eq('activo_en_erp', true);

  if (updateError) throw new Error(`Desactivar faltantes: ${updateError.message}`);
  return count ?? missingIds.length;
}

// ─── Función principal exportada ──────────────────────────────────────────────

/**
 * Ejecuta una sincronización completa Hermes → hermes_erp_snapshot.
 * @param supabase  Cliente Supabase con service role.
 * @param timeoutMs Timeout para la query a MySQL (default 8s).
 */
export async function runCatalogSync(
  supabase: SupabaseClient<Database>,
  timeoutMs = 8000,
): Promise<SyncResult> {
  const start = Date.now();

  try {
    // 1. Leer todos los productos desde Hermes
    const rawRows = await fetchAllHermesRows(timeoutMs);
    const syncedAt = new Date().toISOString();

    // 2. Mapear y filtrar filas inválidas
    const mapped: SnapshotInsert[] = [];
    for (const row of rawRows) {
      const parsed = parseRow(row, syncedAt);
      if (parsed) mapped.push(parsed);
    }

    if (mapped.length === 0) {
      return {
        fetched: rawRows.length,
        upserted: 0,
        deactivated: 0,
        durationMs: Date.now() - start,
        error: 'Hermes devolvió 0 productos válidos. Sync abortado para evitar desactivar todo el catálogo.',
      };
    }

    // 3. Upsert bulk en Supabase
    const upserted = await upsertBatched(supabase, mapped);

    // 4. Desactivar productos que ya no están en Hermes
    const activeIds = mapped.map((r) => r.hermes_id as number);
    const deactivated = await deactivateMissing(supabase, activeIds, syncedAt);

    return {
      fetched: rawRows.length,
      upserted,
      deactivated,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      fetched: -1, // -1 indica que el error ocurrió durante el proceso (ver error)
      upserted: 0,
      deactivated: 0,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
