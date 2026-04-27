# Guia para retomar el proyecto

Fecha base: 2026-04-09
Actualizada: 2026-04-15

## Resumen brutalmente honesto

La tienda ya esta deployada y operativa en una primera version.

Hoy ya tiene:

- home online
- panel admin usable
- lectura de productos desde Hermes
- publicacion de productos desde Supabase
- banners y publicidad en la home
- checkout base con Mercado Pago
- pedidos web persistidos en Supabase

Lo que falta no es "hacer que la tienda exista".

Lo que falta es cerrar el circuito minimo de ecommerce para que cada compra web tenga:

- un pedido interno
- datos del comprador
- estado de pago
- trazabilidad
- revalidacion antes de cobrar

Sin eso, la web puede mostrar productos y generar cobros, pero todavia no tiene una base operativa completa y confiable.

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
- Deploy inicial en Vercel funcionando con variables configuradas a nivel de proyecto.
- Webhook de Mercado Pago con logica de actualizacion de pedidos ya implementada.
- Revalidacion server-side de precio en checkout antes de crear la preferencia.
- Validacion de firma HMAC del webhook con clave secreta de Mercado Pago.
- Captura de datos del comprador antes de crear el checkout.
- Vista admin inicial de pedidos web con filtros y detalle.

### No esta resuelto

- No hay garantia fuerte de stock antes de cobrar; el precio ya se revalida server-side, pero el stock sigue dependiendo de la calidad del dato disponible.
- No hay integracion real de envio. Andreani sigue pendiente y hoy solo esta contemplado en campos de `web_orders`, no en el flujo operativo.
- No hay integracion de escritura hacia Hermes.
- No hay validacion real de punta a punta del webhook con un pago aprobado en entorno correctamente configurado.

## Pendientes concretos despues de este deploy

- cerrar una compra real aprobada y confirmar actualizacion automatica por webhook
- definir politica real de stock y mensajes de disponibilidad
- agregar una base minima de tests automatizados para checkout, webhook y auth admin
- decidir si el panel de pedidos necesita observaciones internas o acciones operativas
- pulir frontend del formulario de comprador y del panel de pedidos
- definir envio real; Andreani sigue pendiente y no esta implementado

## Conclusión importante

La prioridad correcta no es escribir en Hermes ya.

La prioridad correcta es construir la capa propia de pedidos en Supabase y dejar a Hermes para la etapa siguiente.

Pero la reunion con Hermes pasa a ser importante para la etapa siguiente: la web ya tiene trazabilidad propia y ahora falta confirmar como se registra formalmente la venta aprobada dentro de Hermes.

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

Estado actual:

- Esta fase ya esta avanzada y el objetivo base se cumple: cada checkout deja un pedido guardado y la `external_reference` nace en tu base.
- Lo que queda pendiente de esta fase es enriquecer comprador, envio y operacion.

### Fase 2. Pedir datos del comprador

Objetivo: dejar de cobrar pedidos anonimos sin trazabilidad.

Antes de crear el checkout, pedir en frontend como minimo:

- nombre y apellido o razon social
- email
- telefono
- DNI o CUIT
- direccion basica

No hace falta login obligatorio en esta etapa.

Estado actual:

- Ya hay formulario de comprador en el checkout y esos datos se persisten en `web_orders`.
- Falta validar el flujo completo con un pago aprobado real y luego decidir si hace falta sumar envio estructurado.

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

Estado actual:

- La estructura central ya esta resuelta: el pedido existe antes del checkout y la referencia externa queda persistida.
- Falta endurecer validaciones y dejar de depender solo del payload del frontend.

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

Estado actual:

- La logica ya esta implementada.
- Falta validacion real de extremo a extremo con entorno Mercado Pago consistente y webhook efectivamente disparado.

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

Estado actual:

- Ya existe una primera pantalla admin de pedidos con filtros basicos y detalle.
- Falta validarla con pedidos aprobados reales y decidir si necesita observaciones internas o acciones operativas adicionales.

### Fase 7. Calidad minima automatizada

Objetivo: dejar de depender solo de pruebas manuales para los flujos criticos.

Estado actual:

- No hay una suite de tests automatizados implementada en el repo.
- La validacion actual depende sobre todo de pruebas manuales, `npm run build` y `npm run lint`.

Cobertura minima razonable para la siguiente etapa:

1. Checkout de Mercado Pago.
2. Webhook de Mercado Pago.
3. Auth admin y proteccion de rutas.

### Fase 8. Integracion con Hermes

Objetivo: registrar en Hermes solamente pedidos ya cobrados.

Recien cuando lo anterior exista, avanzar con Hermes.

Corroboracion practica de lo que hoy se espera de Hermes:

- No se espera que la web descuente stock con una escritura directa e independiente.
- Lo esperable es que la web registre la venta aprobada usando el circuito oficial de Hermes.
- Si Hermes descuenta stock al facturar o al emitir el comprobante correcto, esa deberia ser la integracion a implementar.
- La reunion de manana deberia confirmar si eso requiere acceso SQL de escritura, varias tablas, un procedimiento almacenado o algun mecanismo propio del sistema.

Lo que Hermes te tiene que definir:

1. mecanismo oficial de escritura
2. comprobante correcto a generar
3. impacto en stock
4. criterio de busqueda del cliente
5. uso de cliente `0`
6. campos donde guardar datos del comprador
7. si `vista_articulos.Precio` y `vista_articulos.Stock` sirven como verdad operativa para ecommerce
8. si el stock se descuenta al facturar o en otro paso del circuito

Resultado esperado:

- Un `pago_aprobado` pasa a `pendiente_integracion_hermes`.
- Cuando Hermes confirma, pasa a `integrado_hermes`.

## Lo mas urgente para vos

Si mañana te sentas a programar, no empieces por Hermes.

Empeza por esto:

1. Validacion real del webhook con pago aprobado.
2. Regla operativa de stock y disponibilidad.
3. Tests minimos para checkout, webhook y auth admin.
4. Confirmacion del circuito oficial de escritura con Hermes.

## Machete breve para la reunion de manana

1. Que SQL o circuito oficial usa Hermes para registrar una venta web aprobada.
2. Si el stock se descuenta al facturar, al remitir o en otro evento.
3. Que tablas o procedimiento generan cabecera, detalle, pagos y numeracion.
4. Como identificar cliente existente y cuando usar cliente `0`.
5. Donde guardar los datos del comprador si el cliente no existe.
6. Si el precio y stock de `vista_articulos` sirven como dato operativo real para ecommerce.

## Mini checklist para retomar la prueba real

Antes de pedirle a alguien que pague:

1. Confirmar que Vercel tenga `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` y `MERCADOPAGO_WEBHOOK_SECRET` cargadas con valores productivos.
2. Confirmar que la app publica responda `{"received": true}` en `/api/mercadopago/webhook`.
3. Abrir `web_orders` en Supabase ordenado por `created_at desc`.

Durante la prueba:

1. Generar un checkout nuevo de monto minimo.
2. Refrescar `web_orders` y capturar enseguida la nueva `external_reference`.
3. Hacer que el comprador real complete el pago.

Despues del pago:

1. Buscar ese pedido exacto por `external_reference`.
2. Verificar `status = pago_aprobado`.
3. Verificar `payment_status = approved`.
4. Verificar que `mercadopago_payment_id` tenga valor.
5. Verificar que `raw_webhook_payload` ya no este vacio.

Si falla la prueba, anotar:

- fecha y hora
- `external_reference`
- `mercadopago_preference_id`
- resultado observado en Mercado Pago
- estado final del registro en `web_orders`

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