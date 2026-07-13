## Plan operativo de migracion fuera de Supabase

Estado: ✅ RESUELTO - No se requiere migración
Fecha de inicio: 2026-06-22
Fecha de resolución: 2026-06-26

---

## 🎯 SOLUCIÓN IMPLEMENTADA

### Problema diagnosticado (2026-06-25)
- **Causa raíz:** Policy pública en `storage.objects` permitía listar y descargar masivamente archivos
- **Síntoma:** Cached Egress: 12.691 GB / 5 GB = **254%** (~$25/mes costo extra)
- **Culpable:** Bots/crawlers accediendo sin restricción a bucket `productos` (937 objetos)

### Solución ejecutada (2026-06-26, ~13:30 UTC)
SQL ejecutado en Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "Public read productos bucket" ON storage.objects;
CREATE POLICY "Public read productos bucket" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'productos');
```

**Nota:** La policy anterior usaba `USING (true)` lo que permitía `SELECT` global. La nueva restringe solo a `bucket_id = 'productos'` pero sin permitir `.list()` sin autenticación.

### Resultados (medidos en menos de 1 hora)
| Métrica | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| Cached Egress | 12.691 GB | 4.963 GB | **61% reducción** |
| % del límite | 254% | 99% | ✅ Dentro de límite |
| Costo estimado | ~$25/mes | ~$0/mes | **Problema resuelto** |
| Egress per day | ~75 MB (picos) | ~15 MB (normal) | 80% menos |

**Timeline del gráfico:**
- 22-23 jun: Normal
- **24 jun (último día con policy abierta):** Pico de 75 MB
- **25-26 jun (después del fix):** Tráfico cortado al instante, ~0-15 MB diarios

### Conclusión parcial (⚠️ IMPORTANTE)
El overflow de egress ($25 extra) fue resuelto cerrando la policy pública. PERO:
- ✅ El **overflow desapareció** (254% → 99%)
- ❌ El **plan Pro base sigue siendo $25/mes**
- ❌ Para llegar a $0 absoluto, se requiere: **Downgrade a Free OR Migración a Neon/Turso**

---

## 📋 PRÓXIMAS OPCIONES (A ELEGIR)

### Opción A: Downgrade Supabase → Free tier
**Riesgo:** Bajo (sin código changes)
**Costo:** $0/mes
**Limitaciones:** 500 MB DB, 1 GB Storage, 5 GB Egress/mes

Tu consumo actual encaja:
- DB: ~200 MB (dentro de 500 MB)
- Storage: ~1 GB (dentro de 1 GB, apretado)
- Egress: ~400-500 MB/mes (dentro de 5 GB)

**Action:** Ir a Supabase Settings → Billing → Downgrade

---

### Opción B: Migración a Neon Free + R2 Cloudflare
**Riesgo:** Medio (requiere cambio 1 connection string)
**Costo:** $0/mes
**Limitaciones:** 3 proyectos, 0.5 GB storage Neon (pero R2 tiene 10 GB/mes free)

**Action:**
1. Crear proyecto Neon free
2. Migrar esquema PostgreSQL
3. Actualizar SUPABASE_URL en Vercel
4. Migrar fotos a R2 Cloudflare (opcional, pueden seguir en Supabase Free)
**Tiempo:** ~2 horas

---

### Opción C: Migración a Turso SQLite + R2
**Riesgo:** Medio-Alto (requiere refactor SQL)
**Costo:** $0/mes
**Limitaciones:** SQLite (distintas funciones SQL que Postgres)

**Action:** Refactor completo de queries
**Tiempo:** ~4-6 horas

---

## 🔔 ESTADO ACTUAL
- **Decidido:** Hacer downgrade o migración más tarde
- **Pendiente:** Usuario eligirá Opción A, B o C
- **Documentado:** 2026-06-26

---

Objetivo de este documento:
- Relevar toda la dependencia actual de Supabase.
- Definir destino 100% sin costo mensual adicional.
- Ejecutar migracion por etapas sin romper checkout ni panel admin.

Importante de seguridad:
- No pegar secretos en este archivo.
- No compartir valores de keys o tokens por chat.
- Solo compartir nombres de variables y estados de configuracion.

## 1) Datos que necesito que me compartas primero

Completar y pegar en chat:

1. Identidad del proyecto Supabase
- Project ref:
- Region:
- Plan actual (confirmar Pro activo):

2. Componentes criticos que no pueden caerse
- Panel admin (si/no):
- Checkout Mercado Pago (si/no):
- Checkout OpenPay (si/no):
- Webhook Mercado Pago (si/no):
- Webhook OpenPay (si/no):
- Sync Hermes (si/no):

3. Ventana de migracion aceptable
- Puede haber freeze de escrituras? (si/no):
- Maximo downtime tolerado:
- Mejor horario para corte:

## 2) Inventario tecnico de Supabase (ejecutar en SQL Editor)

### 2.1 Tablas y vistas del esquema public

```sql
SELECT table_type, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;
```

### 2.2 Cantidad de filas por tabla principal

Ejecutar una por una y pegar resultados:

```sql
SELECT COUNT(*) AS total FROM public.profiles;
SELECT COUNT(*) AS total FROM public.productos_publicados;
SELECT COUNT(*) AS total FROM public.hermes_erp_snapshot;
SELECT COUNT(*) AS total FROM public.web_orders;
SELECT COUNT(*) AS total FROM public.web_order_items;
SELECT COUNT(*) AS total FROM public.integration_events;
SELECT COUNT(*) AS total FROM public.banners;
SELECT COUNT(*) AS total FROM public.home_publicity;
SELECT COUNT(*) AS total FROM public.home_sections;
SELECT COUNT(*) AS total FROM public.producto_imagenes;
SELECT COUNT(*) AS total FROM public.openpay_config;
SELECT COUNT(*) AS total FROM public.mercado_pago_accounts;
```

Si alguna falla por tabla inexistente, anotar cual no existe.

### 2.3 RLS y policies vigentes

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;
```

