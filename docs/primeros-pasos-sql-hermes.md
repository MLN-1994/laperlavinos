# Primeros pasos con SQL de Hermes

Fecha: 2026-04-20

Objetivo de esta guia:

- ayudarte a entrar al SQL de Hermes sin conocimientos previos de base de datos
- mostrarte que mirar primero
- evitar que toques algo que rompa datos reales

## Idea clave antes de empezar

No necesitas "saber base de datos" para avanzar hoy.

Lo que necesitas es hacer tres cosas simples:

1. conectarte
2. mirar datos
3. anotar como Hermes registra una venta real

Por ahora no hay que escribir nada.

## Regla de oro

Mientras no entiendas exactamente que hace cada sentencia, usa solo consultas de lectura.

Eso significa:

- si empieza con `SELECT`, en principio estas mirando
- si empieza con `UPDATE`, `DELETE`, `INSERT`, `ALTER`, `DROP`, no lo ejecutes
- si ves un boton que dice ejecutar, correr o aplicar cambios, frena antes si no estas seguro

## Que es una base de datos, explicado simple

Piensalo asi:

- una base de datos es un gran archivador
- una tabla es como una planilla
- cada fila es un registro
- cada columna es un dato de ese registro

Ejemplo mental:

- tabla `contactos` = lista de clientes
- tabla de comprobantes = ventas o facturas
- tabla de detalle = productos dentro de esa venta

## Que necesitamos descubrir en Hermes

La pregunta central no es "como toco stock".

La pregunta central es esta:

"Que datos guarda Hermes cuando ya existe una venta aprobada?"

Lo que queremos identificar es:

- donde esta la cabecera de una venta
- donde esta el detalle de productos
- donde aparece el cliente
- donde aparece el pago
- que campo une todo eso
- en que momento impacta stock

## Plan minimo para tu primera exploracion

### Paso 1. Confirmar que entraste bien

Cuando abras el acceso SQL, busca estas tres cosas:

- nombre de la base actual
- lista de tablas
- lista de vistas

Si la herramienta muestra panel lateral, normalmente vas a ver algo como:

- databases
- tables
- views
- stored procedures

No hace falta tocar nada. Solo expandir y mirar nombres.

## Paso 2. Ubicar tablas candidatas

Busca nombres parecidos a estos:

- `contactos`
- comprobantes
- facturas
- pedidos
- ventas
- detalle
- items
- movimientos
- stock

No importa si no se llaman exactamente asi. Lo importante es encontrar nombres parecidos a:

- cliente
- venta
- comprobante
- detalle
- articulo
- stock

## Paso 3. Mirar primero ejemplos reales, no teoria

La forma mas facil de entender Hermes es pedir o encontrar una venta real ya cargada.

Necesitas una venta concreta y responder:

1. en que tabla aparece primero
2. que numero de comprobante tiene
3. donde estan sus items
4. que campo relaciona cabecera con detalle
5. donde figura el cliente

## Consultas seguras para empezar

Estas consultas son solo de lectura.

Si tu herramienta te deja escribir SQL, estas son las mas seguras para empezar.

### Ver tablas

```sql
SHOW TABLES;
```

### Ver vistas

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

### Ver algunas filas de una tabla

Reemplaza `nombre_tabla` por la tabla que quieras mirar.

```sql
SELECT *
FROM nombre_tabla
LIMIT 20;
```

### Ver estructura de una tabla

```sql
DESCRIBE nombre_tabla;
```

Esto te muestra las columnas, no modifica nada.

## Como leer una tabla sin volverte loco

Cuando abras una tabla, no intentes entender todo junto.

Mira solo estas preguntas:

1. como se llama el id o clave principal
2. si hay un numero de comprobante
3. si hay un campo de cliente
4. si hay fecha
5. si hay total
6. si hay algun campo que parezca unir con otra tabla

Campos tipicos que podrias ver:

- `id`
- `numero`
- `cliente`
- `fecha`
- `total`
- `codigo`
- `comprobante_id`
- `articulo_id`

