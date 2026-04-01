# Plan operativo austero

Fecha base: 2026-04-01

## Restriccion confirmada

- El proyecto sigue solo en desarrollo local; todavia no fue desplegado en Vercel.
- Hermes hoy se usa en solo lectura.
- No hay escritura sobre facturacion, stock ni comprobantes desde esta app.
- Hasta que Hermes habilite escritura o un procedimiento oficial, la web no reemplaza el circuito operativo de Hermes.

## Objetivo mientras Hermes siga read-only

Mantener la web util, administrable y trazable sin depender de escritura en Hermes.

Mientras siga sin deploy, priorizar base tecnica, trazabilidad y consistencia funcional antes que optimizaciones de operacion productiva.

## Prioridades

### Fase 1. Bloqueos tecnicos

- [x] Corregir el build de produccion.
- [ ] Bajar o corregir mensajes que hoy prometen stock en tiempo real si la vista no refleja todo el stock facturado.
- [x] Resolver errores de tipos y los puntos de lint mas riesgosos.

Criterio de cierre:

- `npm run build` pasa.
- `npm run lint` queda sin errores bloqueantes.

### Fase 2. Trazabilidad propia

- [ ] Crear tabla de pedidos web en Supabase.
- [ ] Guardar cada intento de checkout con items, total, referencia externa y estado.
- [ ] Registrar datos minimos del comprador o contacto.
- [ ] Preparar estados de pedido: `pendiente`, `pago_aprobado`, `pago_rechazado`, `pago_cancelado`, `error_webhook`.

Criterio de cierre:

- Cada checkout iniciado deja un registro interno consultable.
- Se puede buscar un pedido por `external_reference` o id.

### Fase 3. Mercado Pago util

- [ ] Hacer que el webhook actualice el estado del pedido en Supabase.
- [ ] Guardar payload resumido, id de pago y fecha de actualizacion.
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
- No asumir que un pago aprobado equivale a stock impactado en Hermes.
- No cerrar facturacion desde la web mientras no exista acceso formal o circuito validado.

## Orden sugerido de ejecucion

1. Build y tipos.
2. Pedidos web en Supabase.
3. Webhook de Mercado Pago.
4. Revalidacion de checkout.
5. Panel de pedidos.
6. Hardening general.

## Bitacora minima

- 2026-04-01: Se confirma que Hermes sigue en solo lectura; la prioridad pasa a trazabilidad interna y robustez de la web.
- 2026-04-01: Se confirma que el proyecto todavia no fue deployado; el foco inmediato queda en desarrollo local, build, calidad y flujos base.
- 2026-04-01: `npm run build` pasa despues de corregir tipados en Mercado Pago, banners, publicidad y clientes compartidos de Supabase.
- 2026-04-01: `npm run lint` queda sin errores; solo permanecen warnings por uso de `<img>` en componentes visuales.