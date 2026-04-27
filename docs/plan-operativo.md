# Plan operativo austero

Fecha base: 2026-04-01
Actualizado: 2026-04-17

## Restricciones y estado confirmado

- 2026-04-13: primer intento de deploy en Vercel detecto un error de build de TypeScript en `src/app/api/mercadopago/checkout/route.ts` por incompatibilidad entre `CheckoutRequestBody` y el tipo `Json` de Supabase al guardar `raw_checkout_payload`.
- 2026-04-13: el bloqueo de deploy se corrigio serializando el payload del checkout a `Json` antes del insert y fijando `turbopack.root = __dirname` en `next.config.ts` para evitar ambiguedad por multiples lockfiles.
- 2026-04-13: el proyecto ya quedo deployado en Vercel y funcional despues de cargar correctamente las variables de entorno en Project Settings.
- 2026-04-15: el checkout de Mercado Pago deja de confiar en precio, imagen y titulo enviados por el frontend; ahora revalida server-side contra `productos_publicados` y, si Hermes responde, prioriza el precio vivo antes de crear la preferencia.
- 2026-04-15: el webhook de Mercado Pago ahora exige `MERCADOPAGO_WEBHOOK_SECRET`, valida `x-signature` y `x-request-id` con HMAC SHA-256 y rechaza notificaciones sin firma valida.
- Hermes hoy se usa en solo lectura.
- No hay escritura sobre facturacion, stock ni comprobantes desde esta app.
- Hasta que Hermes habilite escritura o un procedimiento oficial, la web no reemplaza el circuito operativo de Hermes.
- En desarrollo local, `npm run dev` quedo usando Webpack para evitar crashes de memoria con Turbopack en este entorno Windows.

## Objetivo mientras Hermes siga read-only

Mantener la web util, administrable y trazable sin depender de escritura en Hermes.

Con el deploy inicial ya funcionando, priorizar trazabilidad, consistencia funcional y operacion minima antes que optimizaciones cosmeticas.

- La falta de escritura en Hermes no bloquea la Fase 2 ni la trazabilidad propia: los pedidos web, sus estados y la relacion con Mercado Pago se resuelven primero en Supabase.

## Prioridades

### Fase 1. Bloqueos tecnicos

- [x] Corregir el build de produccion.
- [x] Publicar primer deploy funcional en Vercel.
- [ ] Bajar o corregir mensajes que hoy prometen stock en tiempo real si la vista no refleja todo el stock facturado.
- [x] Resolver errores de tipos y los puntos de lint mas riesgosos.

Criterio de cierre:

- `npm run build` pasa.
- `npm run lint` queda sin errores bloqueantes.

### Fase 2. Trazabilidad propia

- [x] Crear tabla de pedidos web en Supabase.
- [x] Guardar cada intento de checkout con items, total, referencia externa y estado.
- [x] Registrar datos minimos del comprador o contacto.
- [x] Preparar estados de pedido: `pendiente`, `pago_aprobado`, `pago_rechazado`, `pago_cancelado`, `error_webhook`.

Criterio de cierre:

- Cada checkout iniciado deja un registro interno consultable.
- Se puede buscar un pedido por `external_reference` o id.

### Fase 3. Mercado Pago util

- [x] Hacer que el webhook actualice el estado del pedido en Supabase.
- [x] Guardar payload resumido, id de pago y fecha de actualizacion.
- [x] Mostrar en admin un estado simple del cobro.
- [x] Validar con una notificacion real o prueba controlada el cambio de estado extremo a extremo.

Criterio de cierre:

- Un pago aprobado deja el pedido marcado como aprobado.
- Un pago rechazado o cancelado deja trazabilidad equivalente.

### Fase 4. Validaciones antes de cobrar

- [x] Revalidar precio publicado antes de crear la preferencia y priorizar precio vivo de Hermes cuando esta disponible.
- [x] Frenar checkout si el producto ya no existe o el precio cambio.
- [ ] Definir un mensaje honesto cuando la disponibilidad no pueda garantizarse al 100%.
- [ ] Endurecer stock y disponibilidad con una regla operativa explicita; hoy el precio queda revalidado pero el stock no se puede prometer al 100%.
- [ ] Definir e integrar la logica real de envio. Andreani sigue solo contemplado a nivel de schema (`shipping_amount`, `shipping_provider`, `shipping_service`, `shipping_payload`) pero no esta implementado.

Criterio de cierre:

- El backend no confia ciegamente en el carrito del frontend.
- Los errores de validacion quedan claros para el usuario.

