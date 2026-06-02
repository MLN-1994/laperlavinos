# Arquitectura objetivo Hermes <-> E-commerce (implementable)

## 1) Objetivo
- Evitar que Next.js dependa en tiempo real de MySQL Hermes para navegación/checkout. 
- Garantizar consistencia de stock y facturacion sin condiciones de carrera.
- Hacer el procesamiento de pagos idempotente, auditable y recuperable.

## 2) Arquitectura propuesta (resumen)
- Supabase = read model web + estado de ordenes + cola/outbox.
- Hermes = sistema transaccional de stock/facturacion (source of truth operativa).
- Next.js API = orquestacion liviana (no logica transaccional larga en request).
- Worker de integracion (Cron/Background) = sincronizacion catalogo + ejecucion de eventos pendientes.

## 3) Componentes
- Catalog Sync Worker
  - Lee Hermes incremental (updated_at/hash) cada 1-5 min.
  - Upsert en Supabase (productos_erp_snapshot).
  - Full sync nocturno para reconciliacion.
- Checkout API
  - Valida contra Supabase snapshot (no consulta Hermes en caliente).
  - Crea orden + items + evento "stock_reserve_requested".
- Payment Webhook API
  - Valida firma + anti-replay.
  - Actualiza estado pago idempotente.
  - Encola "order_confirm_requested" si pago aprobado.
- Hermes Integration Worker
  - Consume eventos pendientes.
  - Ejecuta reserva/confirmacion/facturacion en Hermes.
  - Marca resultado, reintentos y DLQ.

## 4) Tablas minimas (Supabase)
- productos_erp_snapshot
  - hermes_id (PK)
  - sku
  - nombre
  - precio_base
  - stock_disponible
  - updated_at_erp
  - sync_version
  - last_sync_at
- productos_publicados
  - id (PK)
  - hermes_id (FK a snapshot)
  - publicado (bool)
  - activo (bool)
  - destacado (bool)
  - orden_destacado (smallint, nullable)
  - descripcion_comercial
  - imagenes
  - en_oferta (bool)
  - descuento_porcentaje
- web_orders
  - id (PK)
  - external_reference (UNIQUE)
  - status
  - payment_status
  - payment_provider
  - total_amount
  - hermes_sale_id (nullable)
  - created_at
  - updated_at
- integration_events (outbox/cola)
  - id (PK)
  - event_type
  - order_id
  - idempotency_key (UNIQUE)
  - payload (jsonb)
  - status (pending|processing|done|failed|dead)
  - retry_count
  - next_retry_at
  - last_error
  - created_at
  - updated_at
- webhook_receipts
  - id (PK)
  - provider
  - external_event_id (UNIQUE por provider)
  - signature_valid
  - processed_at

## 5) Reglas de negocio clave
- No duplicar logica ERP en admin web.
  - Admin web solo define publicacion/promocion/merchandising.
  - Stock y precio base provienen del snapshot ERP.
- Destacados maximo 4.
  - Constraint: destacado=true <= 4 (via trigger o funcion de escritura).
- No generar codigos por MAX+1 en alta concurrencia.
  - Usar secuencia/autoincrement o mecanismo oficial Hermes.

## 6) Estados sugeridos de pedido
- draft_checkout
- checkout_generado
- pago_pendiente
- pago_aprobado
- stock_reservado
- facturacion_pendiente
- hermes_registrado
- pago_rechazado
- cancelado
- compensacion_pendiente
- error_integracion

## 7) Flujo feliz
1. Cliente confirma checkout.
2. Se crea web_order + evento stock_reserve_requested.
3. Worker reserva stock en Hermes (TTL corto) y marca stock_reservado.
4. Webhook pago aprobado llega y se registra (idempotente).
5. Se encola order_confirm_requested.
6. Worker confirma venta en Hermes (factura/comprobante oficial).
7. Se actualiza web_order a hermes_registrado y se envia email.

## 8) Flujo de error y compensacion
- Caso A: Pago aprobado pero Hermes caido
  - Evento queda failed con backoff exponencial.
  - Alerta operativa si supera umbral (ej: 10 min).
- Caso B: Reserva vencida antes de pago
  - Reintento de reserva; si falla, marcar compensacion_pendiente y notificar.
- Caso C: Webhook duplicado/replay
  - Se ignora por external_event_id/idempotency_key y responde 200.
- Caso D: Facturacion Hermes exitosa pero update Supabase falla
  - Reconciliador nocturno corrige por hermes_sale_id/comprobante.

## 9) Seguridad minima obligatoria
- Webhooks
  - Validar firma HMAC y ventana temporal.
  - Persistir recibo de webhook para anti-replay.
