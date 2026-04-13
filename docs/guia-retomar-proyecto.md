# Guia para retomar el proyecto

Fecha: 2026-04-09

## Resumen brutalmente honesto

La tienda ya tiene frente visual, panel admin, lectura de productos desde Hermes y generacion de links de Mercado Pago.

Lo que falta no es "integrar Hermes completo".

Lo que falta es cerrar el circuito minimo de ecommerce para que cada compra web tenga:

- un pedido interno
- datos del comprador
- estado de pago
- trazabilidad
- revalidacion antes de cobrar

Sin eso, la web puede mostrar productos y generar cobros, pero todavia no tiene una base operativa confiable.

## Estado real hoy

### Ya funciona

- Lectura de productos desde Hermes en modo solo lectura usando `vista_articulos`.
- Publicacion de productos en la web desde Supabase.
- Esquema de `productos_publicados` alineado con lo que espera la app actual.
- Panel admin con login y control por `is_admin`.
- Banners y publicidad home administrables.
- Configuracion manual de cuenta de Mercado Pago desde admin.
- Generacion de checkout link de Mercado Pago desde carrito o panel admin.
- Tablas `web_orders` y `web_order_items` ya creadas en Supabase.
- Tipos de Supabase actualizados para pedidos web.

### No esta resuelto

- El checkout no guarda intento de compra antes de mandar a Mercado Pago.
- No se capturan datos del comprador en el flujo actual.
- El webhook de Mercado Pago no actualiza nada: solo loguea.
- No existe panel de pedidos.
- No hay revalidacion fuerte de precio y disponibilidad antes de cobrar.
- No hay integracion de escritura hacia Hermes.

## Conclusión importante

La prioridad correcta no es escribir en Hermes ya.

La prioridad correcta es construir la capa propia de pedidos en Supabase y dejar a Hermes para la etapa siguiente.

## Orden correcto de trabajo

### Fase 1. Pedidos web en Supabase

Objetivo: que cada checkout deje un pedido interno consultable.

Crear estas tablas:

1. `web_orders`
2. `web_order_items`

Campos sugeridos para `web_orders`:

- `id` uuid pk
- `created_at`
- `updated_at`
- `status` text
- `external_reference` text unique
- `mercadopago_preference_id` text null
- `mercadopago_payment_id` text null
- `payment_status` text null
- `buyer_name` text
- `buyer_email` text null
- `buyer_phone` text null
- `buyer_document_type` text null
- `buyer_document_number` text null
- `buyer_address` text null
- `total_amount` numeric
- `currency_id` text default 'ARS'
- `raw_checkout_payload` jsonb null
- `raw_webhook_payload` jsonb null
- `notes` text null

Campos sugeridos para `web_order_items`:

- `id` uuid pk
- `order_id` uuid fk -> `web_orders.id`
- `created_at`
- `product_id` text
- `hermes_id` integer null
- `title` text
- `quantity` integer
- `unit_price` numeric
- `line_total` numeric
- `product_snapshot` jsonb null

Estados sugeridos para `web_orders.status`:

- `pendiente`
- `checkout_generado`
- `pago_aprobado`
- `pago_rechazado`
- `pago_cancelado`
- `error_webhook`
- `pendiente_integracion_hermes`
- `integrado_hermes`

Resultado esperado:

- Cada vez que se genera checkout, queda un pedido guardado.
- El `external_reference` nace en tu base, no solo en Mercado Pago.

### Fase 2. Pedir datos del comprador

Objetivo: dejar de cobrar pedidos anonimos sin trazabilidad.

Antes de crear el checkout, pedir en frontend como minimo:

- nombre y apellido o razon social
- email
- telefono
- DNI o CUIT
- direccion basica

No hace falta login obligatorio en esta etapa.

Resultado esperado:

- Cada pedido queda asociado a datos concretos de una persona.
- Despues esos datos sirven tanto para operacion propia como para futura integracion con Hermes.

### Fase 3. Cambiar la logica del checkout

Objetivo: que Mercado Pago no sea el origen del pedido, sino una consecuencia del pedido.

Flujo correcto:

1. El usuario arma carrito.
2. Completa sus datos.
3. Tu backend revalida productos, precio y disponibilidad.
4. Tu backend crea `web_orders` y `web_order_items`.
5. Tu backend genera `external_reference`.
6. Tu backend crea preferencia en Mercado Pago.
7. Guardas `preference_id` y estado `checkout_generado`.
8. Redirigis al checkout.

Lo que no conviene hacer:

- generar `external_reference` solo con `Date.now()` y no persistirlo
- depender del carrito del frontend como fuente de verdad

Resultado esperado:

- Si algo falla despues, el pedido igual existe.
- Podes buscar cualquier pago por `external_reference`.

### Fase 4. Webhook real de Mercado Pago