### Fase 5. Panel realmente operativo

- [x] Crear vista de pedidos web en admin.
- [x] Permitir filtrar por estado.
- [x] Mostrar referencia de Mercado Pago y resumen de items.
- [ ] Dejar un campo de observaciones internas si hace falta manejo manual.

Criterio de cierre:

- Se puede seguir un pedido sin entrar a bases ni logs.

### Fase 6. Endurecimiento general

- [ ] Validar tipo y peso de imagenes antes de subir.
- [ ] Mejorar manejo de errores de Hermes y timeouts.
- [ ] Agregar tests minimos para checkout, webhook y auth admin.
- [ ] Revisar textos del frontend para no prometer mas de lo que hoy puede garantizar el sistema.
- [ ] Evaluar si el cambio local a `next dev --webpack` debe quedar documentado como workaround temporal o resolverse de otra forma.

Criterio de cierre:

- Los flujos criticos tienen cobertura minima y mensajes consistentes.

## No hacer todavia

- No escribir directo en tablas operativas de Hermes.
- No frenar pedidos web en Supabase por esperar escritura en Hermes: ambas capas tienen tiempos y objetivos distintos.
- No asumir que un pago aprobado equivale a stock impactado en Hermes.
- No cerrar facturacion desde la web mientras no exista acceso formal o circuito validado.

## Orden sugerido de ejecucion

1. Build y tipos.
2. Pedidos web en Supabase.
3. Webhook de Mercado Pago.
4. Revalidacion de checkout.
5. Panel de pedidos.
6. Hardening general.

## Siguiente punto al retomar

- Continuar con Fase 4, Fase 5 y Fase 6: endurecer stock/disponibilidad, terminar de pulir el panel de pedidos y agregar cobertura minima automatizada.
- Primer paso concreto: definir una regla operativa honesta para stock y disponibilidad antes de seguir ampliando el flujo comercial.
- Alcance inmediato esperado: consolidar la operacion despues de haber validado extremo a extremo el cobro y el webhook en produccion.
- Estado operativo al 2026-04-14: la app, el deploy en Vercel, la creacion de `web_orders` y la exposicion publica del webhook ya quedaron confirmados. El bloqueo actual ya no esta en la app sino en Mercado Pago Sandbox.
- Estado operativo al 2026-04-15: checkout ya captura comprador y el admin ya muestra pedidos web; el bloqueo principal para cerrar la fase sigue siendo validar un `pago_aprobado` real por webhook.
- 2026-04-17: prueba real confirmada. Un cobro real ingreso en Mercado Pago y el pedido correspondiente en `web_orders` quedo actualizado con `status = pago_aprobado`, `payment_status = approved` y `mercadopago_payment_id` persistido.
- Cierre de fase: la validacion real extremo a extremo de checkout + webhook ya no esta bloqueada.

## Pendientes post-deploy de esta etapa

- Endurecer stock/disponibilidad con una regla operativa clara.
- Dejar asentado que el repo todavia no tiene suite de tests automatizados y cubrir al menos checkout, webhook y auth admin.
- Definir si el panel de pedidos necesita observaciones internas o acciones manuales.
- Pulir UX y terminacion visual del formulario de comprador y del panel de pedidos.
- Definir e implementar envio real. Andreani sigue pendiente; hoy solo existe el espacio para esos datos en `web_orders`.
- Mantener Hermes en solo lectura hasta definir circuito oficial de escritura.

## Expectativa para la reunion con Hermes

- La web no deberia descontar stock con una escritura manual aislada.
- Lo esperable es registrar en Hermes la venta aprobada por su circuito oficial de comprobantes.
- Si Hermes descuenta stock al facturar o al emitir el comprobante correcto, esa deberia ser la integracion a implementar desde la app.
- La reunion pendiente debe confirmar si eso se resuelve con SQL de escritura, varias tablas, un stored procedure o algun mecanismo interno ya validado por Hermes.

## Procedimiento documentado para validar el webhook real de Mercado Pago

Objetivo:

- comprobar que una compra real o de prueba valida dispare una notificacion hacia la app y que el pedido interno en `web_orders` cambie de estado automaticamente sin intervencion manual.

Resultado esperado para considerar la validacion exitosa:

- el checkout crea un pedido interno con `external_reference` persistida.
- Mercado Pago envia la notificacion al endpoint publico de la app.
- el endpoint resuelve el pago real en Mercado Pago.
- el pedido se actualiza en Supabase por `external_reference`.
- quedan persistidos `status`, `payment_status`, `mercadopago_payment_id` y `raw_webhook_payload`.

