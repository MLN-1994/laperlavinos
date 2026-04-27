# Notas de reunion e integracion con Hermes

Fecha: 2026-04-09

Estado de vigencia: sigue vigente. Esta nota todavia describe bien la parte Hermes y no entra en conflicto con el estado actual del deploy.

## Estado actual confirmado

- La web ya consume productos desde Hermes por MySQL en modo solo lectura.
- La fuente actual de catalogo es la vista `vista_articulos`.
- En MySQL Workbench se observa que la vista expone al menos estos campos:
  - `Codigo`
  - `Descripcion`
  - `Precio`
  - `Stock`
  - `Grupo`
  - `Marca`
- Hoy no se escribe en Hermes desde la web.
- La trazabilidad propia de pedidos web sigue pensada en Supabase para checkout, estados y relacion con Mercado Pago.
- La tienda ya esta deployada y hoy usa Hermes en lectura tanto local como en produccion a traves de variables de entorno cargadas en Vercel.

## Objetivo de la nueva etapa

Definir la forma correcta de registrar ventas desde la web en Hermes sin romper la logica de comprobantes, clientes, stock ni numeracion.

Contexto inmediato de la reunion siguiente:

- La web ya crea pedidos internos en Supabase, captura comprador y puede cobrar con Mercado Pago.
- Lo que falta confirmar con Hermes no es la lectura, sino el circuito oficial de escritura para cerrar la venta aprobada.
- Si el descuento de stock depende de facturacion, entonces la integracion web debera facturar o emitir el comprobante correcto en Hermes; no conviene hacer un descuento de stock aislado por fuera de ese circuito.

## Definiciones funcionales ya confirmadas con Hermes

### Clientes

- El login no necesariamente sera obligatorio para comprar.
- Si el cliente ya existe en Hermes, se lo buscara en la tabla `contactos`.
- Hermes identifica clientes existentes con:
  - numero de cliente interno
  - CUIT si es responsable inscripto
  - DNI si es consumidor final
- Si el cliente no existe en Hermes, la venta se puede registrar igual con numero de cliente `0`.
- En ese caso, los datos del comprador no generan un alta de cliente en Hermes: quedan asociados solamente al comprobante.

### Tipo de venta web

- La primera etapa del ecommerce se orienta a venta al contado.
- El cliente pagara en el momento usando pasarelas como Mercado Pago u Openpay.
- La forma correcta, segun lo conversado, es registrar la venta una vez que el pago quede aprobado.
- No se planea manejar cuenta corriente en esta primera etapa.

## Respuestas y criterios obtenidos en la conversacion

### Sobre login

- No hace falta exigir login para comprar en la primera etapa.
- Lo importante es poder identificar al comprador cuando ya exista en Hermes para vincular la venta a su cuenta.

### Sobre clientes ya existentes o nuevos

- La web deberia poder vender a cualquiera, no solo a clientes ya cargados.
- Si el comprador ya existe en Hermes, conviene vincular la venta a ese cliente.
- Si no existe, se registra el comprobante con cliente `0`.

### Sobre registro de venta y pago

- La venta web contado deberia registrarse recien cuando el pago este aprobado.
- Antes de eso, el pedido puede mantenerse como trazabilidad propia del ecommerce.
- La expectativa mas razonable hoy es que el impacto de stock ocurra como consecuencia del comprobante correcto en Hermes, no por una actualizacion manual desde la web.

## Implicancias tecnicas para la integracion

- La primera version no necesita alta automatica de clientes en Hermes.
- La integracion debe resolver una busqueda confiable del cliente en `contactos` cuando aplique.
- Si no hay match, la venta puede seguir adelante igual con cliente `0`.
- Los datos del comprador deberan quedar guardados en los campos del comprobante definidos por Hermes.
- La escritura sobre Hermes deberia ocurrir despues de la aprobacion del pago, no antes.
- Si Hermes requiere facturar para descontar stock, entonces la app necesitara algo mas que acceso de lectura: SQL de escritura controlado o el mecanismo oficial que Hermes ya use.