- OpenPay
  - No permitir modo sin secreto en produccion.
  - Evitar secrets por querystring; preferir header firmado.
- MySQL Hermes
  - No exponer DB publica.
  - Acceso por red privada/tunel y IP allowlist.
  - Usuario de minimo privilegio + TLS + rotacion de credenciales.

## 10) Plan de implementacion por fases
- Fase 1 (rapida, bajo riesgo)
  - Introducir integration_events + idempotency_key.
  - Mover registro Hermes a worker con reintentos.
  - Endurecer validacion webhook OpenPay en produccion.
- Fase 2
  - Implementar reserva de stock con TTL.
  - Separar estados stock_reservado/facturacion_pendiente.
- Fase 3
  - Sync incremental robusto + reconciliador diario.
  - Dash admin de eventos fallidos y reproceso manual.

## 11) KPIs operativos
- Tiempo pago_aprobado -> hermes_registrado (p95).
- % pedidos en error_integracion > X minutos.
- Tasa de reintentos por evento.
- Diferencia de stock snapshot vs Hermes real.

---

## 12) Estado de implementacion (al 2026-06-02)

### ✅ Completado en esta sesion

**Catalog Sync Worker (Fase 1)**
- `src/lib/hermesSync.ts` — logica pura de sync: parseRow, upsertBatched, deactivateMissing, runCatalogSync.
- `src/lib/hermesClient.ts` — extendido con fetchAllHermesRows() + HermesRawRow tipado.
- `src/types/supabase.ts` — tipo hermes_erp_snapshot agregado.
- `src/app/api/admin/catalog-sync/route.ts` — endpoint HTTP con dual auth (CRON_SECRET o sesion admin).
- `docs/hermes-erp-snapshot.sql` — DDL: tabla BIGINT PK, RLS, trigger updated_at, vista vista_catalogo_web.
- `vercel.json` — cron configurado a 1 vez/dia a las 3 AM UTC (limite plan Hobby).
- `.github/workflows/catalog-sync.yml` — GitHub Actions cron cada 15 minutos (gratuito, sin limites de plan).
- `scripts/test-catalog-sync.ts` — script local con --dry-run y full sync.
- `package.json` — scripts sync:dry y sync:test + devDependency tsx.
- `.env.local` — CRON_SECRET generado y guardado.
- Sync probado y confirmado: 2869 filas leidas, 2865 upserted, 4 omitidas (BIGINT unsafe), idempotente.

**Checkout decoupling (Fase 1)**
- `src/app/api/mercadopago/checkout/route.ts` — reemplazado loadLiveHermesProductsMap con loadSnapshotMap. Ya no consulta MySQL en tiempo real durante el checkout.
- `src/app/api/openpay/checkout/route.ts` — idem.
- Probado en produccion: checkouts MP y OpenPay generados correctamente.

**Fixes**
- IDs negativos de Hermes: corregido guard `<= 0` a `=== 0`.
- BIGINT overflow: guard Number.isSafeInteger + columna hermes_id como BIGINT en Postgres.
- Comentario `*/5` en route.ts causaba syntax error de webpack: reemplazado por texto descriptivo.
- parseHermesId: funcion huerfana eliminada de ambos checkouts.
- CRON_SECRET agregada en Vercel Environment Variables.
- ✅ **Webhook OpenPay endurecido**: si falta OPENPAY_WEBHOOK_SECRET en env, el endpoint lanza error 500 en lugar de aceptar cualquier request sin autenticar. Variable confirmada presente en Vercel.

### ⏳ Pendiente verificar manana (2026-06-03)

**GitHub Actions cron automatico**
- El workflow `catalog-sync.yml` fue pusheado correctamente (commit 59ff9e3).
- GitHub tarda entre 30 min y 1 hora en registrar triggers `schedule` nuevos.
- Verificar en github.com/MLN-1994/laperlavinos → Actions → Catalog Sync:
  - Deben aparecer runs con origen "Schedule" (no solo "Manually run").
  - Si a las 24 hs no hay ningun run automatico, el cron no se registro → revisar si el repo esta en modo "inactivo" o si el workflow tiene algun error de YAML.
- Mientras tanto el sync se puede disparar manualmente con:
  ```
  Invoke-RestMethod -Uri "https://laperlavinos.vercel.app/api/admin/catalog-sync" -Method POST -Headers @{ Authorization = "Bearer <CRON_SECRET>" }
  ```

### ⏳ Proximas fases