## Que NO hacer en esta etapa

- no ejecutar consultas que cambien datos
- no probar "a ver que pasa"
- no editar registros reales
- no asumir que una tabla con stock es la que hay que tocar
- no empezar por escribir ventas desde la web

## Forma simple de investigar una venta real

Si alguien de Hermes te muestra una venta ya cargada, sigue este orden:

1. anota el numero de comprobante
2. anota el cliente
3. anota la fecha
4. anota uno de los productos del detalle
5. busca en que tabla aparece ese comprobante
6. busca donde aparecen las lineas o items de ese comprobante
7. busca que campo conecta ambas tablas

Tu objetivo no es entender todo Hermes.

Tu objetivo es descubrir el recorrido minimo de una venta real.

## Senales de que vas bien

Vas bien si logras responder aunque sea de forma incompleta estas preguntas:

- cual es la tabla principal de la venta
- cual es la tabla del detalle
- como se relacionan
- donde aparece el cliente
- si existe un procedimiento almacenado para crear ventas

## Si encuentras stored procedures

Si ves una carpeta o listado de `procedures`, `functions` o `stored procedures`, eso puede ser muy importante.

Porque podria existir una rutina oficial para registrar ventas sin tocar varias tablas a mano.

Si encuentras algo asi, anota:

- nombre exacto
- que parametros pide
- si menciona venta, factura, comprobante, stock o cliente

## Lo que me puedes pasar y yo te lo traduzco

No hace falta que entiendas SQL.

Si me traes cualquiera de estas cosas, yo te lo bajo a tierra:

- captura de pantalla de tablas o vistas
- nombres de tablas que te aparezcan
- columnas de una tabla importante
- un `SELECT * FROM tabla LIMIT 20`
- el texto de un stored procedure

Con eso puedo ayudarte a responder:

- que tabla parece ser la cabecera
- que tabla parece ser el detalle
- si conviene leer o escribir ahi
- si Hermes tiene una rutina oficial mejor que insertar directo

## Mision de hoy

Si quieres avanzar sin complicarte, hoy alcanza con esto:

1. entrar al SQL
2. listar tablas
3. ubicar `contactos` y cualquier tabla parecida a ventas o comprobantes
4. abrir una o dos tablas con `SELECT * ... LIMIT 20`
5. traer esos nombres o capturas

Con eso ya podemos hacer la siguiente parte juntos.

## Hallazgo real de esta base Hermes

Fecha: 2026-04-20

En el acceso actual ya aparecen estas tablas dentro del schema `hermes`:

- `comprob_ventas`
- `comprobantes`
- `items_comprobantes`
- `movimientos_stk`
- `pagos`
- `pagos_detalle`

Lectura simple de lo que sugieren esos nombres:

- `comprobantes` probablemente sea la cabecera principal del comprobante
- `items_comprobantes` probablemente sea el detalle de productos o lineas
- `pagos` y `pagos_detalle` probablemente registren el cobro
- `movimientos_stk` probablemente refleje movimientos de stock
- `comprob_ventas` probablemente conecte o clasifique comprobantes de venta

Importante:

- esto todavia es una hipotesis por nombre
- antes de escribir nada hay que confirmar la estructura de cada tabla con consultas de lectura
- en esta primera vista no aparece `contactos`, asi que puede estar en otro schema, no estar visible con este usuario o llamarse distinto

## Proximo paso exacto recomendado

Primero no uses `SELECT * FROM comprob_ventas` solo.

Usa mejor estas consultas seguras:

```sql
USE hermes;

DESCRIBE comprobantes;
DESCRIBE items_comprobantes;
DESCRIBE pagos;
DESCRIBE pagos_detalle;
DESCRIBE movimientos_stk;
DESCRIBE comprob_ventas;
```

Despues, para ver ejemplos reales sin traerte miles de filas:

