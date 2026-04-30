import { NextResponse } from 'next/server';
import type { PoolConnection } from 'mysql2/promise';
import { getHermesPool } from '@/lib/hermesClient';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes configurables
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Código de tipo de tarjeta para MercadoPago en `pagos_detalle.CodChe`.
 * FALLBACK TEMPORAL: se usa 0 porque el usuario no tiene acceso a tipo_tarjetas.
 * Cuando el admin de Hermes ejecute: SELECT Codigo, Descri FROM tipo_tarjetas;
 * reemplazar este valor con el Codigo que corresponda a pago electrónico / MercadoPago.
 */
const COD_TIPO_TARJETA_MP = 0;

/** Prefijo de sucursal para el número de comprobante (formato: SSSS-NNNNNNNN). */
const COMPRO_SUCURSAL = '0009';

/** Alícuota de IVA aplicada a todos los artículos de la tienda (21 %). */
const IVA_ALIQUOTA = 0.21;

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────

interface VentaRequestBody {
  web_order_id?: string;
}

interface OrderItem {
  hermes_id: number;
  title: string;
  quantity: number;
  unit_price: number; // precio final con IVA incluido
}

interface OrderData {
  id: string;
  status: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_address: string | null;
  buyer_document_type: string | null;
  buyer_document_number: string | null;
  notes: string | null;
  total_amount: number;
  mercadopago_payment_id: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger con registro de pasos
// ─────────────────────────────────────────────────────────────────────────────

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  ts: string;
  level: LogLevel;
  paso?: string;
  msg: string;
  detail?: unknown;
}