Objetivo: que el sistema actualice estados automaticamente.

El webhook debe:

1. recibir la notificacion
2. identificar el pago
3. consultar a Mercado Pago si hace falta validar datos reales
4. encontrar el pedido por `external_reference`
5. guardar payload resumido o completo
6. actualizar `status` y `payment_status`

Mapeo sugerido:

- approved -> `pago_aprobado`
- rejected -> `pago_rechazado`
- cancelled -> `pago_cancelado`
- pending / in_process -> mantener pendiente segun tu criterio

Resultado esperado:

- El webhook deja trazabilidad y cambia el estado del pedido.
- Ya no dependes de mirar logs sueltos.

### Fase 5. Revalidacion antes de cobrar

Objetivo: no cobrar cosas con precio viejo o stock dudoso.

Antes de crear preferencia:

1. volver a leer los productos vigentes
2. cruzar contra productos publicados
3. confirmar que existen
4. confirmar precio actual
5. revisar stock disponible si el dato es confiable

Si no podes garantizar stock 100%, mostrar un mensaje honesto y no prometer stock en tiempo real.

Resultado esperado:

- El backend deja de confiar ciegamente en lo que vino del navegador.

### Fase 6. Panel de pedidos

Objetivo: poder operar sin entrar a Supabase ni a logs.

Crear en admin una pantalla con:

- listado de pedidos
- filtro por estado
- fecha
- comprador
- total
- external_reference
- payment_status
- detalle de items
- observaciones internas

Resultado esperado:

- Ya podes seguir un pedido de punta a punta desde el panel.

### Fase 7. Integracion con Hermes

Objetivo: registrar en Hermes solamente pedidos ya cobrados.

Recien cuando lo anterior exista, avanzar con Hermes.

Lo que Hermes te tiene que definir:

1. mecanismo oficial de escritura
2. comprobante correcto a generar
3. impacto en stock
4. criterio de busqueda del cliente
5. uso de cliente `0`
6. campos donde guardar datos del comprador
7. si `vista_articulos.Precio` y `vista_articulos.Stock` sirven como verdad operativa para ecommerce

Resultado esperado:

- Un `pago_aprobado` pasa a `pendiente_integracion_hermes`.
- Cuando Hermes confirma, pasa a `integrado_hermes`.

## Lo mas urgente para vos

Si mañana te sentas a programar, no empieces por Hermes.

Empeza por esto:

1. Formulario de datos del comprador en el checkout.
2. Refactor de `/api/mercadopago/checkout` para crear pedido antes de generar preferencia.
3. Webhook que actualice pedidos.
4. Vista admin de pedidos.

## Archivos donde tocar primero

### Para persistencia y tipos

- `docs/` con el SQL nuevo de pedidos web.
- `src/types/supabase.ts`

### Para checkout

- `src/app/components/CartDrawer.tsx`
- `src/app/api/mercadopago/checkout/route.ts`
- `src/lib/mercadoPago.ts`

### Para webhook

- `src/app/api/mercadopago/webhook/route.ts`

### Para admin

- nueva ruta tipo `src/app/admin/pedidos/page.tsx`
- posible nueva API admin para listar pedidos

## Criterios de terminado reales

No considerar esta etapa terminada hasta que pase esto:

1. Un checkout genera un pedido interno visible.
2. El pedido guarda comprador, items, total y `external_reference`.
3. El webhook actualiza ese pedido cuando Mercado Pago responde.
4. El admin puede ver el pedido y su estado.
5. El sistema puede dejar un pedido listo para futura integracion con Hermes.

## Cosas que no deberias hacer ahora

- No escribir directo en tablas de Hermes sin circuito confirmado.
- No prometer stock en tiempo real si no lo validaste bien.
- No depender solo de logs de webhook.
- No generar links de pago sin dejar trazabilidad propia.
- No mezclar la integracion con Hermes con la construccion del circuito basico de pedidos.

## Definicion corta del proyecto, como deberias pensarlo

Hoy este proyecto no es "una tienda conectada a Hermes".

Hoy este proyecto es:

- una tienda que muestra productos vivos desde Hermes
- una capa admin apoyada en Supabase
- una integracion inicial con Mercado Pago
- un circuito de pedidos web que todavia no fue terminado

La pieza faltante central es `pedidos web`, no `Hermes`.

## Plan minimo de ejecucion

### Bloque 1

- Crear SQL y tipos de pedidos web.

### Bloque 2

- Guardar pedido antes del checkout.

### Bloque 3

- Procesar webhook y actualizar estados.

### Bloque 4

- Crear panel admin de pedidos.

### Bloque 5

- Recién ahi preparar integracion de escritura con Hermes.

## Si queres una regla para no perderte

Cada vez que dudes entre tocar Hermes o tocar pedidos web, casi seguro primero tenes que tocar pedidos web.