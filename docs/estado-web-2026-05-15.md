# Estado de la web — Análisis exhaustivo
**Fecha:** 15/05/2026

---

## ✅ Lo que funciona hoy

### Catálogo y carrito
- Productos desde Hermes (solo lectura) + `productos_publicados` en Supabase
- Carrito con add/remove/cantidad (Zustand, persistido en localStorage)
- Página de producto individual con galería de imágenes
- Búsqueda, filtros por grupo, ordenamiento por precio

### Checkout — 3 métodos de pago
- **Mercado Pago**: checkout link + webhook HMAC validado + registro en Hermes post-pago
- **OpenPay (BBVA)**: checkout + webhook + registro en Hermes
- **Transferencia bancaria**: 10% descuento, crea web_order → admin aprueba → registra en Hermes

### Datos del comprador y envío
- Formulario completo: nombre, email, teléfono, documento, dirección
- Envío a domicilio con 2 zonas (Patagonia $20.990 / General $24.426)
- Envío gratis ≥ $190.000 o Bahía Blanca (CP 8000)
- Retiro en local (Pilmaiquén 292, Bahía Blanca) implementado en CartDrawer

### Trazabilidad / Admin
- `web_orders` + `web_order_items` en Supabase con todos los estados
- Panel admin: pedidos con filtros, detalle, notas internas, aprobar/rechazar transferencias
- Panel admin: banners, productos (editar/publicar), publicidad, MP OAuth, OpenPay credentials
- `/pago/resultado` muestra detalle del pedido (items, envío, total)
- `/transferencia/confirmacion` muestra datos bancarios + resumen del pedido

### Infraestructura
- Build limpio (`npm run build` pasa)
- Deploy en Vercel funcional
- Hermes venta registrada en las 3 rutas de pago (`after()` para garantizar ejecución serverless)
- Templates de email preparados (confirmación de pedido + aviso de transferencia pendiente)
- Páginas legales (términos, privacidad, devoluciones)
- Sitemap generado automáticamente

---

## ❌ Lo que falta / está roto

### 🔴 CRÍTICO — Bloquea operación real o genera riesgo de seguridad

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 1 | **`MERCADOPAGO_WEBHOOK_SECRET` ausente en `.env.local`** (verificar también en Vercel) | ⚠️ A verificar | Cargar en `.env.local` Y en Vercel > Settings > Environment Variables. Valor: portal MP → Tu negocio → Webhooks → "Clave secreta" |
| 2 | **SQL migrations de transferencia no confirmadas en Supabase** | ⚠️ A verificar | Ver sección "SQL pendiente" más abajo |
| 3 | **Variables bancarias ausentes** (`TRANSFER_CBU`, `TRANSFER_ALIAS`, `TRANSFER_TITULAR`, `TRANSFER_BANCO`) | ⚠️ A verificar | La página `/transferencia/confirmacion` mostrará datos vacíos si no están cargadas |

### 🟠 ALTO — Experiencia de usuario afectada significativamente

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 4 | **Emails no funcionales** — falta `RESEND_API_KEY` + dominio `laperlavinos.com` no verificado en Resend | ❌ Pendiente | Agregar DNS TXT en registrar → verificar en Resend → crear API key → cargar `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_NOTIFY_EMAIL` en Vercel y `.env.local` |
| 5 | **Menú de navegación mobile ausente** — `<nav>` es `hidden md:flex` sin hamburger | ❌ Pendiente | Agregar menú hamburguesa en `Header.tsx` para mobile |
| 6 | **`NEXT_PUBLIC_APP_URL=laperlavinos.vercel.app`** en lugar de `laperlavinos.com` | ⚠️ A corregir | Actualizar en Vercel y `.env.local` cuando el dominio esté activo |

### 🟡 MEDIO — Calidad, UX secundaria, operación

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 7 | **2 errores de lint** en `ResultadoPago.tsx` (`setLoadingSummary(true)` dentro de `useEffect`) | ❌ Pendiente | Mover `setLoadingSummary` fuera del body del effect o usar patrón correcto |
| 8 | **Sin skeleton loading** en `/productos` — solo muestra "Cargando productos..." | ❌ Pendiente | Agregar skeleton cards (Tailwind animate-pulse) en `ProductList.tsx` |
| 9 | **22 warnings `<img>` sin `next/image`** | ⚠️ Bajo | Afecta CLS/LCP y Core Web Vitals. Migrar gradualmente |
| 10 | **Comprobante de prueba 1000010 en Hermes** sin borrar ni aclarar | ⚠️ Pendiente | Borrar o marcar como test en Hermes para no confundir al contador |
| 11 | **`INTERNAL_API_SECRET`** no configurado | ⚠️ Bajo | La ruta `/api/andreani/orden` queda sin protección interna real |