```sql
SELECT * FROM comprobantes LIMIT 20;
SELECT * FROM items_comprobantes LIMIT 20;
SELECT * FROM pagos LIMIT 20;
SELECT * FROM pagos_detalle LIMIT 20;
SELECT * FROM movimientos_stk LIMIT 20;
SELECT * FROM comprob_ventas LIMIT 20;
```

Con solo esos resultados ya deberiamos poder detectar bastante bien:

- cual es la tabla cabecera
- cual es la tabla detalle
- como se relacionan
- donde impacta stock
- donde aparece el pago

## Lectura practica de las estructuras encontradas

Fecha: 2026-04-20

Con los `DESCRIBE` ya se puede inferir esto con bastante confianza.

### 1. Cabecera del comprobante

La tabla `comprobantes` parece ser la cabecera principal.

Señales fuertes:

- tiene `Codigo` como clave primaria
- tambien aparece `NroEmp`
- tiene varios campos de numeracion y datos comerciales
- contiene campos que parecen logisticos, administrativos y generales del comprobante

Campos llamativos:

- `Codigo`: id principal del comprobante
- `NroEmp`: empresa o sucursal
- `NroVen`, `NroFac`, `NroCar`: numeros o referencias internas
- `Remito`: posible numero o referencia de remito
- `Contac`: posible referencia a cliente o contacto
- `NomCom`: nombre comercial o descripcion corta
- `Entreg`: datos de entrega

### 2. Detalle del comprobante

La tabla `items_comprobantes` parece ser el detalle de productos.

Señales fuertes:

- tambien usa `Codigo`
- tiene `CodArt`, que casi seguro es el codigo de articulo
- tiene `CanTid`, `Descri`, `PreUni`
- tiene impuestos y descuentos por item

Lectura simple:

- `Codigo`: id del comprobante al que pertenece el item
- `CodArt`: articulo o producto
- `CanTid`: cantidad
- `Descri`: descripcion
- `PreUni`: precio unitario
- `Descue` / `PorDes`: descuento

Hipotesis actual:

- la venta se une entre `comprobantes` e `items_comprobantes` por `Codigo`
- `NroEmp` probablemente tambien participa en la relacion o en filtros operativos

### 3. Tabla de venta

La tabla `comprob_ventas` parece complementar a `comprobantes` con datos propios de una venta.

Señales fuertes:

- usa `Codigo` como clave primaria
- tiene `NroCli`, que casi seguro es numero de cliente
- tiene `Nombre`, `Cuit`, `ProvIn`
- tiene `FecOpe` y `FecDif`
- tiene `CodDgr`, `TipOpe`, `TipCom`, `Letra`, `Compro`

Lectura simple:

- `Codigo`: id del comprobante de venta
- `NroCli`: cliente
- `Nombre`: nombre del cliente en esa venta
- `Cuit`: documento fiscal
- `TipCom`, `Letra`, `Compro`: tipo y datos del comprobante
- `FecOpe`: fecha de operacion

Conclusión provisoria:

- `comprobantes` parece ser la cabecera general
- `comprob_ventas` parece ser la parte especifica de ventas y cliente

### 4. Pagos

La tabla `pagos` es muy pequeña y parece ser la cabecera del pago.

Campos visibles:

- `NroEmp`
- `Codigo` como clave primaria
- `CodVta`
- `CodCra`
- `FecPag`

Lectura simple:

- `Codigo`: id del pago
- `CodVta`: probablemente codigo de venta o comprobante de venta al que aplica
- `FecPag`: fecha de pago

La tabla `pagos_detalle` parece guardar la composicion del pago.

Campos visibles:

- `Codigo`
- `TipPag`
- `ImpPag`
- `CodChe`
- `CodAsi`
- `Clave`

Lectura simple:

- `Codigo`: id del pago al que pertenece el detalle
- `TipPag`: tipo de pago
- `ImpPag`: importe pagado
- `Clave`: id interno autoincremental del detalle

Hipotesis actual:

- una venta no necesariamente guarda el pago en la misma tabla
- Hermes probablemente separa venta y pago
- `pagos.CodVta` podria ser el puente hacia la venta

### 5. Stock

