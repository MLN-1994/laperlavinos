# Integracion Hermes: estado y notas practicas

Actualizado: 2026-04-17

## Nota 2026-04-17

- La expectativa actual para la siguiente reunion con Hermes es revisar el SQL o mecanismo real de escritura.
- No se espera descontar stock con una actualizacion manual aislada desde la web.
- Lo razonable es registrar la venta aprobada en Hermes por su circuito oficial de comprobantes para que el stock y la facturacion queden alineados.
- Si Hermes confirma que el stock se descuenta al facturar, entonces la app necesitara acceso de escritura controlado o una rutina oficial para ejecutar ese paso.

## Estado actual

La integracion de Hermes en lectura ya esta implementada y funcionando.

- `mysql2` ya esta instalado.
- Existen las variables `HERMES_HOST`, `HERMES_USER`, `HERMES_PASSWORD`, `HERMES_DATABASE` y `HERMES_PORT`.
- Existe `src/lib/hermesClient.ts` con pool de conexiones.
- La fuente actual de productos es `vista_articulos`.
- La tienda publica solo productos seleccionados desde Supabase y mezcla esos registros con datos vivos de Hermes.
- La app ya esta deployada en Vercel y Hermes se consume tambien en produccion via variables del proyecto.

## Flujo actual resuelto

1. Se leen productos desde Hermes usando `vista_articulos`.
2. En Supabase se guardan los productos que se quieren publicar en la web.
3. El admin publica o despublica productos desde el panel.
4. La tienda pide los productos publicados y los enriquece con precio, stock y otros datos vivos de Hermes.

## Restricciones vigentes

- Hermes sigue en solo lectura.
- No se escribe stock, ventas ni comprobantes desde esta app.
- La web no reemplaza el circuito operativo de Hermes mientras no exista escritura validada.

## Buenas practicas que siguen vigentes

- Nunca exponer credenciales ni logica MySQL en el frontend.
- Usar Hermes solo desde backend.
- Manejar errores sin devolver detalles sensibles al frontend.
- Mantener pool de conexiones.
- Configurar variables seguras tambien en hosting o deploy.

## Lo que ya no es pendiente

- Crear el cliente MySQL.
- Crear la API route base para productos Hermes.
- Crear la tabla de productos publicados en Supabase.
- Tener panel admin para publicar productos.

## Pendiente real en la parte Hermes

- Confirmar si `vista_articulos.Precio` es el precio definitivo para ecommerce.
- Confirmar si `vista_articulos.Stock` es stock vendible real o solo orientativo.
- Definir como buscar cliente existente en `contactos`.
- Confirmar uso de cliente `0` para comprador que no exista en Hermes.
- Confirmar comprobante correcto a generar despues de pago aprobado.
- Confirmar mecanismo oficial de escritura: inserts directos, varias tablas, procedimiento almacenado u otro circuito.
- Confirmar si el descuento de stock ocurre al facturar o en otra parte del circuito.
- Confirmar que acceso SQL real se habilitara para la integracion web.

## Decision practica hoy

No avanzar con escritura en Hermes hasta cerrar antes estas capas propias:

- validacion real del webhook de Mercado Pago
- regla operativa de stock y disponibilidad
- cobertura minima de tests automatizados
- confirmacion del circuito oficial de escritura con Hermes

## Mejoras pendientes del panel admin

- Agregar paginacion o mejor navegacion si el listado crece.
- Mostrar loaders y errores mas claros en operaciones largas.
- Agregar confirmaciones para acciones destructivas.
- Endurecer validaciones de publicacion.
- Seguir ordenando componentes y hooks si el panel crece.