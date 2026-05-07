/**
 * andreaniClient.ts
 * -----------------
 * Cliente oficial de Andreani para La Perla Vinos.
 *
 * Variables de entorno requeridas (cargar en .env.local y en Vercel):
 *
 *   ANDREANI_USUARIO        → Usuario provisto por Andreani (solicitarlo al Ejecutivo Comercial)
 *   ANDREANI_CONTRASENA     → Contraseña provista por Andreani
 *   ANDREANI_CONTRATO       → Número de contrato provisto por Andreani (ej: "CDA0000123")
 *   ANDREANI_CP_ORIGEN      → Código postal del depósito / punto de despacho (ej: "5000")
 *   ANDREANI_QA             → "true" para usar el entorno QA (pruebas), "false" para producción
 *
 * Flujo de autenticación (oficial Andreani):
 *   1. andreaniLogin()       → POST /login con Basic Auth (usuario:contraseña en base64)
 *                              Devuelve un token válido por 24 horas.
 *                              El token se envía en el header: x-authorization-token
 *   2. cotizarEnvio()        → consulta tarifa para un CP destino y peso/volumen
 *   3. crearOrdenDeEnvio()   → genera la etiqueta/orden de envío post-pago
 *
 * Documentación oficial Andreani:
 *   https://developers.andreani.com
 *
 * Endpoints QA:   https://apisqa.andreani.com
 * Endpoints prod: https://apis.andreani.com
 *
 * Proceso para obtener credenciales:
 *   1. QA primero: contactar al Ejecutivo Comercial de Andreani → credenciales en 24hs por email
 *   2. Producción: solo se otorgan después de validar la integración en QA
 */

// ─────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────

const QA_BASE_URL = 'https://apisqa.andreani.com';
const PROD_BASE_URL = 'https://apis.andreani.com';

function getBaseUrl(): string {
  const isQa = process.env.ANDREANI_QA?.trim().toLowerCase() !== 'false';
  return isQa ? QA_BASE_URL : PROD_BASE_URL;
}

function getCredentials() {
  const usuario = process.env.ANDREANI_USUARIO?.trim() ?? '';
  const contrasena = process.env.ANDREANI_CONTRASENA?.trim() ?? '';
  const contrato = process.env.ANDREANI_CONTRATO?.trim() ?? '';
  const cpOrigen = process.env.ANDREANI_CP_ORIGEN?.trim() ?? '';

  if (!usuario || !contrasena || !contrato || !cpOrigen) {
    throw new AndreaniConfigError(
      'Faltan variables de entorno de Andreani. Revisar: ANDREANI_USUARIO, ANDREANI_CONTRASENA, ANDREANI_CONTRATO, ANDREANI_CP_ORIGEN. Las credenciales las provee el Ejecutivo Comercial de Andreani.',
    );
  }

  return { usuario, contrasena, contrato, cpOrigen };
}

// ─────────────────────────────────────────────
// Errores tipados
// ─────────────────────────────────────────────

export class AndreaniConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AndreaniConfigError';
  }
}

export class AndreaniApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'AndreaniApiError';
    this.status = status;
    this.body = body;
  }
}

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface AndreaniLoginResponse {
  token: string;
}

/**
 * Parámetros para cotizar un envío.
 * Todos los pesos están en gramos y el volumen en cm³.
 */
export interface CotizarEnvioParams {
  /** Código postal de destino del comprador (ej: "1425") */
  cpDestino: string;
  /**
   * Peso total del paquete en gramos.
   * Si el paquete es de 1 kg → pesoEnGramos = 1000
   */
  pesoEnGramos: number;
  /**
   * Volumen del paquete en cm³ (largo × ancho × alto).
   * Si no se conoce, Andreani puede calcularlo por peso.
   */
  volumenEnCm3?: number;
  /**
   * Cantidad de bultos del envío.
   * @default 1
   */
  cantidadBultos?: number;
}

/**
 * Respuesta de la API de tarifas de Andreani.
 * La API puede devolver múltiples servicios con distintos precios.
 */
export interface AndreaniTarifa {
  /** Nombre del servicio (ej: "Andreani Estándar", "Andreani Express") */
  contrato: string;
  /** Precio total del envío (en ARS, sin IVA según contrato) */
  tarifaConIVA?: number;
  tarifaSinIVA?: number;
  /** Días hábiles estimados de entrega */
  diasHabiles?: number;
  /** Servicio de la tarifa */
  servicio?: string;
  /** Datos adicionales que devuelva la API */
  [key: string]: unknown;
}