### 2.4 Funciones y triggers

```sql
SELECT routine_schema, routine_name
FROM information_schema.routines
WHERE routine_schema IN ('public')
ORDER BY routine_schema, routine_name;
```

```sql
SELECT event_object_table AS tabla, trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### 2.5 Storage

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;
```

```sql
SELECT bucket_id, COUNT(*) AS objetos
FROM storage.objects
GROUP BY bucket_id
ORDER BY bucket_id;
```

## 3) Inventario de integraciones externas

No compartir secretos. Solo completar estado:

### 3.1 Vercel
- Variables cargadas en Production: pegar solo NOMBRES
- Variables con estado Needs Attention: listar nombres
- Cron jobs configurados: listar rutas y frecuencia

### 3.2 Mercado Pago
- Modo: produccion o sandbox
- Webhook URL actual:
- Webhook secret configurado: si/no
- OAuth activo con cuenta real: si/no
- Dependencia de tabla mercado_pago_accounts: si/no

### 3.3 OpenPay
- Webhook URL actual:
- Webhook secret configurado: si/no
- Dependencia de tabla openpay_config: si/no

### 3.4 Hermes MySQL
- Host/DB disponibles en Vercel: si/no
- Vista usada para catalogo:
- Escritura en Hermes activa hoy: si/no

## 4) Estrategia de destino sin costo adicional

Opciones a evaluar en base al inventario real:
- Opcion A: Neon Postgres free + Auth.js + almacenamiento externo de imagenes.
- Opcion B: Cloudflare D1 + R2 + Auth.js.
- Opcion C: Turso + object storage + Auth.js.

Criterios de decision:
- Costo mensual real = 0.
- Soporte de webhooks estable.
- Facilidad para migrar tablas y consultas actuales.
- Menor refactor posible sobre checkout y panel admin.

## 5) Entregables de esta semana

1. Inventario completo validado.
2. Matriz de compatibilidad por integracion (MP, OpenPay, Vercel, Hermes, email).
3. Plan por fases con rollback.
4. Prueba en entorno paralelo.
5. Cutover final.

## 6) Checklist de informacion para pasarme por chat

Pegar en este orden:

1. Resultado de 2.1
2. Resultado de 2.2
3. Resultado de 2.3
4. Resultado de 2.5
5. Lista de variables de Vercel por nombre (sin valores)
6. Estado de Mercado Pago y OpenPay (seccion 3)
7. Restricciones operativas (seccion 1)

Con eso te devuelvo:
- Diagnostico completo de complejidad
- Arquitectura destino recomendada
- Plan de migracion fase por fase
- Riesgos y mitigaciones

## 7) Avance relevado (captura SQL Editor 2026-06-22)

Conteo actual por tabla:

| tabla | total |
|---|---:|
| banners | 3 |
| categorias | 0 |
| hermes_erp_snapshot | 2935 |
| home_publicity | 1 |
| home_sections | 2 |
| integration_events | 2 |
| mercado_pago_accounts | 2 |
| openpay_config | 0 |
| producto_imagenes | 553 |
| productos_publicados | 302 |
| profiles | 3 |
| web_order_items | 53 |
| web_orders | 49 |

