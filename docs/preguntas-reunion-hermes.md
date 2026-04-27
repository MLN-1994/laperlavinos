# Preguntas para la reunion con Hermes

Fecha: 2026-04-17

Objetivo de esta reunion:

- entender como se registra una venta web aprobada dentro de Hermes
- confirmar como impacta stock y facturacion
- identificar que acceso o mecanismo nos tienen que dar para integrarlo desde la web

Importante:

- No hace falta hablar en lenguaje tecnico complicado.
- Si muestran SQL, pedir que expliquen cada parte en lenguaje simple.
- Si usan palabras como tabla, procedimiento, trigger o stored procedure, pedir siempre un ejemplo concreto.

## Contexto corto para explicarles

Hoy la web ya hace esto:

- muestra productos publicados
- cobra con Mercado Pago
- guarda pedidos web en Supabase
- guarda datos del comprador
- espera confirmacion del pago aprobado

Lo que falta es esto:

- registrar la venta aprobada dentro de Hermes
- impactar stock correctamente
- dejar alineada la facturacion con el sistema real del negocio

## Pregunta principal

"Cuando una compra web sale aprobada, cual es el proceso correcto dentro de Hermes para registrar esa venta?"

Si la respuesta es tecnica, repreguntar:

- "Eso significa que hay que facturar?"
- "Eso significa que hay que crear un pedido?"
- "Eso significa que hay que tocar varias tablas?"
- "Eso significa que el stock se descuenta automaticamente o hay que hacer otro paso?"

## Preguntas clave, en lenguaje simple

### 1. Sobre el proceso correcto

- Que se hace hoy en Hermes cuando se vende algo y ya esta pago.
- Cual es el primer paso real del proceso.
- Cual es el resultado final esperado dentro del sistema.
- Si para una venta web el circuito es el mismo que usan en mostrador o si cambia algo.

Lo que tenes que anotar:

- nombre del comprobante o proceso
- pasos en orden
- en que paso impacta stock
- en que paso queda facturada la venta

### 2. Sobre stock

- El stock se descuenta al facturar, al remitir o en otro momento.
- Si el stock de `vista_articulos` es stock real vendible o solo orientativo.
- Si una venta web aprobada tiene que impactar stock de inmediato o puede quedar pendiente.
- Si existe algun caso donde una venta aprobada no deba descontar stock todavia.

Lo que tenes que anotar:

- evento exacto que descuenta stock
- si el descuento es automatico o manual
- si el stock de la vista sirve para ecommerce

### 3. Sobre facturacion y comprobantes

- Que comprobante hay que generar para una venta web aprobada.
- Si el comprobante correcto es factura, remito, pedido o algun otro.
- Si el pago aprobado ya deja la venta cerrada o si falta otro paso.
- Si el mismo comprobante ya registra el pago o si el pago va por otro lado.

Lo que tenes que anotar:

- nombre exacto del comprobante
- si hace cabecera y detalle
- si registra pago tambien
- si genera numeracion automatica

### 4. Sobre cliente

- Como buscan hoy a un cliente existente dentro de Hermes.
- Si para ecommerce conviene buscar por DNI, CUIT, numero de cliente o combinacion.
- Si sigue siendo valido usar cliente `0` cuando el comprador no existe.
- Donde se guardan nombre, documento, telefono, email y direccion cuando el cliente no existe en Hermes.

Lo que tenes que anotar:

- criterio correcto de busqueda
- cuando usar cliente `0`
- donde guardar datos del comprador

### 5. Sobre el acceso tecnico que nos van a dar

- Nos van a dar solo lectura o tambien escritura.
- Si la escritura sera directa sobre tablas o por un procedimiento ya armado.
- Si hay una forma recomendada por ellos para integrar sin romper nada.
- Si existe algun ejemplo de SQL que ya use Hermes para registrar una venta.

Lo que tenes que anotar:

- si el acceso es lectura y escritura
- nombre de tablas involucradas
- nombre de procedimiento si existe
- usuario, permisos o restricciones

### 6. Sobre el SQL que te muestren

Si te muestran SQL, no hace falta entenderlo entero. Pregunta esto:

- "Que hace este bloque, explicado simple?"
- "Cual de estas partes crea la cabecera de la venta?"
- "Cual crea el detalle de items?"
- "Cual registra el pago?"
- "Cual descuenta stock?"
- "Cual genera el numero de comprobante?"
- "Esto se ejecuta todo junto o en pasos separados?"

Lo que tenes que anotar:

- que parte hace cada cosa
- si hay que ejecutar una sola rutina o varias
- que datos obligatorios necesita

## Preguntas muy concretas para no perderte

Podes leer estas textual si queres:

1. "Si una compra web sale aprobada, que tengo que ejecutar en Hermes para dejarla bien registrada?"
2. "Ese proceso descuenta stock automaticamente o hay que hacer algo mas?"
3. "Lo correcto es facturar, generar pedido, remito o otra cosa?"
4. "Si el cliente no existe, puedo usar cliente 0?"
5. "Donde guardo los datos del comprador si uso cliente 0?"
6. "Me conviene escribir directo en tablas o ustedes ya tienen una rutina/procedimiento para esto?"
7. "Que datos son obligatorios para registrar una venta desde afuera del sistema?"
8. "El precio y stock de vista_articulos sirven como verdad para ecommerce?"
9. "Me van a dar acceso SQL de escritura o algun mecanismo mas seguro?"
10. "Tienen un ejemplo real de una venta ya registrada para que yo vea que tablas toca?"

## Cosas que conviene pedirles que te muestren

- un ejemplo real de una venta completa ya cargada en Hermes
- que tablas participan
- que campo relaciona cabecera con detalle
- donde se ve el cliente
- donde se ve el pago
- donde se ve el descuento de stock
- si hay algun procedimiento almacenado o rutina que haga todo eso

## Frases utiles si te hablan muy tecnico

- "Explicamelo como si yo no supiera SQL."
- "Mostrame cual es la parte importante para integrar la web."
- "Que necesita la app y que hace Hermes internamente?"
- "Si yo no quiero romper nada, cual es la forma correcta de hacerlo?"
- "Que me recomendarias usar vos para integrarlo bien?"

## Lo ideal con lo que deberias salir de la reunion

Minimo deberias salir sabiendo esto:

1. que proceso oficial usa Hermes para registrar una venta web aprobada
2. si el stock se descuenta al facturar o en otro paso
3. que comprobante corresponde generar
4. si se puede usar cliente `0`
5. donde guardar los datos del comprador
6. si el precio y stock de `vista_articulos` sirven para ecommerce
7. que acceso tecnico te van a dar para integrarlo

## Si podes, pediles estos materiales

- una guia corta o documento funcional/tecnico del circuito de venta dentro de Hermes
- nombre de tablas involucradas
- captura o ejemplo de una venta real
- ejemplo de SQL o procedimiento recomendado
- lista de campos obligatorios
- criterio para cliente existente vs cliente `0`

## Pedido sugerido de documentacion

Podes pedirlo asi:

"Necesito una guia corta, funcional y tecnica, para entender como se registra correctamente una venta dentro de Hermes. La idea es integrar la web respetando el circuito real del sistema y no tocar nada a prueba y error. Si tienen un documento o explicacion que muestre el flujo desde una venta aprobada hasta comprobantes, pagos y stock, me serviria mucho. Si ademas tienen un ejemplo real o un circuito modelo, mejor."

## Conclusión simple

La pregunta de fondo no es "como descuento stock".

La pregunta correcta es:

"Como se registra correctamente en Hermes una venta web ya aprobada para que stock, comprobante y pago queden bien alineados?"