La tabla `movimientos_stk` parece ser el movimiento de stock generado por una operacion.

Señales fuertes:

- tiene `CodMov`
- tiene `FecMov`
- tiene `Cantid`
- tiene `PreUni`
- tiene `CodCom`
- tiene `Compro`

Lectura simple:

- `CodMov`: tipo de movimiento de stock
- `FecMov`: fecha del movimiento
- `Cantid`: cantidad movida
- `PreUni`: precio unitario
- `CodCom`: codigo del comprobante relacionado
- `Compro`: texto o referencia del comprobante

Conclusión provisoria:

- el stock parece moverse como consecuencia de un comprobante
- esto va a favor de la idea de no tocar stock manualmente desde la web

## Mapa provisional del circuito

Por ahora, el circuito mas probable es este:

1. se crea un comprobante general en `comprobantes`
2. se guarda la parte comercial o de venta en `comprob_ventas`
3. se insertan los productos en `items_comprobantes`
4. se registra el pago en `pagos`
5. se registra el detalle del pago en `pagos_detalle`
6. Hermes genera o deja trazado el movimiento en `movimientos_stk`

Esto todavia no prueba el orden exacto ni las claves reales, pero ya muestra algo importante:

- Hermes no parece trabajar con un solo insert simple
- la venta, el pago y el stock parecen estar separados
- por eso sigue siendo muy probable que convenga usar una rutina oficial o reproducir el circuito completo con mucho cuidado

## Proxima verificacion segura y concreta

Para confirmar las relaciones, conviene mirar pocas filas reales.

Corre esto:

```sql
SELECT * FROM comprobantes LIMIT 5;
SELECT * FROM comprob_ventas LIMIT 5;
SELECT * FROM items_comprobantes LIMIT 10;
SELECT * FROM pagos LIMIT 10;
SELECT * FROM pagos_detalle LIMIT 10;
SELECT * FROM movimientos_stk LIMIT 10;
```

Y despues, si quieres un chequeo mas dirigido, prueba estas consultas de lectura:

```sql
SELECT Codigo, NroEmp, Contac, NroFac, NroVen, Remito
FROM comprobantes
LIMIT 10;

SELECT Codigo, NroEmp, NroCli, Nombre, Cuit, TipCom, Letra, Compro, FecOpe
FROM comprob_ventas
LIMIT 10;

SELECT Codigo, NroEmp, CodArt, Descri, CanTid, PreUni
FROM items_comprobantes
LIMIT 10;

SELECT Codigo, CodVta, FecPag
FROM pagos
LIMIT 10;

SELECT Codigo, TipPag, ImpPag, CodChe, CodAsi
FROM pagos_detalle
LIMIT 10;

SELECT CodCom, Compro, CodMov, FecMov, Cantid, PreUni
FROM movimientos_stk
LIMIT 10;
```

Con eso ya deberiamos poder responder algo mucho mas util:

- si `Codigo` efectivamente une cabecera y detalle
- si `pagos.CodVta` apunta al codigo de venta
- si `movimientos_stk.CodCom` apunta al comprobante que genero el stock

## Confirmacion con un caso real: Codigo 5152

Fecha: 2026-04-20

Ya se siguio una venta real usando `Codigo = 5152`.

### Lo que quedo confirmado

#### 1. La venta no vive en una sola tabla

El comprobante se reparte entre varias tablas:

- `comprobantes`: cabecera general
- `comprob_ventas`: datos de la venta y del cliente
- `items_comprobantes`: detalle de productos
- `pagos`: cabecera del pago
- `pagos_detalle`: detalle del pago
- `movimientos_stk`: movimientos de stock

#### 2. `Codigo` une las partes de la operacion

Con `Codigo = 5152` aparecieron filas relacionadas en:

- `comprobantes`
- `comprob_ventas`
- `items_comprobantes`
- `movimientos_stk`

Y el pago aparecio por `pagos.CodVta = 5152`.

Eso confirma que:

- `Codigo` es un identificador central del comprobante
- `CodVta` en `pagos` apunta a la venta o comprobante vendido