Precondiciones obligatorias:

- `NEXT_PUBLIC_APP_URL` debe apuntar a una URL publica, estable y accesible desde Internet.
- esa URL debe exponer correctamente `POST /api/mercadopago/webhook`.
- no mezclar vendedor real con comprador de prueba ni vendedor de prueba con comprador real.
- si la prueba se hace en sandbox, todo el circuito debe ser consistente con ese modo.
- si la prueba se hace en real, usar una compra controlada y de bajo riesgo.
- la cuenta y las credenciales activas deben ser las mismas que generan la preferencia de checkout.

Checklist operativo:

1. Confirmar la URL publica activa cargada en `NEXT_PUBLIC_APP_URL`.
2. Verificar que `GET /api/mercadopago/webhook` responda desde esa URL publica.
3. Confirmar que las credenciales activas de Mercado Pago correspondan al mismo entorno que se va a probar.
4. Generar un checkout nuevo desde la app para crear un pedido fresco en `web_orders`.
5. Guardar la `external_reference` y el `mercadopago_preference_id` de ese intento.
6. Ejecutar el pago con un comprador compatible con el entorno elegido.
7. Verificar si Mercado Pago invoca el webhook publico.
8. Confirmar en Supabase que el pedido buscado por `external_reference` cambio de estado automaticamente.
9. Revisar que tambien se haya persistido `mercadopago_payment_id` y el payload recibido.

Orden recomendado de verificacion:

1. Primero comprobar accesibilidad publica del webhook.
2. Despues crear el pedido interno.
3. Recien entonces ejecutar el pago.
4. Por ultimo validar el cambio de estado en base y logs.

Campos minimos a revisar en `web_orders` durante la prueba:

- `external_reference`
- `status`
- `payment_status`
- `mercadopago_preference_id`
- `mercadopago_payment_id`
- `raw_webhook_payload`

Mapeo esperado de estados:

- `approved` -> `pago_aprobado`
- `rejected` -> `pago_rechazado`
- `cancelled`, `refunded`, `charged_back` -> `pago_cancelado`
- `pending`, `in_process` -> mantener `checkout_generado` hasta nueva definicion operativa

Fallas mas probables si la prueba no cierra:

- la URL publica no era accesible desde Mercado Pago.
- la `notification_url` apuntaba a una URL vieja o distinta.
- se mezclaron cuentas o modos incompatibles.
- el pago se creo pero no quedo aprobado.
- el pago llego sin `external_reference` usable.
- el pedido interno no existia con esa referencia.

Criterio de cierre profesional de esta validacion:

- no alcanza con que el checkout abra.
- no alcanza con que se cree `web_orders` antes del pago.
- la validacion se considera cerrada solo cuando un pedido real de prueba pasa automaticamente de `checkout_generado` a su estado final correspondiente por efecto del webhook.

Precauciones:

- no tocar manualmente `status` en Supabase para simular exito.
- no considerar valida una prueba si solo hubo redireccion del navegador sin notificacion procesada.
- documentar luego fecha, entorno usado, `external_reference` de prueba y resultado observado.

## Resultado documentado de la validacion real

- 2026-04-17: se realizo un cobro real exitoso.
- Mercado Pago acredito el pago en la cuenta real.
- `web_orders` reflejo el cambio a `pago_aprobado` con `payment_status = approved` y `mercadopago_payment_id` informado.
- Con esto queda validado el circuito real de checkout + webhook en produccion.

## Bitacora minima