function createLogger(web_order_id: string) {
  const logs: LogEntry[] = [];

  function log(level: LogLevel, msg: string, detail?: unknown, paso?: string) {
    const entry: LogEntry = { ts: new Date().toISOString(), level, paso, msg, detail };
    logs.push(entry);
    const prefix = paso ? `[${paso}]` : '[hermes/venta]';
    const detailStr = detail !== undefined ? ` | ${JSON.stringify(detail)}` : '';
    const line = `${entry.ts} ${level} ${prefix} order=${web_order_id} ${msg}${detailStr}`;
    if (level === 'ERROR') console.error(line);
    else if (level === 'WARN') console.warn(line);
    else console.log(line);
  }

  return {
    info: (msg: string, detail?: unknown, paso?: string) => log('INFO', msg, detail, paso),
    warn: (msg: string, detail?: unknown, paso?: string) => log('WARN', msg, detail, paso),
    error: (msg: string, detail?: unknown, paso?: string) => log('ERROR', msg, detail, paso),
    getLogs: () => logs,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Clase de error con contexto de paso
// ─────────────────────────────────────────────────────────────────────────────

class VentaError extends Error {
  readonly status: number;
  readonly paso?: string;

  constructor(message: string, status = 500, paso?: string) {
    super(message);
    this.status = status;
    this.paso = paso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de cálculo y formato
// ─────────────────────────────────────────────────────────────────────────────

/** Redondea a 2 decimales sin pérdida de precisión por punto flotante. */
function round2(value: number): number {
  return Number(value.toFixed(2));
}

/** Construye el string de comprobante: '0009-00000001'. */
function buildComproString(codigo: number): string {
  return `${COMPRO_SUCURSAL}-${String(codigo).padStart(8, '0')}`;
}

/** Formatea fecha como 'YYYY-MM-DD' para columnas DATE de MySQL. */
function toMysqlDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formatea fecha como 'YYYY-MM-DD HH:MM:SS' para columnas DATETIME de MySQL (FecReg). */
function toHermesFecReg(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

/**
 * Extrae el valor entero de un SELECT MAX(Codigo)+1 ... FOR UPDATE.
 * Lanza VentaError si el resultado no es un número finito >= 1.
 */
function extractNextCodigo(rows: unknown, tableName: string, paso: string): number {
  const row = (rows as Record<string, unknown>[])[0];
  const value = Number(Object.values(row ?? {})[0]);
  if (!Number.isFinite(value) || value < 1) {
    throw new VentaError(
      `No se pudo obtener el próximo Codigo de ${tableName}. Resultado: ${JSON.stringify(row)}`,
      500,
      paso,
    );
  }
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validación del body del request
// ─────────────────────────────────────────────────────────────────────────────

function parseRequestBody(body: unknown): string {
  const parsed = body as VentaRequestBody;
  const id = typeof parsed?.web_order_id === 'string' ? parsed.web_order_id.trim() : '';
  if (!id) {
    throw new VentaError('web_order_id es requerido.', 400);
  }
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Acceso a Supabase
// ─────────────────────────────────────────────────────────────────────────────

async function fetchOrderWithItems(web_order_id: string): Promise<{
  order: OrderData;
  items: OrderItem[];
}> {
  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('web_orders')
    .select(
      'id, status, buyer_name, buyer_email, buyer_address, buyer_document_type, buyer_document_number, notes, total_amount, mercadopago_payment_id',
    )
    .eq('id', web_order_id)
    .single();

  if (orderError || !order) {
    throw new VentaError(
      `Pedido no encontrado en Supabase (web_order_id=${web_order_id}): ${orderError?.message ?? 'sin datos'}`,
      404,
      'Pre-validación',
    );
  }

  const { data: rawItems, error: itemsError } = await supabase
    .from('web_order_items')
    .select('hermes_id, title, quantity, unit_price')
    .eq('order_id', web_order_id);

  if (itemsError) {
    throw new VentaError(
      `Error al leer items del pedido: ${itemsError.message}`,
      500,
      'Pre-validación',
    );
  }

  const items: OrderItem[] = (rawItems ?? []).map((item) => {
    if (item.hermes_id === null || item.hermes_id === undefined) {
      throw new VentaError(
        `El item "${item.title}" no tiene hermes_id y no puede registrarse en Hermes.`,
        422,
        'Pre-validación',
      );
    }
    return {
      hermes_id: item.hermes_id,
      title: item.title,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
    };
  });

  if (items.length === 0) {
    throw new VentaError(
      'El pedido no tiene items con hermes_id asignado; no se puede registrar en Hermes.',
      422,
      'Pre-validación',
    );
  }

  return { order: order as OrderData, items };
}

async function markOrderHermesRegistrado(web_order_id: string, codigoVenta: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const comproStr = buildComproString(codigoVenta);

  const { error, data } = await supabase
    .from('web_orders')
    .update({ status: 'hermes_registrado' })
    .eq('id', web_order_id)
    .select('id, status')
    .maybeSingle();

  if (error) {
    // No lanzamos — el COMMIT ya ocurrió. Solo logueamos el fallo.
    console.error(
      `[hermes/venta] WARN No se pudo actualizar el estado en Supabase para order=${web_order_id} comprobante=${comproStr}: ${error.message}`,
    );
    return;
  }

  if (!data) {
    console.error(
      `[hermes/venta] WARN Update de Supabase no encontró la orden order=${web_order_id} comprobante=${comproStr} (0 filas afectadas)`,
    );
    return;
  }

  console.log(
    `[hermes/venta] Supabase actualizado OK: order=${web_order_id} status=${data.status} comprobante=${comproStr}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transacción MySQL — 8 pasos
// ─────────────────────────────────────────────────────────────────────────────

async function registrarVentaEnHermes(
  conn: PoolConnection,
  order: OrderData,
  items: OrderItem[],
  log: ReturnType<typeof createLogger>,
): Promise<number> {
  const now = new Date();
  const fecOpe = toMysqlDate(now);
  const fecDif = toMysqlDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)); // vencimiento +30 días
  const fecReg = toHermesFecReg(now);

  // Totales globales con IVA 21 %
  const totalConIva = round2(order.total_amount);
  const neto21 = round2(totalConIva / (1 + IVA_ALIQUOTA));
  const ivaTotal = round2(totalConIva - neto21);

  // ── Paso 1: Reservar próximo Codigo de comprob_ventas ────────────────────
  log.info('Reservando próximo Codigo de comprob_ventas', undefined, 'Paso 1');
  let rowsCodVenta: unknown;
  try {
    [rowsCodVenta] = await conn.query(
      'SELECT COALESCE(MAX(Codigo), 0) + 1 AS siguiente FROM comprob_ventas',
    );
  } catch (err) {
    throw new VentaError(
      `Error al consultar MAX(Codigo) en comprob_ventas: ${(err as Error).message}`,
      500,
      'Paso 1',
    );
  }
  const codigoVenta = extractNextCodigo(rowsCodVenta, 'comprob_ventas', 'Paso 1');
  const comproStr = buildComproString(codigoVenta);
  log.info('Codigo de venta reservado', { codigoVenta, comproStr }, 'Paso 1');

  // ── Paso 2: INSERT comprob_ventas ─────────────────────────────────────────
  log.info('Insertando cabecera en comprob_ventas', { codigoVenta, total: totalConIva, neto21, ivaTotal }, 'Paso 2');
  try {
    await conn.execute(
      `INSERT INTO comprob_ventas (
        NroEmp, Codigo, NroCli, Nombre, Provin, Cuit,
        CatIva, TipRub, FecOpe, FecDif, CodDGR,
        TipOpe, TipCom, Letra, Compro, Observ,
        OpeExe, IvaIn1, IvaIn2, IvaIn3, IvaIn4, IvaIn5,
        DebFis, IvaRni, ReTope, PerIva, RetIva, RetIng,
        ImpInt, NoGrav, Varios, TotOpe, ImpRes, ImpIva,
        TipMov, Cancel, NombPC, Moneda, RetSUS, RetGan,
        Imputa, PerIng, FecReg, ModReg, RetMun, TotITC, ImpCO2, Cotiza
      ) VALUES (
        2, ?, 0, ?, 1, '',
        4, 0, ?, ?, 0,
        1, 7, 'X', ?, ?,
        0, ?, 0, 0, 0, 0,
        ?, 0, 0, 0, 0, 0,
        0, 0, 0, ?, 0, 0,
        0, 1, 'WEB', 0, 0, 0,
        0, 0, ?, 'W', 0, 0, 0, 1
      )`,
      [
        codigoVenta,
        order.buyer_name,
        fecOpe,
        fecDif,
        comproStr,
        order.notes ?? '',
        neto21,
        ivaTotal,
        totalConIva,
        fecReg,
      ],
    );
  } catch (err) {
    throw new VentaError(
      `Error al insertar en comprob_ventas: ${(err as Error).message}`,
      500,
      'Paso 2',
    );
  }
  log.info('comprob_ventas insertado OK', undefined, 'Paso 2');

  // ── Paso 3: INSERT comprobantes ───────────────────────────────────────────
  log.info('Insertando en comprobantes', { codigoVenta }, 'Paso 3');
  try {
    await conn.execute(
      `INSERT INTO comprobantes (
        Codigo, NroVen, NroFac, Domici, Locali,
        PorDes, CarFin, Remito, Condic, OrdenC,
        TipFle, ValDec, Bultos, fEnvio, mPagos,
        Puerto, TotFle, Seguro, NroTra, NomCon,
        Valide, Entreg, NroEmp, NroCar,
        Comis1, ObsCo1, Comis2, ObsCo2
      ) VALUES (
        ?, 0, 0, ?, '',
        0, 0, '', '', '',
        0, '', '', '', '',
        '', 0, 0, 0, '',
        '', '', 2, 0,
        0, '', 0, ''
      )`,
      [codigoVenta, order.buyer_address ?? ''],
    );
  } catch (err) {
    throw new VentaError(
      `Error al insertar en comprobantes: ${(err as Error).message}`,
      500,
      'Paso 3',
    );
  }
  log.info('comprobantes insertado OK', undefined, 'Paso 3');

  // ── Paso 4: INSERT items_comprobantes (por cada artículo) ─────────────────
  log.info('Insertando items_comprobantes', { cantidad: items.length }, 'Paso 4');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Precio neto por unidad (sin IVA)
    const preUniNeto = round2(item.unit_price / (1 + IVA_ALIQUOTA));
    const netoGr = round2(preUniNeto * item.quantity);
    const ivaItem = round2(netoGr * IVA_ALIQUOTA);
    log.info(
      `Item ${i + 1}/${items.length}: hermes_id=${item.hermes_id} qty=${item.quantity} preUniNeto=${preUniNeto}`,
      undefined,
      'Paso 4',
    );
    try {
      await conn.execute(
        `INSERT INTO items_comprobantes (
          Codigo, OrdImp, CodArt, Cantid, Descri,
          NroLis, PreUni, Descue, PorDes, OpeExe,
          NetoGr, DebFis, IvaRni, PerIva, RetIva, RetIng,
          ImpInt, pCosto, ColAdi, TabIva, NroEmp,
          PrFijo, TotITC, ImpCO2, PorUni
        ) VALUES (
          ?, ?, ?, ?, ?,
          0, ?, 0, 0, 0,
          ?, ?, 0, 0, 0, 0,
          0, 0, '', 1, 2,
          0, 0, 0, 0
        )`,
        [
          codigoVenta,
          i,                  // OrdImp: 0, 1, 2, ...
          item.hermes_id,
          item.quantity,
          item.title,
          preUniNeto,
          netoGr,
          ivaItem,
        ],
      );
    } catch (err) {
      throw new VentaError(
        `Error al insertar item ${i + 1} (hermes_id=${item.hermes_id}) en items_comprobantes: ${(err as Error).message}`,
        500,
        'Paso 4',
      );
    }
  }
  log.info('Todos los items_comprobantes insertados OK', undefined, 'Paso 4');

  // ── Paso 5: INSERT movimientos_stk (por cada artículo) ───────────────────
  log.info('Insertando movimientos_stk', { cantidad: items.length }, 'Paso 5');
  const comproMovStr = `DI X ${comproStr}`;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const preUniNeto = round2(item.unit_price / (1 + IVA_ALIQUOTA));
    log.info(
      `Movimiento stk ${i + 1}/${items.length}: hermes_id=${item.hermes_id} qty=${item.quantity}`,
      undefined,
      'Paso 5',
    );
    try {
      await conn.execute(
        `INSERT INTO movimientos_stk (
          Codigo, FecMov, NroCon, Nombre,
          TipDes, TipMov, CodCom, Compro,
          Cantid, PreUni, TipDep, OrdenC,
          Confor, Observ, NroEmp, NroUsu, Bultos
        ) VALUES (
          ?, ?, 0, ?,
          0, 2, ?, ?,
          ?, ?, 0, NULL,
          0, NULL, 2, 0, 0
        )`,
        [
          item.hermes_id,
          fecOpe,
          order.buyer_name,
          codigoVenta,
          comproMovStr,
          item.quantity,
          preUniNeto,
        ],
      );
    } catch (err) {
      throw new VentaError(
        `Error al insertar movimiento stk ${i + 1} (hermes_id=${item.hermes_id}): ${(err as Error).message}`,
        500,
        'Paso 5',
      );
    }
  }
  log.info('Todos los movimientos_stk insertados OK', undefined, 'Paso 5');

  // ── Paso 6: Reservar próximo Codigo de pagos ──────────────────────────────
  log.info('Reservando próximo Codigo de pagos', undefined, 'Paso 6');
  let rowsCodPago: unknown;
  try {
    [rowsCodPago] = await conn.query(
      'SELECT COALESCE(MAX(Codigo), 0) + 1 AS siguiente FROM pagos',
    );
  } catch (err) {
    throw new VentaError(
      `Error al consultar MAX(Codigo) en pagos: ${(err as Error).message}`,
      500,
      'Paso 6',
    );
  }
  const codigoPago = extractNextCodigo(rowsCodPago, 'pagos', 'Paso 6');
  log.info('Codigo de pago reservado', { codigoPago }, 'Paso 6');

  // ── Paso 7: INSERT pagos ──────────────────────────────────────────────────
  log.info('Insertando en pagos', { codigoPago, codVta: codigoVenta }, 'Paso 7');
  try {
    await conn.execute(
      `INSERT INTO pagos (NroEmp, Codigo, CodVta, CodCra, FecPag)
       VALUES (2, ?, ?, 0, ?)`,
      [codigoPago, codigoVenta, fecOpe],
    );
  } catch (err) {
    throw new VentaError(
      `Error al insertar en pagos: ${(err as Error).message}`,
      500,
      'Paso 7',
    );
  }
  log.info('pagos insertado OK', undefined, 'Paso 7');

  // ── Paso 8: INSERT pagos_detalle ──────────────────────────────────────────
  log.info(
    'Insertando en pagos_detalle',
    { codigoPago, tipPag: 6, importe: totalConIva, codChe: COD_TIPO_TARJETA_MP },
    'Paso 8',
  );
  try {
    await conn.execute(
      `INSERT INTO pagos_detalle (NroEmp, Codigo, TipPag, ImpPag, CodChe, CodAsi, Clave)
       VALUES (2, ?, 6, ?, ?, 0, NULL)`,
      [codigoPago, totalConIva, COD_TIPO_TARJETA_MP],
    );
  } catch (err) {
    throw new VentaError(
      `Error al insertar en pagos_detalle: ${(err as Error).message}`,
      500,
      'Paso 8',
    );
  }
  log.info('pagos_detalle insertado OK', undefined, 'Paso 8');

  return codigoVenta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal POST /api/hermes/venta
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let parsedOrderId = 'desconocido';

  try {
    if (!hasSupabaseAdminConfig()) {
      return NextResponse.json(
        { error: 'Configuración de Supabase no disponible en el servidor.' },
        { status: 500 },
      );
    }

    // Parsear body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
    }

    parsedOrderId = parseRequestBody(rawBody);
    const log = createLogger(parsedOrderId);
    log.info('Inicio de registro de venta en Hermes');

    // ── Idempotencia: verificar si ya fue procesado ─────────────────────────
    log.info('Verificando idempotencia en Supabase', undefined, 'Pre-validación');
    const { order, items } = await fetchOrderWithItems(parsedOrderId);

    if (order.status === 'hermes_registrado') {
      log.warn(
        'Pedido ya registrado en Hermes. Solicitud duplicada ignorada.',
        { status: order.status },
        'Pre-validación',
      );
      return NextResponse.json(
        { ok: true, mensaje: 'Pedido ya registrado en Hermes.', duplicado: true },
        { status: 200 },
      );
    }

    log.info(
      'Pedido validado y listo para registrar',
      { status: order.status, items: items.length, total: order.total_amount },
      'Pre-validación',
    );

    // ── Transacción MySQL ───────────────────────────────────────────────────
    const pool = getHermesPool();
    let conn: PoolConnection | null = null;
    let codigoVenta: number | null = null;

    try {
      conn = await pool.getConnection();
      log.info('Conexión MySQL obtenida del pool. Iniciando transacción.');
      await conn.beginTransaction();

      codigoVenta = await registrarVentaEnHermes(conn, order, items, log);

      await conn.commit();
      log.info('COMMIT exitoso', { codigoVenta, comprobante: buildComproString(codigoVenta) });
    } catch (mysqlError) {
      const errMsg = mysqlError instanceof Error ? mysqlError.message : String(mysqlError);
      const errPaso = mysqlError instanceof VentaError ? mysqlError.paso : undefined;
      log.error('Error en transacción MySQL — ejecutando ROLLBACK', { message: errMsg, paso: errPaso });
      if (conn) {
        try {
          await conn.rollback();
          log.info('ROLLBACK completado.');
        } catch (rollbackErr) {
          log.error('Error adicional al ejecutar ROLLBACK', (rollbackErr as Error).message);
        }
      }
      throw mysqlError;
    } finally {
      if (conn) {
        conn.release();
        log.info('Conexión MySQL liberada al pool.');
      }
    }

    // ── Actualizar estado en Supabase (post-commit) ─────────────────────────
    log.info('Actualizando estado del pedido en Supabase a hermes_registrado', { codigoVenta });
    await markOrderHermesRegistrado(parsedOrderId, codigoVenta);
    log.info('Estado actualizado correctamente en Supabase.');

    const comproFinal = buildComproString(codigoVenta);
    log.info(`Venta registrada exitosamente. Comprobante: ${comproFinal}`);

    return NextResponse.json({
      ok: true,
      web_order_id: parsedOrderId,
      hermes_comprobante: comproFinal,
      hermes_codigo_venta: codigoVenta,
    });
  } catch (error) {
    const isVentaError = error instanceof VentaError;
    const status = isVentaError ? error.status : 500;
    const paso = isVentaError ? error.paso : undefined;
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado al registrar la venta en Hermes.';

    console.error(
      `[hermes/venta] ERROR FATAL order=${parsedOrderId}${paso ? ` paso=${paso}` : ''}: ${message}`,
      error,
    );

    return NextResponse.json(
      { error: message, paso, web_order_id: parsedOrderId },
      { status },
    );
  }
}
