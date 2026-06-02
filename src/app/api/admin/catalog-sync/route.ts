/**
 * POST /api/admin/catalog-sync
 *
 * Dispara la sincronización incremental de productos Hermes → hermes_erp_snapshot.
 * Acepta dos modos de autenticación:
 *   - Cron de Vercel:  header Authorization: Bearer <CRON_SECRET>
 *   - Admin manual:    sesión de Supabase con is_admin=true
 *
 * Configurar en vercel.json:
 *   {
 *     "crons": [{ "path": "/api/admin/catalog-sync", "schedule": "cada 5 min" }]
 *   }
 *
 * Env vars requeridas: CRON_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { runCatalogSync } from '@/lib/hermesSync';

const CRON_SECRET = process.env.CRON_SECRET?.trim() ?? '';

function isCronRequest(request: Request): boolean {
  if (!CRON_SECRET) return false;
  const auth = request.headers.get('authorization') ?? '';
  // Vercel Cron envía: Authorization: Bearer <CRON_SECRET>
  return auth === `Bearer ${CRON_SECRET}`;
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: 'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 },
    );
  }

  // Autenticación: cron secret o sesión admin
  if (!isCronRequest(request)) {
    const authError = await requireAdminApiUser();
    if (authError) return authError;
  }

  const supabase = getSupabaseAdmin();
  const result = await runCatalogSync(supabase);

  const status = result.error ? 500 : 200;
  return NextResponse.json(result, { status });
}

// Vercel Cron también usa GET para la mayoría de los schedules
export async function GET(request: Request) {
  return POST(request);
}
