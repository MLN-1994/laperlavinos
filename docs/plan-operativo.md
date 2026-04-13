# Plan operativo austero

Fecha base: 2026-04-01

## Restriccion confirmada

- El proyecto sigue solo en desarrollo local; todavia no fue desplegado en Vercel.
- 2026-04-13: primer intento de deploy en Vercel detecto un error de build de TypeScript en `src/app/api/mercadopago/checkout/route.ts` por incompatibilidad entre `CheckoutRequestBody` y el tipo `Json` de Supabase al guardar `raw_checkout_payload`.
- 2026-04-13: el bloqueo de deploy se corrigio serializando el payload del checkout a `Json` antes del insert y fijando `turbopack.root = __dirname` en `next.config.ts` para evitar ambiguedad por multiples lockfiles.
- Hermes hoy se usa en solo lectura.
- No hay escritura sobre facturacion, stock ni comprobantes desde esta app.
- Hasta que Hermes habilite escritura o un procedimiento oficial, la web no reemplaza el circuito operativo de Hermes.

## Objetivo mientras Hermes siga read-only

Mantener la web util, administrable y trazable sin depender de escritura en Hermes.

Mientras siga sin deploy, priorizar base tecnica, trazabilidad y consistencia funcional antes que optimizaciones de operacion productiva.

- La falta de escritura en Hermes no bloquea la Fase 2 ni la trazabilidad propia: los pedidos web, sus estados y la relacion con Mercado Pago se resuelven primero en Supabase.

## Prioridades

### Fase 1. Bloqueos tecnicos

- [x] Corregir el build de produccion.
- [ ] Bajar o corregir mensajes que hoy prometen stock en tiempo real si la vista no refleja todo el stock facturado.
- [x] Resolver errores de tipos y los puntos de lint mas riesgosos.

Criterio de cierre:

- `npm run build` pasa.
- `npm run lint` queda sin errores bloqueantes.

### Fase 2. Trazabilidad propia

- [x] Crear tabla de pedidos web en Supabase.
- [x] Guardar cada intento de checkout con items, total, referencia externa y estado.
- [ ] Registrar datos minimos del comprador o contacto.
- [ ] Preparar estados de pedido: `pendiente`, `pago_aprobado`, `pago_rechazado`, `pago_cancelado`, `error_webhook`.

Criterio de cierre:

- Cada checkout iniciado deja un registro interno consultable.
- Se puede buscar un pedido por `external_reference` o id.

### Fase 3. Mercado Pago util

- [x] Hacer que el webhook actualice el estado del pedido en Supabase.
- [x] Guardar payload resumido, id de pago y fecha de actualizacion.
- [ ] Mostrar en admin un estado simple del cobro.

Criterio de cierre:

- Un pago aprobado deja el pedido marcado como aprobado.
- Un pago rechazado o cancelado deja trazabilidad equivalente.

### Fase 4. Validaciones antes de cobrar

- [ ] Revalidar precio y disponibilidad contra la lectura disponible antes de crear la preferencia.
- [ ] Frenar checkout si el producto ya no existe o el precio cambio.
- [ ] Definir un mensaje honesto cuando la disponibilidad no pueda garantizarse al 100%.

Criterio de cierre:

- El backend no confia ciegamente en el carrito del frontend.
- Los errores de validacion quedan claros para el usuario.

### Fase 5. Panel realmente operativo

- [ ] Crear vista de pedidos web en admin.
- [ ] Permitir filtrar por estado y fecha.
- [ ] Mostrar referencia de Mercado Pago y resumen de items.
- [ ] Dejar un campo de observaciones internas si hace falta manejo manual.

Criterio de cierre:

- Se puede seguir un pedido sin entrar a bases ni logs.

### Fase 6. Endurecimiento general

- [ ] Validar tipo y peso de imagenes antes de subir.
- [ ] Mejorar manejo de errores de Hermes y timeouts.
- [ ] Agregar tests minimos para checkout, webhook y auth admin.
- [ ] Revisar textos del frontend para no prometer mas de lo que hoy puede garantizar el sistema.

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

- Continuar con Fase 2 y Fase 3: probar webhook con notificacion real y completar datos del comprador/envio desde frontend.
- Primer paso concreto: disparar una notificacion real o simulada de Mercado Pago y verificar que `web_orders` cambie por `external_reference` a `pago_aprobado`, `pago_rechazado` o `pago_cancelado` segun corresponda.
- Alcance inmediato esperado: validar extremo a extremo el cambio de estado y luego ampliar el payload del checkout para dejar de usar `buyer_name` generico.

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