- 2026-04-01: Se confirma que Hermes sigue en solo lectura; la prioridad pasa a trazabilidad interna y robustez de la web.
- 2026-04-01: Se confirma que el proyecto todavia no fue deployado; el foco inmediato queda en desarrollo local, build, calidad y flujos base.
- 2026-04-01: `npm run build` pasa despues de corregir tipados en Mercado Pago, banners, publicidad y clientes compartidos de Supabase.
- 2026-04-01: `npm run lint` queda sin errores; solo permanecen warnings por uso de `<img>` en componentes visuales.
- 2026-04-01: Se decide que el siguiente bloque de trabajo sera pedidos web en Supabase para dar trazabilidad propia antes de avanzar con webhook y panel de pedidos.
- 2026-04-02: Se explicita que la falta de escritura en Hermes no cambia la prioridad actual: pedidos web, estados y trazabilidad propia siguen resolviendose primero en Supabase.
- 2026-04-09: Se alinea la tabla `productos_publicados` con el esquema que espera la app y se verifica que los datos existentes estan completos para `hermes_id`, `nombre` y `precio`.
- 2026-04-09: Se crean en Supabase las tablas `web_orders` y `web_order_items` con indices, restricciones basicas y RLS bloqueada para acceso directo desde cliente.
- 2026-04-09: Se actualizan los tipos de `src/types/supabase.ts` para reflejar `web_orders` y `web_order_items`.
- 2026-04-11: Se amplian `web_orders` y sus tipos con `subtotal_amount`, `shipping_amount`, `shipping_provider`, `shipping_service` y `shipping_payload` para contemplar envio antes de integrar la logica real.
- 2026-04-11: El endpoint `src/app/api/mercadopago/checkout/route.ts` pasa a crear `web_orders` y `web_order_items` antes de solicitar la preferencia a Mercado Pago, reutilizando una `external_reference` estable y dejando el pedido en `checkout_generado` cuando la preferencia se crea bien.
- 2026-04-11: Limitacion vigente: el checkout todavia no recibe datos del comprador desde el frontend, por eso los pedidos se registran con `buyer_name = 'Cliente web'` hasta ampliar el payload.
- 2026-04-11: El endpoint `src/app/api/mercadopago/webhook/route.ts` pasa a resolver el pago por `data.id`, buscar el pedido por `external_reference` y actualizar `status`, `payment_status`, `mercadopago_payment_id` y `raw_webhook_payload` en `web_orders`.
- 2026-04-11: Se valida manualmente que el checkout ya crea registros en `web_orders` y `web_order_items`, con `external_reference` y `mercadopago_preference_id` persistidos correctamente antes del pago.
- 2026-04-11: Bloqueo actual de pruebas: al intentar pagar en Mercado Pago Sandbox aparece `Una de las partes con la que intentás hacer el pago es de prueba`. Revisar mezcla de cuenta vendedora real/test, comprador de prueba y necesidad de exponer una `notification_url` publica para verificar el webhook extremo a extremo.
- 2026-04-13: el proyecto queda efectivamente deployado en Vercel y funcionando despues de cargar variables de entorno a nivel de proyecto.
- 2026-04-13: se detecta inestabilidad severa de Turbopack en Windows local por multiplicacion de procesos `.next/dev/build/postcss.js`; el script `dev` queda temporalmente con `next dev --webpack` para desarrollo estable.
- 2026-04-14: se verifica en local que `GET /api/mercadopago/webhook` responde `200` con `{ "received": true }`, por lo que la ruta esta sana en desarrollo.
- 2026-04-14: se confirma que `MERCADOPAGO_ACCESS_TOKEN` activo resuelve una cuenta `TESTUSER`, por lo que la siguiente validacion debe mantener consistencia total en modo prueba.
- 2026-04-14: la exposicion publica via `NEXT_PUBLIC_APP_URL = https://17mv9p4t-3000.brs.devtunnels.ms` queda sin confirmacion operativa desde esta sesion; antes de cobrar hay que verificar si ese endpoint publico realmente responde desde Internet o reemplazarlo por la URL estable del deploy en Vercel.
- 2026-04-14: se valida que `https://laperlavinos.vercel.app/api/mercadopago/webhook` responde `200`, por lo que la URL publica estable para pruebas queda alineada con Vercel.
- 2026-04-14: un checkout manual de prueba crea correctamente `web_orders` en estado `checkout_generado` con `external_reference = pedido-web-1776180063322-3b0892f0` y `mercadopago_preference_id = 3303592644-5073c024-b857-4bab-88bc-050e0ae684bb`.
- 2026-04-14: el intento de pago en sandbox no logra completar la autenticacion ni el cobro. El login con cuenta test entra en `ERR_TOO_MANY_REDIRECTS` incluso en navegador distinto, y el intento como invitado con tarjeta de prueba termina en error de procesamiento sin crear pago ni disparar webhook.
- 2026-04-14: despues de esos intentos fallidos, el pedido permanece en `checkout_generado` con `payment_status = null`, `mercadopago_payment_id = null` y `raw_webhook_payload = null`; el bloqueo actual queda identificado del lado de Mercado Pago sandbox y no de la app.
- 2026-04-14: decision operativa tomada: no seguir iterando sobre Sandbox. El siguiente intento serio se hara con credenciales reales cargadas manualmente desde `admin/mercadopago`, usando un link manual de monto minimo y verificando luego la actualizacion del pedido por webhook.