1. Tengo que realizar unos cambios en el filtrado de los productos. Principalmente debo poder filtrar en la seccion de los productos ademas de por categorias como ya esta implementado, agregar el filtro de "Marcas" el cual debe venir desde el sql de hermes "Marca". Se debera modificar el frontend del filtrado de productos para que sea parecido al que te comparto en la captura.

2. Los productos destacados por ahora solo se muestran 4 en la home principal

## CAMBIOS FILTRADO:

### Objetivo
- Incorporar filtro por Marca en la sección de productos, usando el campo Marca proveniente de Hermes (vista_articulos).
- Mantener el filtro por Categoría actual.
- Rediseñar el bloque de filtros para que sea similar a la referencia visual y funcione bien con muchas categorías/marcas.

### Alcance funcional
- Filtros acumulativos: búsqueda por texto + categoría + marca + rango de precio + orden.
- Compatibilidad con URL params para compartir filtros activos.
- Estado vacío claro cuando no hay coincidencias.

### Plan operativo por etapas
1. Relevamiento y contratos de datos
- Verificar que el endpoint público de productos devuelva marca normalizada (trim, null-safe).
- Confirmar formato final para categoría y marca (string legible para UI).
- Definir reglas de orden para listas de filtros (alfabético, acentos, mayúsculas/minúsculas).

2. Modelo de filtros en frontend
- Extender el estado de filtros para incluir marcas seleccionadas.
- Definir si Marca será selección simple o múltiple (recomendado: múltiple por checkbox).
- Mantener compatibilidad con filtros actuales sin romper navegación desde menú/header.

3. Rediseño de UI de filtros (similar a captura)
- Implementar panel lateral de filtros en desktop y versión drawer/modal en mobile.
- Secciones separadas: Categorías, Marcas, Rango de precio, botón Limpiar filtros.
- Usar listas con scroll interno y alto máximo para evitar desborde visual.

4. Estrategia para alta cantidad de categorías/marcas (solución recomendada)
- No usar solo chips horizontales cuando la lista crece.
- Usar acordeones con contador de resultados por sección.
- Dentro de Marcas: input "Buscar marca..." + lista virtual o paginada si hiciera falta.
- Mostrar inicialmente top marcas (ejemplo: 10) y botón "Ver más" para expandir.
- Agregar "Seleccionadas" arriba para ver/quitar rápido filtros activos.

5. Lógica de filtrado
- Aplicar filtros en este orden: texto -> categoría -> marca -> precio -> orden.
- Normalizar comparaciones (case-insensitive y trim).
- Evitar recomputaciones innecesarias con memoización.

6. Integración URL y persistencia de estado
- Soportar params tipo: ?categoria=...&marcas=...&q=...&min=...&max=...&sort=...
- Serializar marcas múltiples con coma o params repetidos (definir estándar y mantenerlo consistente).
- Al refrescar, reconstruir filtros desde URL para mantener experiencia.

7. QA y validación
- Probar casos límite: productos sin marca, marca vacía, acentos, duplicados por casing.
- Probar combinaciones de filtros y rendimiento en catálogo grande.
- Verificar responsive (desktop/tablet/mobile) y accesibilidad de controles.

8. Cierre y documentación
- Actualizar esta guía con decisiones finales de UX y formato de URL params.
- Dejar checklist de regresión para próximos cambios de catálogo.

### Decisión UX propuesta (respuesta a la duda)
- Si la cantidad de categorías y marcas no entra en selectores/chips, la mejor solución es panel lateral con:
- Checkbox list con scroll.
- Buscador interno para Marcas.
- Acordeones colapsables por sección.
- "Ver más / Ver menos" para no saturar.
- En mobile, el mismo contenido en modal fullscreen con botón "Aplicar filtros".

### Definiciones pendientes antes de implementar
- Marca: selección única o múltiple (recomendado: múltiple).
- URL de marcas: separadas por coma o params repetidos.
- ¿Mostrar contador por categoría/marca desde resultados actuales?

### Estado implementado (2026-06-06)
- Se agrego filtro por marcas en frontend (seleccion multiple con checkboxes).
- Se reemplazo el bloque superior por un panel lateral de filtros con:
- Categorias con scroll.
- Marcas con buscador interno y boton ver mas/ver menos.
- Boton limpiar filtros.
- El backend de productos publicados ahora incluye marca en el select de Supabase y usa fallback cuando Hermes no responde marca.
- Se mantiene filtro por categoria, busqueda por texto, orden y rango de precios.

### Refactor de estabilidad (2026-06-06)
- Se separaron responsabilidades de filtros para evitar colisiones de estado:
- TextFilters: solo query (SearchBar).
- CatalogFilters: categoria, marcas y rango de precio (panel lateral + ProductList).
- SearchBar ya no administra ni emite rango/orden, evitando que pise filtros del panel.

## CAMBIOS DESTACADOS (NUEVA ETAPA)

### Objetivo funcional
- Permitir seleccionar mas de 4 productos con flag destacado desde admin.
- Mantener en home solo 4 destacados (los primeros 4 segun prioridad definida).
- Mostrar el resto de destacados en la seccion productos.

### Regla de negocio propuesta
- Destacados Home: primeros 4 destacados.
- Destacados Catalogo: destacados desde posicion 5 en adelante.
- Si hay menos de 4 destacados, home completa con fallback actual.
- Si no hay destacados, home mantiene fallback actual.

### Criterio de prioridad (orden de destacados)
- Definir una prioridad estable para evitar resultados "aleatorios".
- Opcion recomendada (sin cambiar DB): usar orden actual consistente (nombre ascendente o fecha de publicacion si existe).
- Opcion ideal (fase 2): agregar campo prioridad_destacado en DB para controlar el orden manualmente desde admin.

### Plan operativo por etapas
1. Relevamiento tecnico
- Confirmar como se ordenan hoy los destacados en API publica.
- Identificar todos los consumidores de destacados: home, catalogo y admin.

2. Backend y contrato de datos
- Mantener destacado como booleano.
- Asegurar que el endpoint publico entregue orden estable para destacados.
- (Opcional fase 2) agregar prioridad_destacado y exponerla en API.

3. Home
- Ajustar componente de home para tomar solo 4 destacados.
- Mantener fallback actual cuando no alcance la cantidad.

4. Catalogo (seccion productos)
- Crear bloque "Productos destacados" encima del grid general o en posicion destacada.
- Alimentarlo con destacados excedentes (desde el quinto en adelante).
- Evitar duplicacion visual con el listado general (si aplica, excluirlos del grid principal o solo destacarlos con etiqueta).

5. Admin (sin romper flujo actual)
- Quitar alerta visual de "max 4" como restriccion dura (hoy aparece como warning).
- Cambiar texto explicativo:
- "Se pueden marcar varios destacados; los primeros 4 van a Home y el resto se muestran en Catalogo".

6. UX/UI
- Home: mantener bloque actual limpio y corto (4 cards).
- Catalogo: seccion de destacados clara, con titulo y diferenciacion visual suave.
- Mobile: mantener consistencia de cards y jerarquia visual.

7. QA / pruebas
- Caso A: 0 destacados (fallback home).
- Caso B: 1 a 4 destacados (solo home).
- Caso C: 5+ destacados (4 home + excedente en catalogo).
- Validar que admin sigue pudiendo marcar/desmarcar sin errores.

### Definiciones pendientes antes de implementar
- Confirmar orden de prioridad para decidir "primeros 4".
- Definir si el bloque de destacados en catalogo excluye esos productos del grid general o los deja repetidos.
- Definir titulo final de la seccion en catalogo (ej: "Mas destacados").