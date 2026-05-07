/**
 * /api/andreani/cotizar
 * ─────────────────────
 * Endpoint público para cotizar el costo de envío con Andreani.
 * Lo llama el frontend en el checkout cuando el usuario ingresa su CP.
 *
 * Método: POST
 * Body JSON:
 * {
 *   "cpDestino":    "1425",   ← CP del comprador (obligatorio)
 *   "pesoEnGramos": 3000,     ← peso total de todos los productos (obligatorio)
 *   "volumenEnCm3": 6000,     ← opcional: largo×ancho×alto en cm³
 *   "cantidadBultos": 1       ← opcional, default 1
 * }
 *
 * Respuesta exitosa (200):
 * {
 *   "tarifas": [ { contrato, tarifaConIVA, tarifaSinIVA, diasHabiles, ... } ]
 * }
 *
 * Respuesta de error (4xx / 5xx):
 * { "error": "Mensaje de error legible" }
 */

import { NextResponse } from 'next/server';
import { cotizarEnvio, AndreaniConfigError, AndreaniApiError } from '@/lib/andreaniClient';

interface CotizarRequestBody {
  cpDestino?: unknown;
  pesoEnGramos?: unknown;
  volumenEnCm3?: unknown;
  cantidadBultos?: unknown;
}

function isValidCp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4,8}$/.test(value.trim());
}

function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: CotizarRequestBody;

  try {
    body = (await request.json()) as CotizarRequestBody;
  } catch {
    return NextResponse.json({ error: 'El cuerpo del request debe ser JSON válido.' }, { status: 400 });
  }

  // ── Validación de parámetros de entrada ──────────────────────────────
  if (!isValidCp(body.cpDestino)) {
    return NextResponse.json(
      { error: 'El campo cpDestino es obligatorio y debe ser un código postal numérico (4-8 dígitos).' },
      { status: 400 },
    );
  }

  if (!isValidPositiveNumber(body.pesoEnGramos)) {
    return NextResponse.json(
      { error: 'El campo pesoEnGramos es obligatorio y debe ser un número positivo (peso total en gramos).' },
      { status: 400 },
    );
  }

  const volumenEnCm3 =
    body.volumenEnCm3 !== undefined && isValidPositiveNumber(body.volumenEnCm3)
      ? (body.volumenEnCm3 as number)
      : undefined;

  const cantidadBultos =
    body.cantidadBultos !== undefined && isValidPositiveNumber(body.cantidadBultos)
      ? Math.floor(body.cantidadBultos as number)
      : 1;

  // ── Llamada al cliente de Andreani ───────────────────────────────────
  try {
    const tarifas = await cotizarEnvio({
      cpDestino: (body.cpDestino as string).trim(),
      pesoEnGramos: body.pesoEnGramos as number,
      volumenEnCm3,
      cantidadBultos,
    });

    return NextResponse.json({ tarifas }, { status: 200 });
  } catch (error) {
    if (error instanceof AndreaniConfigError) {
      // Error de configuración → problema del servidor, no del usuario
      console.error('[andreani/cotizar] Error de configuración:', error.message);
      return NextResponse.json(
        { error: 'El servicio de envíos no está configurado correctamente. Contactá al administrador.' },
        { status: 503 },
      );
    }

    if (error instanceof AndreaniApiError) {
      console.error('[andreani/cotizar] Error de API Andreani:', error.message, error.status, error.body);
      return NextResponse.json(
        { error: `Error al consultar Andreani (${error.status}). Intentá de nuevo o contactá al administrador.` },
        { status: 502 },
      );
    }

    console.error('[andreani/cotizar] Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno al calcular el costo de envío.' }, { status: 500 });
  }
}
