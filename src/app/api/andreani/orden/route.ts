/**
 * /api/andreani/orden
 * ───────────────────
 * Endpoint interno para crear una orden de envío en Andreani.
 * Se llama DESPUÉS de confirmar el pago (desde el panel admin o desde
 * el webhook de Mercado Pago una vez que el estado es "approved").
 *
 * Este endpoint NO es público. Requiere la cabecera de autorización interna
 * definida en la variable de entorno INTERNAL_API_SECRET para evitar llamadas
 * no autorizadas desde el exterior.
 *
 * Variable de entorno requerida (además de las de Andreani):
 *   INTERNAL_API_SECRET → clave secreta para proteger este endpoint
 *                         (cualquier string largo y aleatorio, ej: UUID v4)
 *
 * Método: POST
 * Headers:
 *   x-internal-secret: {INTERNAL_API_SECRET}
 *
 * Body JSON:
 * {
 *   "referenciaCliente": "pedido-web-1234567890-abc12345",
 *   "destinatario": {
 *     "nombre":        "Juan Pérez",
 *     "email":         "juan@email.com",
 *     "telefono":      "1145678901",
 *     "calle":         "Av. Corrientes 1234",
 *     "complemento":   "Piso 3 Dpto B",   ← opcional
 *     "codigoPostal":  "1043",
 *     "localidad":     "Ciudad Autónoma de Buenos Aires",
 *     "provincia":     "Buenos Aires"
 *   },
 *   "bultos": [
 *     {
 *       "pesoEnGramos":   3000,
 *       "largoCm":        30,
 *       "anchoCm":        20,
 *       "altoCm":         25,
 *       "valorDeclarado": 15000,   ← opcional (ARS)
 *       "descripcion":    "Vinos x6"  ← opcional
 *     }
 *   ]
 * }
 *
 * Respuesta exitosa (200):
 * {
 *   "ok": true,
 *   "numeroAndreani": "EP000000001AR",
 *   "etiquetaUrl":    "https://...",
 *   "raw":            { ...respuesta cruda de Andreani... }
 * }
 *
 * Respuesta de error:
 * { "error": "Mensaje de error legible" }
 */

import { NextResponse } from 'next/server';
import {
  crearOrdenDeEnvio,
  AndreaniConfigError,
  AndreaniApiError,
  type CrearOrdenParams,
  type DestinatarioInput,
  type BultoInput,
} from '@/lib/andreaniClient';

// ── Autenticación interna ────────────────────────────────────────────────────
//
// Este endpoint usa un secret simple en cabecera para protegerse de llamadas
// externas no autorizadas. No expone datos de clientes a terceros.
//
// Para configurarlo:
//   1. Generá un UUID random: en Node → crypto.randomUUID()
//   2. Cargalo en .env.local:   INTERNAL_API_SECRET=tu-uuid-aqui
//   3. Cargalo en Vercel:       Settings → Environment Variables

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET?.trim() ?? '';

function validateInternalSecret(request: Request): boolean {
  if (!INTERNAL_SECRET) {
    // Si no está configurado, el endpoint queda bloqueado por seguridad
    return false;
  }

  const providedSecret = request.headers.get('x-internal-secret')?.trim() ?? '';
  return providedSecret === INTERNAL_SECRET;
}

// ── Validación del body ──────────────────────────────────────────────────────

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validateDestinatario(d: unknown): d is DestinatarioInput {
  if (!d || typeof d !== 'object') return false;

  const dest = d as Record<string, unknown>;

  return (
    isNonEmptyString(dest.nombre) &&
    isNonEmptyString(dest.email) &&
    isNonEmptyString(dest.telefono) &&
    isNonEmptyString(dest.calle) &&
    isNonEmptyString(dest.codigoPostal) &&
    isNonEmptyString(dest.localidad) &&
    isNonEmptyString(dest.provincia)
  );
}

function validateBulto(b: unknown): b is BultoInput {
  if (!b || typeof b !== 'object') return false;

  const bulto = b as Record<string, unknown>;

  return (
    isPositiveNumber(bulto.pesoEnGramos) &&
    isPositiveNumber(bulto.largoCm) &&
    isPositiveNumber(bulto.anchoCm) &&
    isPositiveNumber(bulto.altoCm)
  );
}

interface OrdenRequestBody {
  referenciaCliente?: unknown;
  destinatario?: unknown;
  bultos?: unknown;
}

// ── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  // ── 1. Autenticación interna ─────────────────────────────────────────
  if (!validateInternalSecret(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  // ── 2. Parsear body ──────────────────────────────────────────────────
  let body: OrdenRequestBody;

  try {
    body = (await request.json()) as OrdenRequestBody;
  } catch {
    return NextResponse.json({ error: 'El cuerpo del request debe ser JSON válido.' }, { status: 400 });
  }

  // ── 3. Validar campos obligatorios ───────────────────────────────────
  if (!isNonEmptyString(body.referenciaCliente)) {
    return NextResponse.json(
      { error: 'El campo referenciaCliente es obligatorio (referencia del pedido web).' },
      { status: 400 },
    );
  }

  if (!validateDestinatario(body.destinatario)) {
    return NextResponse.json(
      {
        error:
          'El objeto destinatario es inválido o incompleto. Campos requeridos: nombre, email, telefono, calle, codigoPostal, localidad, provincia.',
      },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.bultos) || body.bultos.length === 0) {
    return NextResponse.json(
      { error: 'El campo bultos es obligatorio y debe ser un array con al menos un elemento.' },
      { status: 400 },
    );
  }

  const bultosInvalidos = body.bultos.filter((b) => !validateBulto(b));

  if (bultosInvalidos.length > 0) {
    return NextResponse.json(
      {
        error:
          'Uno o más bultos tienen datos inválidos. Cada bulto requiere: pesoEnGramos, largoCm, anchoCm, altoCm (todos números positivos).',
      },
      { status: 400 },
    );
  }

  // ── 4. Construir params y llamar a Andreani ──────────────────────────
  const params: CrearOrdenParams = {
    referenciaCliente: (body.referenciaCliente as string).trim(),
    destinatario: body.destinatario as DestinatarioInput,
    bultos: body.bultos as BultoInput[],
  };

  try {
    const resultado = await crearOrdenDeEnvio(params);

    return NextResponse.json(
      {
        ok: true,
        numeroAndreani: resultado.numeroAndreani ?? null,
        etiquetaUrl: resultado.etiquetaUrl ?? null,
        raw: resultado,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AndreaniConfigError) {
      console.error('[andreani/orden] Error de configuración:', error.message);
      return NextResponse.json(
        { error: 'El servicio de envíos no está configurado correctamente. Contactá al administrador.' },
        { status: 503 },
      );
    }

    if (error instanceof AndreaniApiError) {
      console.error('[andreani/orden] Error de API Andreani:', error.message, error.status, error.body);
      return NextResponse.json(
        {
          error: `Error al crear la orden en Andreani (${error.status}). Revisá los datos e intentá de nuevo.`,
          andreaniStatus: error.status,
          andreaniBody: error.body,
        },
        { status: 502 },
      );
    }

    console.error('[andreani/orden] Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno al crear la orden de envío.' }, { status: 500 });
  }
}
