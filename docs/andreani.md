# Integración Andreani — La Perla Vinos

**Estado:** Estructura implementada. Pendiente cargar credenciales reales.
**Fecha:** 2026-05-06

---

## Archivos involucrados

| Archivo | Descripción |
|---|---|
| `src/lib/andreaniClient.ts` | Cliente base: autenticación, cotización y creación de órdenes |
| `src/app/api/andreani/cotizar/route.ts` | Endpoint público para cotizar el flete antes del pago |
| `src/app/api/andreani/orden/route.ts` | Endpoint interno para crear la orden/etiqueta post-pago |
| `.env.local.example` | Guía de todas las variables de entorno del proyecto |

---

## Variables de entorno requeridas

Cargar en `.env.local` (desarrollo) y en Vercel → Settings → Environment Variables (producción).

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ANDREANI_USUARIO` | Usuario provisto por Andreani al ejecutivo comercial | `usuario_qa@andreani.com` |
| `ANDREANI_CONTRASENA` | Contraseña provista por Andreani | `MiClave123` |
| `ANDREANI_CONTRATO` | Número de contrato provisto por Andreani | `CDA0000123` |
| `ANDREANI_CP_ORIGEN` | CP del punto de despacho (depósito/negocio) | `5000` (Córdoba) |
| `ANDREANI_QA` | `true` = entorno QA (pruebas) / `false` = producción real | `true` |
| `INTERNAL_API_SECRET` | Clave para proteger `/api/andreani/orden` | UUID aleatorio |

### Cómo generar `INTERNAL_API_SECRET`

```bash
node -e "console.log(require('crypto').randomUUID())"
```

Copiar el resultado y pegarlo como valor de la variable.

---

## Cómo obtener las credenciales de Andreani

Andreani maneja **dos sets de credenciales separados**: QA y Producción.
Nunca te dan producción directamente — primero validás en QA.

**Proceso oficial:**

1. **Registrarse** en andreani.com como usuario PyME (si aún no son clientes).
2. **Contactar al Ejecutivo Comercial** de Andreani y pedir las credenciales de QA para integración.
   - Las envían por email en ~24hs.
   - Incluyen: usuario, contraseña y número de contrato de QA.
3. **Probar la integración** en el entorno QA (`ANDREANI_QA=true`) con lo ya implementado.
4. **Validación UAT** — Andreani revisa que la integración funcione correctamente end-to-end.
5. **Recién entonces** otorgan las credenciales de **Producción**.

**Links útiles:**
- Portal Andreani: https://clientes.andreani.com
- Integraciones: https://www.andreani.com/empresa/integraciones
- Documentación API (catálogo): https://developers.andreani.com

---

## Flujo de uso

### 1. Cotización (antes del pago)

El frontend llama al endpoint cuando el usuario ingresa su código postal en el checkout:

```
POST /api/andreani/cotizar
Content-Type: application/json

{
  "cpDestino":     "1425",
  "pesoEnGramos":  3000,
  "volumenEnCm3":  6000,    ← opcional
  "cantidadBultos": 1       ← opcional, default 1
}
```

**Respuesta exitosa:**
```json
{
  "tarifas": [
    {
      "contrato":     "CDA0000123",
      "tarifaConIVA": 1500.00,
      "tarifaSinIVA": 1239.67,
      "diasHabiles":  3,
      "servicio":     "Andreani Estándar"
    }
  ]
}
```

### 2. Crear orden de envío (post-pago)

Llamar desde el panel admin o desde el webhook de Mercado Pago cuando el pago queda en estado `approved`.

```
POST /api/andreani/orden
Content-Type: application/json
x-internal-secret: {INTERNAL_API_SECRET}

{
  "referenciaCliente": "pedido-web-1234567890-abc12345",
  "destinatario": {
    "nombre":       "Juan Pérez",
    "email":        "juan@email.com",
    "telefono":     "1145678901",
    "calle":        "Av. Corrientes 1234",
    "complemento":  "Piso 3 Dpto B",
    "codigoPostal": "1043",
    "localidad":    "Ciudad Autónoma de Buenos Aires",
    "provincia":    "Buenos Aires"
  },
  "bultos": [
    {
      "pesoEnGramos":   3000,
      "largoCm":        30,
      "anchoCm":        20,
      "altoCm":         25,
      "valorDeclarado": 15000,
      "descripcion":    "Vinos x6"
    }
  ]
}
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "numeroAndreani": "EP000000001AR",
  "etiquetaUrl":   "https://...",
  "raw":           { "...respuesta cruda de Andreani..." }
}
```

---

## Consideraciones técnicas

- **Autenticación:** El login usa **Basic Auth** (usuario:contraseña en Base64 en el header `Authorization`). El token devuelto va en **`x-authorization-token`** en todos los requests posteriores (no es `Bearer`).
- **Vigencia del token:** 24 horas. El cliente lo cachea por 23hs en memoria para renovarlo automáticamente antes de que expire.
- **QA vs Producción:** Controlado por `ANDREANI_QA`. En `true` usa `https://apisqa.andreani.com`, en `false` usa `https://apis.andreani.com`.
- **Seguridad del endpoint interno:** `/api/andreani/orden` exige la cabecera `x-internal-secret`. Si `INTERNAL_API_SECRET` no está configurada, el endpoint devuelve 401 siempre.
- **Errores tipados:** El cliente lanza `AndreaniConfigError` (credenciales faltantes) o `AndreaniApiError` (error HTTP de la API) para manejo diferenciado en los endpoints.
- **Rutas exactas de la API:** Los endpoints de tarifas y órdenes deben verificarse contra el catálogo oficial de Andreani una vez obtenidas las credenciales de QA — pueden diferir de los paths implementados.

---

## Pendientes para activar en producción

- [ ] Cargar las 5 variables de Andreani en Vercel (producción)
- [ ] Confirmar el número de contrato con Andreani
- [ ] Confirmar el CP de origen (punto de despacho del negocio)
- [ ] Probar cotización con el sandbox de Andreani antes de pasar a producción
- [ ] Integrar el resultado de cotización en el formulario de checkout (mostrarle el precio al cliente)
- [ ] Decidir si la orden de envío se crea automáticamente desde el webhook o manualmente desde el panel admin