#### 3. `NroEmp + Codigo` parece ser la clave operativa real

Con `Codigo = 5152` aparecieron filas repetidas en mas de un contexto.

Eso sugiere que no alcanza con filtrar solo por `Codigo`.

Hipotesis fuerte actual:

- la clave operativa real es `NroEmp + Codigo`

Esto es importante porque si algun dia se integra escritura, no se deberia trabajar solo con `Codigo` sin contexto.

#### 4. La parte cliente vive en `comprob_ventas`

En el caso real se vio una fila con datos de cliente como:

- `NroCli = 2155`
- `Nombre = RUEDA PABLO`
- `Cuit = 23-2325482-9`
- `Compro = 0000-00000264`

Conclusión simple:

- la informacion comercial de la venta no parece estar toda en `comprobantes`
- `comprob_ventas` guarda la parte de cliente y tipo de comprobante

#### 5. El detalle de productos vive en `items_comprobantes`

Con `Codigo = 5152` aparecieron muchas filas de items.

Eso confirma que ahi viven:

- codigo de articulo
- descripcion
- cantidad
- precio unitario
- descuentos
- impuestos por item

Conclusión simple:

- una venta real necesita insertar varias lineas, no una sola fila.

#### 6. El pago va separado de la venta

Con esta consulta:

```sql
SELECT *
FROM pagos
WHERE CodVta = 5152;
```

aparecio un pago con:

- `Codigo = 4607`
- `CodVta = 5152`
- `FecPag = 2017-10-26`

Y luego `pagos_detalle` devolvio detalle para ese `Codigo = 4607`.

Conclusión simple:

- la venta y el pago no son la misma cosa en Hermes
- primero existe la venta
- despues existe un pago asociado a esa venta

#### 7. El stock cuelga del comprobante

Con esta consulta:

```sql
SELECT *
FROM movimientos_stk
WHERE CodCom = 5152;
```

aparecieron muchos movimientos de stock ligados a la misma operacion.

Conclusión fuerte:

- Hermes mueve stock como consecuencia del comprobante
- esto va claramente en contra de hacer un update manual aislado de stock desde la web

## Conclusion practica importante

Con lo visto hasta ahora, la integracion correcta no parece ser:

- tocar una sola tabla
- descontar stock manualmente
- registrar pago y stock por separado sin comprobante

La integracion correcta parece ser algo de este estilo:

1. registrar la venta en el circuito de comprobantes
2. registrar sus items
3. registrar el pago asociado
4. dejar que Hermes genere o refleje el movimiento de stock

## Que significa esto para la web

La web no deberia intentar "descontar stock en Hermes" como accion independiente.

Lo que la web deberia hacer, una vez aprobado el pago, es ejecutar el circuito oficial que Hermes use para dejar la venta correctamente registrada.

Eso puede ser:

- un procedimiento almacenado
- varias inserciones en orden
- una rutina interna ya definida por Hermes

Pero con lo visto hasta ahora, ya no parece razonable pensar en un solo `UPDATE stock = stock - x`.

## Siguiente pregunta tecnica correcta para Hermes

Con esta evidencia, la pregunta correcta para quien conozca Hermes es:

"Cual es el procedimiento oficial para generar correctamente una venta ya cobrada, con cliente, items, pago y movimiento de stock alineados?"

## Siguiente paso recomendado en SQL

Antes de escribir nada, lo ideal es pedir o encontrar una venta ejemplo creada desde el propio sistema Hermes y preguntar:

1. que sentencia o rutina la genero
2. si usaron un procedure
3. si el stock se genero automaticamente al grabar el comprobante
4. que tabla se inserta primero
5. que campos son obligatorios en cada paso

## Resumen brutalmente simple

Tu trabajo ahora no es programar ni modificar la base.

Tu trabajo ahora es mirar y reconocer:

- donde estan los clientes
- donde estan las ventas
- donde esta el detalle
- si hay una rutina oficial

Primero entender. Despues recien decidir como integrar.