## Dudas abiertas que faltan cerrar con Hermes

### Busqueda de clientes

- Con que campo conviene buscar en `contactos` para evitar duplicados o asociaciones incorrectas:
  - numero de cliente
  - CUIT
  - DNI
  - combinacion de datos
- Que criterio aplicar si aparece mas de un resultado posible.

### Comprobante a generar

- Que tipo de comprobante conviene generar desde la web una vez aprobado el pago:
  - remito
  - factura
  - otro comprobante intermedio
- Si ese comprobante impacta stock automaticamente o requiere logica adicional.
- Si el comprobante correcto tambien registra el pago o si ese paso va por separado.

### Lista de precios

- Confirmar si la web trabajara con una sola lista de precios.
- Confirmar si la lista depende del cliente o perfil comercial.
- Confirmar si el `Precio` de `vista_articulos` es el precio definitivo para ecommerce.

### Datos del comprador cuando cliente = 0

- En que campos del comprobante viajan los datos cargados en la web:
  - nombre
  - apellido o razon social
  - DNI o CUIT
  - telefono
  - email
  - direccion
  - observaciones

### Circuito de escritura

- Falta confirmar cual es el mecanismo oficial para grabar ventas en Hermes:
  - insercion directa en tablas
  - varias tablas relacionadas
  - procedimiento almacenado
  - otro circuito oficial
- Falta confirmar que nivel de acceso SQL se habilitara para la integracion web.
- Falta confirmar si conviene escribir contra tablas o delegar todo en una rutina ya validada por Hermes.

## Pista nueva a validar

- 2026-04-20: segun el programador de Hermes, para entender la integracion conviene pararse primero en `comprob_ventas`.
- Interpretacion practica: `comprob_ventas` probablemente sea la tabla que mejor representa la venta ya registrada desde la logica de Hermes.
- Esto no invalida el resto de tablas: `items_comprobantes`, `pagos`, `pagos_detalle` y `movimientos_stk` siguen siendo parte del circuito, pero `comprob_ventas` puede ser el mejor punto de entrada para entender cliente, tipo de comprobante, numeracion y clave de relacion.
- Siguiente verificacion recomendada: partir de una fila real de `comprob_ventas` y seguir sus relaciones hacia `comprobantes`, `items_comprobantes`, `pagos` y `movimientos_stk`.

## Machete de preguntas pendientes para Hermes

1. Para buscar al cliente en `contactos`, cual es el identificador mas confiable para una compra web.
2. Si el cliente no existe y se graba con cliente `0`, en que campos del comprobante quedan sus datos.
3. Que comprobante conviene generar desde la web una vez aprobado el pago.
4. Si la web va a trabajar con una sola lista de precios o con listas segun cliente.
5. Si el precio que hoy sale en `vista_articulos` es el precio correcto para cobrar online.
6. Si el stock que hoy sale en `vista_articulos` es stock vendible real o solo orientativo.
7. Como impacta stock el comprobante generado desde la web.
8. Si para descontar stock la web debe facturar, remitir o ejecutar otro proceso oficial.
9. Que acceso SQL o rutina concreta nos van a habilitar para hacerlo.

## Resumen ejecutivo

- Lectura de productos desde Hermes: resuelta.
- Fuente actual: `vista_articulos`.
- Venta web inicial: al contado, con pago online inmediato.
- Registro en Hermes: deberia hacerse despues de pago aprobado.
- Cliente existente: buscar en `contactos`.
- Cliente inexistente: registrar comprobante con cliente `0`.
- Pendientes criticos: criterio de busqueda del cliente, tipo de comprobante, lista de precios y circuito exacto que impacta stock.

## Decision practica hoy

- No tocar escritura en Hermes hasta cerrar antes estas capas propias:
  - validacion real de webhook
  - regla operativa de stock
  - cobertura minima de tests
  - confirmacion del circuito oficial de escritura con Hermes