/**
 * Datos del destinatario para crear una orden de envío.
 */
export interface DestinatarioInput {
  nombre: string;
  email: string;
  telefono: string;
  /** Calle y número (ej: "Av. Corrientes 1234") */
  calle: string;
  /** Número de piso/depto/local (opcional) */
  complemento?: string;
  codigoPostal: string;
  localidad: string;
  /** Provincia completa (ej: "Buenos Aires") */
  provincia: string;
}

/**
 * Datos de un bulto para la orden de envío.
 * Andreani acepta múltiples bultos por orden.
 */
export interface BultoInput {
  /** Peso en gramos */
  pesoEnGramos: number;
  /** Largo en cm */
  largoCm: number;
  /** Ancho en cm */
  anchoCm: number;
  /** Alto en cm */
  altoCm: number;
  /**
   * Valor declarado del contenido en ARS.
   * Andreani lo usa para calcular el seguro.
   */
  valorDeclarado?: number;
  /** Descripción breve del contenido (ej: "Vinos x6") */
  descripcion?: string;
}

/**
 * Parámetros para crear una orden de envío en Andreani.
 */
export interface CrearOrdenParams {
  /** Referencia interna del pedido (external_reference de Mercado Pago) */
  referenciaCliente: string;
  destinatario: DestinatarioInput;
  bultos: BultoInput[];
}

/**
 * Respuesta de la API al crear una orden de envío.
 */
export interface AndreaniOrdenResponse {
  /** Número de seguimiento de Andreani (ej: "EP000000001AR") */
  numeroAndreani?: string;
  /** URL del PDF de la etiqueta para imprimir */
  etiquetaUrl?: string;
  /** Estado inicial de la orden */
  estado?: string;
  /** Datos crudos que devuelva la API */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// Cache de token en memoria (reutiliza entre requests del mismo proceso)
// ─────────────────────────────────────────────

interface TokenCache {
  token: string;
  /** Timestamp en ms cuando vence el token (conservador: -1 hora antes del real de 24hs) */
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function isTokenValid(cache: TokenCache | null): cache is TokenCache {
  return cache !== null && Date.now() < cache.expiresAt;
}

// ─────────────────────────────────────────────
// Autenticación
// ─────────────────────────────────────────────

/**
 * Obtiene un token de la API de Andreani usando Basic Auth.
 * Reutiliza el token en caché si todavía es válido (evita login en cada request).
 *
 * Referencia oficial:
 *   URL QA:   https://apisqa.andreani.com/login
 *   URL Prod: https://apis.andreani.com/login
 *   Método:   POST
 *   Auth:     Basic Auth (usuario:contraseña en Base64 en el header Authorization)
 *   Response: el token viene en el header de respuesta "x-authorization-token"
 *             (algunos endpoints lo devuelven también en el body — verificar con la doc)
 *
 * El token tiene vigencia de 24 horas.
 * Se usa enviándolo en el header: x-authorization-token: {token}
 */
export async function andreaniLogin(): Promise<string> {
  if (isTokenValid(tokenCache)) {
    return tokenCache.token;
  }

  const { usuario, contrasena } = getCredentials();
  const url = `${getBaseUrl()}/login`;

  // Basic Auth: credenciales en Base64 → "usuario:contraseña"
  const basicCredentials = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicCredentials}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AndreaniApiError(
      `Andreani login falló con status ${response.status}`,
      response.status,
      body,
    );
  }

  // Andreani devuelve el token en el header de respuesta "x-authorization-token"
  const token = response.headers.get('x-authorization-token');

  if (!token) {
    // Fallback: algunos endpoints lo devuelven también en el body
    const data = (await response.json().catch(() => ({}))) as AndreaniLoginResponse;

    if (!data.token) {
      throw new AndreaniApiError(
        'Andreani login no devolvió token (ni en header ni en body)',
        response.status,
        data,
      );
    }

    tokenCache = {
      token: data.token,
      expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23hs (token dura 24hs)
    };

    return data.token;
  }

