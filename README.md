## Desarrollo

Instalación y arranque:

```bash
npm install
npm run dev
```

La app corre por defecto en http://localhost:3000.

Nota local 2026-04-13:

- El script `npm run dev` hoy usa Webpack para evitar inestabilidad de memoria con Turbopack en este entorno Windows.
- Si en el futuro se quiere volver a Turbopack, primero hay que validar que no reaparezca la explosion de procesos `.next/dev/build/postcss.js`.

## Estado actual

- La tienda ya tiene un primer deploy funcional en Vercel.
- La home publica banners, publicidad y productos publicados mezclados con datos vivos de Hermes.
- El panel admin ya permite gestionar productos publicados, banners, publicidad y configuracion de Mercado Pago.
- El checkout ya crea pedidos internos en Supabase antes de generar la preferencia de Mercado Pago.
- El webhook ya actualiza pedidos en `web_orders` y la validacion real de punta a punta con un pago aprobado ya fue confirmada.

Pendientes operativos mas importantes:

1. Endurecer la politica real de stock y disponibilidad antes de cobrar.
2. Agregar una base minima de tests automatizados para checkout, webhook y auth admin.
3. Definir con Hermes el circuito oficial de escritura despues de pago aprobado.

## Calidad y tests

Estado actual:

- No hay una suite de tests automatizados implementada en el repo.
- La validacion actual del proyecto sigue dependiendo principalmente de pruebas manuales y de `npm run build` / `npm run lint`.

Cobertura minima recomendada para la siguiente etapa:

1. Checkout de Mercado Pago.
2. Webhook de Mercado Pago.
3. Auth admin y proteccion de rutas.

## Admin y Supabase Auth

El panel de admin usa Supabase Auth con verificacion server-side del flag `is_admin` en la tabla `profiles`.

Configuracion requerida:

1. Definir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno.
2. Ejecutar [docs/supabase-admin-auth.sql](docs/supabase-admin-auth.sql) en Supabase.
3. Crear el usuario administrador en Supabase Auth.
4. Confirmar en `public.profiles` que el usuario exista. Si el usuario fue creado antes del trigger, el script ya hace backfill de `auth.users` a `profiles`.
5. Marcar el perfil del usuario con `is_admin = true` en la tabla `profiles` o reemplazar el email de ejemplo dentro del script antes de ejecutarlo.
6. Ingresar por `/admin-login` y luego abrir `/admin`.

Acceso actual:

- El panel solo permite entrar a usuarios que existan en Supabase Auth y tengan `is_admin = true` en `public.profiles`.
- Si hoy solo tu email tiene `is_admin = true`, entonces solo ese email puede entrar al panel.
- Para habilitar otro administrador, primero crea el usuario en Supabase Auth y despues ejecuta un `update` sobre `public.profiles` para marcar `is_admin = true` en ese email.

Notas tecnicas:

- El middleware solo exige sesion para entrar a `/admin`; el permiso real de administrador se valida del lado servidor.
- El panel de banners y productos publicados escribe directo en Supabase desde el frontend admin, por lo que las policies y RLS del script son obligatorias.
- Si falta `SUPABASE_SERVICE_ROLE_KEY`, el login puede autenticar al usuario pero el panel no podra validar permisos de administrador.

## Mercado Pago

La integración implementa configuración manual de cuenta en /admin/mercadopago y generación de checkout link al finalizar el pedido o desde el generador manual del panel.

Configuración requerida:

1. Para usar una sola cuenta ya mismo, cargar MERCADOPAGO_ACCESS_TOKEN y NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en el entorno.
2. Para permitir configuración manual persistida desde el panel, ejecutar el script [docs/mercadopago-supabase.sql](docs/mercadopago-supabase.sql) en Supabase.
3. Definir NEXT_PUBLIC_APP_URL con la URL pública real de la tienda.

Notas técnicas:

- El access token del vendedor se guarda únicamente del lado servidor usando SUPABASE_SERVICE_ROLE_KEY.
- El frontend nunca accede directo a la tabla de credenciales de Mercado Pago.
- El panel permite pegar manualmente public key y access token del cliente, sin flujo OAuth.
- Para produccion real, configurar `MERCADOPAGO_WEBHOOK_SECRET` con la clave secreta de Webhooks generada en Tus integraciones.
- El webhook ahora rechaza notificaciones sin firma valida y el checkout revalida server-side los productos publicados y sus precios antes de crear la preferencia.

## Pendiente con Hermes

Estado actual:

- Hermes sigue siendo la fuente operativa de productos y stock.
- La web publica solo productos elegidos desde el panel admin.
- Supabase hoy resuelve auth admin, productos publicados, banners y configuracion de Mercado Pago.
- La tienda ya puede leer productos publicados mezclando publicacion en Supabase con datos vivos de Hermes en lectura.
- La tienda todavia no registra la venta aprobada dentro de Hermes ni descuenta stock desde la web.

Objetivo funcional:

- Mostrar en la web solo productos publicados.
- Mantener a Hermes como maestro de stock, precios y facturacion.
- Reflejar en la web los cambios de producto hechos en Hermes.
- Cuando Mercado Pago apruebe un pago, registrar la operacion en Hermes para impactar stock y comprobantes.

Expectativa tecnica hoy corroborada con las notas del proyecto:

- No se espera descontar stock con un `update` manual aislado desde la web.
- Lo esperable es registrar en Hermes el comprobante oficial de la venta web una vez aprobado el pago.
- Si Hermes maneja stock correctamente, el descuento deberia ser consecuencia de ese comprobante o del circuito oficial que ellos indiquen.
- Para eso hace falta que Hermes habilite algo mas que lectura: acceso de escritura controlado, procedimiento almacenado, API o el mecanismo oficial que usen internamente.

Informacion pendiente de Hermes:

1. Tabla cabecera del comprobante de venta.
2. Tabla detalle o items del comprobante.
3. Campos obligatorios para insercion en ambas tablas.
4. Si corresponde generar pedido, remito, factura u otro tipo de comprobante intermedio.
5. Como se genera la numeracion del comprobante.
6. Como identificar al cliente existente o usar cliente `0` si no existe.
7. Si el stock se descuenta al facturar o en otro paso del circuito.
8. Si existe un stored procedure, endpoint o rutina recomendada en lugar de insertar directo.
9. Como registrar pagos aprobados, cancelaciones y posibles devoluciones.

Recomendacion tecnica:

- No insertar directo en tablas de comprobantes hasta tener confirmado el circuito exacto de Hermes.
- Si Hermes ofrece procedimiento o API oficial, usar eso antes que inserts manuales.
- Si el descuento de stock depende de facturar, la integracion web debe disparar ese circuito oficial despues de `pago_aprobado`, no escribir stock por separado.
- Mientras no exista integracion de escritura con Hermes, la web puede cobrar y publicar productos, pero no cerrar el circuito completo de stock/facturacion.

## Proximos pasos sugeridos

Prioridad operativa para retomar mas adelante:

1. Validar un pago aprobado real y confirmar actualizacion automatica por webhook.
2. Definir una regla operativa honesta para stock y disponibilidad.
3. Agregar tests minimos para checkout, webhook y auth admin.
4. Cuando Hermes habilite escritura, registrar la venta aprobada en Hermes para impactar stock y comprobantes.

Objetivo de esa etapa:

- Evitar vender productos sin stock disponible.
- Tener trazabilidad interna de cada pedido web aunque Hermes siga en solo lectura.
- Dejar preparado el circuito para completar la integracion cuando Hermes habilite permisos de escritura.