- **Fase 1b** — integration_events / outbox: mover registro en Hermes a worker con reintentos (actualmente es fire-and-forget en webhook).
- **Fase 1c** — endurecer webhook OpenPay: no permitir modo sin secreto en produccion. ✅ HECHO
- **Fase 2** — reserva de stock con TTL antes del pago.
- **Fase 3** — sync incremental + reconciliador diario.

---

## 13) Análisis Fase 1b — Outbox / reintentos para registro en Hermes

### Qué hay hoy

Cuando un pago se aprueba (MP o OpenPay), el webhook hace esto:

```
after(async () => {
  await fetch('/api/hermes/venta', { method: 'POST', body: { web_order_id } })
  // si falla → console.error → nada más
})
```

- `after()` corre DESPUÉS de que el webhook ya respondió 200 a MP/OpenPay.
- Si `/api/hermes/venta` falla (Hermes caído, timeout, error MySQL), el error se loguea en consola y no pasa nada más. No hay reintento.
- El pedido queda en estado `pago_aprobado` en Supabase pero nunca llega a `hermes_registrado`.
- No hay alerta. No hay forma de saber cuántos pedidos fallaron salvo revisar los logs de Vercel manualmente.

### Qué hace `/api/hermes/venta`

Transacción MySQL de 8 pasos en Hermes:
1. MAX(Codigo)+1 en comprob_ventas
2. INSERT comprob_ventas (cabecera de venta)
3. INSERT comprobantes (datos de entrega)
4. INSERT items_comprobantes (por cada artículo)
5. INSERT movimientos_stk (por cada artículo)
6. INSERT pagos
7. INSERT pagos_detalle
8. UPDATE articulos (descuenta stock)

Si cualquier paso falla → ROLLBACK en MySQL → pedido pagado pero no registrado en el ERP.
El endpoint ya tiene buena estructura: logger por pasos, VentaError tipado, manejo de rollback.

### Lo que NO hay todavía

- No hay tabla `integration_events` en Supabase (outbox/cola).
- No hay worker que reintente eventos fallidos.
- No hay panel admin para ver pedidos en `pago_aprobado` sin `hermes_registrado`.
- No hay alerta cuando un pedido falla más de N veces.

### Riesgo actual

Medio en produccion: Hermes está en una PC de escritorio. Puede apagarse o perder red.
Cada vez que eso pase durante un pago aprobado → pedido queda sin registrar en el ERP sin que nadie lo sepa.

### Plan propuesto para Fase 1b

**Paso 1 — Crear tabla `integration_events` en Supabase (SQL)**
```sql
CREATE TABLE integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  web_order_id uuid NOT NULL,
  idempotency_key text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  retry_count int NOT NULL DEFAULT 0,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Paso 2 — Modificar webhooks (MP y OpenPay)**
En vez de `after(fetch('/api/hermes/venta'))`:
→ INSERT en `integration_events` con status=pending.

**Paso 3 — Crear worker `/api/admin/process-events`**
- Autenticado con CRON_SECRET.
- Lee eventos pending/failed con next_retry_at <= now().
- Llama /api/hermes/venta por cada uno.
- OK → status=done. Falla → backoff exponencial. >=5 intentos → status=dead.

**Paso 4 — Agregar al cron de GitHub Actions**
Agregar step al workflow catalog-sync.yml para llamar process-events cada 5 minutos.

### Impacto en código existente

- `src/app/api/mercadopago/webhook/route.ts` — reemplazar after(fetch...) por INSERT en Supabase.
- `src/app/api/openpay/webhook/route.ts` — idem.
- `src/app/api/hermes/venta/route.ts` — no cambia nada.
- `src/app/api/admin/process-events/route.ts` — archivo nuevo.
- `.github/workflows/catalog-sync.yml` — agregar step process-events.
- `src/types/supabase.ts` — agregar tipo integration_events.

### Preguntas antes de implementar

1. ¿El webhook de MP también llama a Hermes hoy? ✅ SÍ — mismo patrón after(fetch...) en mercadopago/webhook/route.ts. Además envía email de confirmación al comprador dentro del mismo after(). Ambos webhooks (MP y OpenPay) necesitan el cambio.
2. ¿Hay panel admin para ver pedidos fallidos? ✅ SÍ — existe /admin/pedidos con estados visibles (HERMES REGISTRADO, OPENPAY: APPROVED, MP: APPROVED, etc.) y búsqueda por referencia/comprador. Se puede agregar un filtro "Pendiente Hermes" para ver pedidos atascados en pago_aprobado sin hermes_registrado.
3. ¿Alerta por email cuando un pedido quede en dead (5 reintentos fallidos)? — PENDIENTE RESPUESTA DEL CLIENTE.