  // Token válido por 24hs — cacheamos por 23hs para renovar antes de que expire
  tokenCache = {
    token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return token;
}

// ─────────────────────────────────────────────
// Cotización de envío
// ─────────────────────────────────────────────

/**
 * Consulta la tarifa de envío para un código postal destino y paquete dado.
 *
 * Referencia: ver catálogo de APIs en https://developers.andreani.com
 *   → Vertical "Transporte y Distribución" → endpoint de tarifas
 *
 * Query params (verificar nombres exactos en la doc oficial):
 *   - cpOrigen    → CP del negocio (desde ANDREANI_CP_ORIGEN)
 *   - cpDestino   → CP del comprador
 *   - contrato    → Número de contrato (desde ANDREANI_CONTRATO)
 *   - pesoCubico  → Peso en gramos
 *   - volumen     → Volumen en cm³ (opcional)
 *   - bultos      → Cantidad de bultos (default 1)
 *
 * El token va en el header: x-authorization-token
 *
 * Devuelve un array con las tarifas disponibles para el contrato configurado.
 *
 * IMPORTANTE: los nombres exactos de los query params y la estructura de
 * respuesta deben verificarse contra el catálogo oficial de Andreani.
 * Ajustar el objeto `params` y el parseo de respuesta si hay diferencias.
 */
export async function cotizarEnvio(input: CotizarEnvioParams): Promise<AndreaniTarifa[]> {
  const token = await andreaniLogin();
  const { contrato, cpOrigen } = getCredentials();

  const params = new URLSearchParams({
    cpOrigen,
    cpDestino: input.cpDestino,
    contrato,
    pesoCubico: String(input.pesoEnGramos),
    bultos: String(input.cantidadBultos ?? 1),
  });

  if (input.volumenEnCm3 !== undefined) {
    params.set('volumen', String(input.volumenEnCm3));
  }

  const url = `${getBaseUrl()}/v2/tarifas?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-authorization-token': token,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AndreaniApiError(
      `Andreani cotización falló con status ${response.status}`,
      response.status,
      body,
    );
  }

  const data = await response.json();

  // La API devuelve un array o un objeto con un campo "tarifas"
  if (Array.isArray(data)) {
    return data as AndreaniTarifa[];
  }

  if (data && Array.isArray(data.tarifas)) {
    return data.tarifas as AndreaniTarifa[];
  }

  // Si devuelve un objeto único, lo envolvemos en array
  return [data] as AndreaniTarifa[];
}

// ─────────────────────────────────────────────
// Crear orden de envío (post-pago)
// ─────────────────────────────────────────────

/**
 * Crea una orden de envío en Andreani una vez confirmado el pago.
 * Devuelve el número de seguimiento y la URL de la etiqueta para imprimir.
 *
 * Referencia: POST /v2/ordenes-de-envio (verificar ruta exacta en el catálogo oficial)
 * Headers:
 *   x-authorization-token: {token}
 *   x-andreani-contrato: {contrato}
 *
 * Body esperado (estructura Andreani v2):
 * {
 *   "contrato": "CDA0000123",
 *   "remitente": { ... },       ← dirección origen del negocio
 *   "destinatario": { ... },    ← dirección del comprador
 *   "bultos": [ { ... } ]       ← detalles del paquete
 * }
 *
 * IMPORTANTE: la dirección del remitente (dirección del negocio) se configura
 * directamente en el portal de Andreani para el contrato. No es necesario
 * enviarla en cada request si el contrato ya la tiene configurada.
 *
 * Nota: Si la API devuelve error 400 con "contrato inválido" o similar,
 * verificar que ANDREANI_CONTRATO tenga el valor exacto que aparece en el
 * portal de Andreani (mayúsculas/minúsculas importan).
 */
export async function crearOrdenDeEnvio(input: CrearOrdenParams): Promise<AndreaniOrdenResponse> {
  const token = await andreaniLogin();
  const { contrato } = getCredentials();

  const body = {
    contrato,
    // Referencia propia del cliente para cruzar con el pedido web
    referenciaCliente: input.referenciaCliente,
    destinatario: {
      nombre: input.destinatario.nombre,
      email: input.destinatario.email,
      telefonoContacto: input.destinatario.telefono,
      direccion: {
        calle: input.destinatario.calle,
        numero: input.destinatario.complemento ?? '',
        localidad: input.destinatario.localidad,
        codigoPostal: input.destinatario.codigoPostal,
        provincia: input.destinatario.provincia,
      },
    },
    bultos: input.bultos.map((b) => ({
      pesoEnGramos: b.pesoEnGramos,
      volumenProducto: {
        largoCm: b.largoCm,
        anchoCm: b.anchoCm,
        altoCm: b.altoCm,
      },
      valorDeclarado: b.valorDeclarado ?? 0,
      descripcionContenido: b.descripcion ?? 'Vino / bebidas',
    })),
  };

  const url = `${getBaseUrl()}/v2/ordenes-de-envio`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-authorization-token': token,
      'x-andreani-contrato': contrato,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new AndreaniApiError(
      `Andreani crear orden falló con status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  return response.json() as Promise<AndreaniOrdenResponse>;
}