### 🔵 BAJO / FUTURO — No bloquea nada hoy

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 12 | **Andreani sin integrar realmente** — costo estimado fijo, no cotización real | ⏳ Espera credenciales | Cuando lleguen `ANDREANI_USUARIO`, `ANDREANI_CONTRASENA`, `ANDREANI_CONTRATO`, `ANDREANI_CP_ORIGEN` activar la integración |
| 13 | **0 tests automatizados** | ⏳ Largo plazo | Prioridad: checkout, webhook, auth admin |
| 14 | **Variables `MERCADOPAGO_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `HERMES_PASSWORD` no marcadas como Sensitive en Vercel** | ⏳ A futuro | En Edit: desmarcar "Development", marcar "Sensitive", guardar. Los valores son correctos, solo falta encriptarlos. |
| 15 | **Reestructuración grande solicitada** | ⏳ A definir | Pendiente de especificar alcance y prioridades |
| 14 | **Stock no prometible** | Limitación Hermes | El precio se revalida server-side pero stock no puede garantizarse (Hermes read-only) |

---

## ✅ SQL — Verificado el 15/05/2026

**Schema de `web_orders` completo** (29 columnas verificadas en Supabase):
- `payment_provider`, `openpay_order_uuid`, `notas_internas`, `discount_amount` (default 0), `discount_type` → todos presentes.

**Constraint `web_orders_status_check` completo** — incluye todos los estados activos:
```
checkout_generado, pago_aprobado, pago_rechazado, pago_cancelado,
hermes_registrado, pendiente_transferencia, transferencia_aprobada, transferencia_rechazada
```

No hace falta correr ningún SQL adicional.

---

## 🔑 Variables de entorno — Checklist

### En `.env.local` (local) y Vercel (producción)

| Variable | Estado local | Notas |
|----------|-------------|-------|
| `NEXT_PUBLIC_APP_URL` | `laperlavinos.vercel.app` | Cambiar a `https://laperlavinos.com` cuando el dominio esté configurado |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | ✅ | — |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | — |
| `MERCADOPAGO_CLIENT_ID` | ✅ | — |
| `MERCADOPAGO_CLIENT_SECRET` | ✅ | — |
| `MERCADOPAGO_WEBHOOK_SECRET` | ⚠️ Existe pero "Needs Attention" en Vercel | Editar → marcar como Sensitive para encriptarlo |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | — |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Existe pero "Needs Attention" en Vercel | Editar → marcar como Sensitive |
| `HERMES_HOST` | ✅ | — |
| `HERMES_USER` | ✅ | — |
| `HERMES_PASSWORD` | ✅ | — |
| `HERMES_DATABASE` | ✅ | — |
| `HERMES_PORT` | ✅ | — |
| `OPENPAY_CLIENT_ID` | ✅ | — |
| `OPENPAY_CLIENT_SECRET` | ✅ | — |
| `OPENPAY_AUTH_BASE_URL` | ✅ | — |
| `OPENPAY_CHECKOUT_BASE_URL` | ✅ | — |
| `OPENPAY_WEBHOOK_SECRET` | ✅ | — |
| `TRANSFER_CBU` | ⏳ Bloqueado por cliente | Cargar cuando el cliente provea los datos bancarios |
| `TRANSFER_ALIAS` | ⏳ Bloqueado por cliente | — |
| `TRANSFER_TITULAR` | ⏳ Bloqueado por cliente | — |
| `TRANSFER_BANCO` | ⏳ Bloqueado por cliente | — |
| `RESEND_API_KEY` | ❌ FALTA en Vercel | Requiere dominio verificado en Resend primero |
| `RESEND_FROM_EMAIL` | ❌ FALTA | Ej: `La Perla Vinos <noreply@laperlavinos.com>` |
| `RESEND_NOTIFY_EMAIL` | ❌ FALTA | Email del admin para recibir avisos |
| `INTERNAL_API_SECRET` | ❌ FALTA (bajo) | Protege `/api/andreani/orden` |
| `ANDREANI_USUARIO` | ⏳ Sin credenciales | Cuando lleguen del cliente |
| `ANDREANI_CONTRASENA` | ⏳ Sin credenciales | — |
| `ANDREANI_CONTRATO` | ⏳ Sin credenciales | — |
| `ANDREANI_CP_ORIGEN` | ⏳ Sin credenciales | `8000` (Bahía Blanca) |

---

## 🕐 Estimación de tiempo restante

| Objetivo | Tiempo estimado | Dependencias externas |
|----------|----------------|----------------------|
| **Aceptar primer pago real sin riesgos** (cargar `MERCADOPAGO_WEBHOOK_SECRET` + SQL + vars bancarias) | 2–4 horas | Ninguna |
| **Flujo de transferencia 100% funcional** (vars bancarias + SQL confirmado) | +1–2 horas | Ninguna |
| **Emails funcionando** (Resend API key + dominio) | +2 horas de dev | 1–2 días DNS propagation |
| **Mobile navigation** (hamburger menu en Header) | +2–3 horas | Ninguna |
| **Skeleton loading** en `/productos` | +2 horas | Ninguna |
| **Corregir errores de lint** | +30 min | Ninguna |
| **Andreani real** | +4–8 horas | Credenciales del cliente |
| **Tests automatizados** | +2–3 semanas | — |

### Resumen ejecutivo
- **Para recibir pagos reales hoy**: cargar `MERCADOPAGO_WEBHOOK_SECRET` en Vercel → 30 minutos.
- **Para que transferencia funcione end-to-end**: SQL + vars bancarias → ~2 horas.
- **Para tener UX completa** (emails, mobile, skeleton): ~1 semana incluyendo espera de DNS.
- **Andreani real y tests**: largo plazo, depende de terceros.