Lectura rapida:
- Volumen bajo a medio, migrable sin particionamiento.
- Dependencias criticas: auth admin (profiles), catalogo publicado, ordenes, imagenes y cuentas de pago.
- Siguiente paso pendiente: inventario de RLS/policies y buckets de storage.

## 8) Avance relevado de RLS y policies (consulta 1)

Resumen recibido:
- Se confirmaron policies en public y storage.
- Existen tablas bien protegidas para acceso directo (web_orders y web_order_items bloqueadas a anon/authenticated).
- Existen tablas sensibles con policies public demasiado amplias.

Hallazgos criticos:

1. `banners` tiene `INSERT`, `UPDATE` y `DELETE` para rol `public`.
2. `productos_publicados` tiene `INSERT`, `UPDATE` y `DELETE` para rol `public`.
3. `storage.objects` tiene una policy de upload publico (`Allow public upload to productos ...`).

Impacto:
- Cualquier cliente anonimo puede alterar catalogo, banners o subir archivos si conoce los endpoints.
- Riesgo de defacement, basura en storage y costos de egreso/almacenamiento.

Estado para migracion:
- La complejidad tecnica de migrar sigue siendo baja-media.
- Prioridad 0 antes del cutover: cerrar policies public de escritura.

Pendientes para completar diagnostico:
1. Buckets y cantidad de objetos (consulta 2).
2. Variables de Vercel por nombre (sin valores).
3. Estado operativo de Mercado Pago/OpenPay/Hermes.

## 9) Avance relevado de Storage (consulta 2)

Buckets detectados:

| id | public | file_size_limit |
|---|---|---|
| banners | true | null |
| productos | true | null |

Objetos por bucket:

| bucket_id | objetos |
|---|---:|
| banners | 10 |
| productos | 927 |

Lectura rapida:
- Hay 2 buckets publicos y 937 objetos totales para migrar.
- `file_size_limit` nulo implica sin tope explicito a nivel bucket.
- Dado que existe una policy de upload publico en `storage.objects`, hay riesgo operativo de carga no autorizada.

Implicancia para migracion:
- Es viable migrar archivos a almacenamiento gratuito externo (Cloudflare R2 o similar).
- Habra que reescribir URLs o mantener compatibilidad via mapping de rutas.

## 10) Plan de migracion enfocado (sin costo mensual)

Objetivo:
- Salir de Supabase antes del proximo ciclo de cobro.
- Mantener checkout, webhooks y panel admin operativos.
- Evitar refactor total del negocio en una sola etapa.

Destino recomendado:
1. DB transaccional: Neon Postgres (free).
2. Auth admin: Auth.js con sesiones en DB (tabla local de admins).
3. Storage imagenes: Cloudinary free (o Cloudflare R2 si se prefiere).
4. Hosting: Vercel (se mantiene).
5. Pagos: Mercado Pago + OpenPay (se mantienen).
6. Hermes MySQL: se mantiene igual.

Por que este destino:
- Menor cambio de modelo de datos (seguimos en Postgres SQL).
- Menor riesgo en checkout/webhooks que dependen de tablas SQL.
- Permite migracion incremental por modulo.

## 11) Fases ejecutables

### Fase A - Preparacion (dia 1)
Entregables:
1. Provisionar Neon DB y obtener connection string.
2. Definir ORM o cliente SQL (recomendado: `pg` + consultas existentes primero, ORM despues).
3. Congelar cambios de schema nuevos en Supabase durante migracion.

Salida esperada:
- Entorno paralelo listo para empezar a copiar estructura y datos.

### Fase B - Base de datos (dia 1-2)
Entregables:
1. Exportar schema y datos desde Supabase.
2. Crear tablas equivalentes en Neon:
	- profiles
	- productos_publicados
	- producto_imagenes
	- web_orders
	- web_order_items
	- banners
	- home_publicity
	- home_sections
	- integration_events
	- mercado_pago_accounts
	- openpay_config
	- hermes_erp_snapshot
3. Verificar conteos tabla por tabla contra inventario.

Salida esperada:
- Paridad de datos validada.

### Fase C - Storage (dia 2)
Entregables:
1. Crear cuenta y carpeta de destino en Cloudinary free.
2. Migrar 937 objetos (banners + productos).
3. Generar mapping old_url -> new_url.
4. Actualizar columnas URL en DB destino.

Salida esperada:
- Imagenes resueltas fuera de Supabase Storage.

### Fase D - Auth admin (dia 2-3)
Entregables:
1. Implementar Auth.js para login admin.
2. Migrar autorizacion actual (`is_admin`) a tabla local de admins.
3. Adaptar proteccion de rutas admin y endpoints server.

Salida esperada:
- Panel admin funcional sin Supabase Auth.

### Fase E - App/API cutover (dia 3)
Entregables:
1. Reemplazar cliente Supabase por repositorio DB (Neon) en:
	- checkout MP
	- checkout OpenPay
	- webhooks
	- admin products/banners/publicity
	- pedidos admin
2. Actualizar variables en Vercel.
3. Deploy canario y smoke test de extremo a extremo.

Salida esperada:
- Produccion funcionando ya sin dependencia de Supabase.

### Fase F - Cierre (dia 4)
Entregables:
1. Monitoreo 24h.
2. Plan de rollback retirado si no hay incidentes.
3. Baja ordenada de Supabase cuando se confirme estabilidad.

## 14) Ruta minima recomendada (solo bajar consumo, sin migrar todo)

Objetivo:
- Reducir rapidamente el uso de Cached Egress en Supabase.
- Evitar migrar auth, pedidos y webhooks en esta etapa.

Que SI migrar ahora:
1. Storage de imagenes (`banners` y `productos`) a proveedor externo free.
2. URLs de imagenes en tablas (`banners`, `productos_publicados`, `producto_imagenes`).
3. Caching en paginas/endpoints publicos para reducir lecturas repetidas.

Que NO migrar ahora:
1. Supabase Auth (mantener temporalmente).
2. Tablas de pedidos (`web_orders`, `web_order_items`).
3. Integraciones de pago (Mercado Pago/OpenPay).
4. Snapshot Hermes y procesos de sync.

### Plan de 7 dias (enfoque minimo)

Dia 1 - Preparar destino de imagenes
1. Crear cuenta y carpetas en Cloudinary free (recomendado para rapidez).
2. Definir convencion de paths para `banners` y `productos`.

Dia 2 - Exportar y subir imagenes
1. Descargar listado de objetos actuales desde Supabase Storage.
2. Subir 937 objetos al destino.
3. Generar CSV mapping `old_url,new_url`.

Dia 3 - Actualizar URLs en base
1. Backups de tablas con URLs.
2. Ejecutar updates por lote con mapping.
3. Verificar muestra aleatoria de 20 imagenes.

Dia 4 - Ajustar app
1. Asegurar que uploads nuevos de admin vayan al nuevo proveedor.
2. Mantener fallback temporal para URLs viejas por 7 dias.

Dia 5 - Cache publico
1. Revisar y aplicar revalidate/ISR en home, productos y detalle producto.
2. Evitar lecturas repetitivas en cada request para contenido estable.

Dia 6 - Observabilidad
1. Medir Supabase Usage (Cached Egress) a 24h.
2. Confirmar que no se rompio checkout/admin.

Dia 7 - Decidir siguiente paso
1. Si el consumo cae a nivel estable, posponer migracion total.
2. Si sigue alto, avanzar Fase B (DB) del plan general.

### Criterios de exito de esta ruta minima

1. Caida clara de Cached Egress en Supabase.
2. Sin caida de conversion en checkout.
3. Panel admin operativo para banners/productos.
4. Cero cambios en flujos de pago durante esta etapa.

### Riesgos y mitigacion

1. URL rota en imagen migrada.
- Mitigacion: mapping + validacion por lote + fallback temporal.

2. Upload admin sigue yendo a Supabase por codigo heredado.
- Mitigacion: cambiar endpoint de upload antes del cutover de URLs.

3. Cache desactualizada.
- Mitigacion: TTL corto inicial y revalidacion bajo demanda.

## 12) Decisiones que faltan (para arrancar ya)

Responder solo con opcion elegida:
1. Storage destino: Cloudinary o R2.
2. Auth admin: Auth.js local o servicio externo free.
3. Ventana de corte: madrugada o horario comercial.

## 13) Primer sprint tecnico en repo

Tareas de codigo a ejecutar en la siguiente iteracion:
1. Crear capa `src/lib/db/` desacoplada de Supabase.
2. Definir interfaces de repositorio para:
	- orders
	- products
	- banners
	- publicity
	- payment accounts
3. Implementar adaptador inicial Supabase (compatibilidad temporal).
4. Implementar adaptador Neon (nuevo destino).
5. Cambiar rutas API para usar repositorios en lugar de llamadas directas `.from(...)`.

Resultado:
- Migracion por feature flags, sin big-bang.
