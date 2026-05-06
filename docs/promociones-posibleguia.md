Estrategia de Promociones Recomendada
1. Estructura de Datos en Supabase
Crear tabla product_promotions:

Columnas mínimas:
- id (uuid, PK)
- product_id (uuid, FK → productos_publicados.id)
- precio_promo (numeric)
- descuento_porcentaje (numeric, opcional, para auditoría)
- fecha_inicio (timestamp)
- fecha_fin (timestamp)
- activo (boolean)
- created_at, updated_at (timestamps)

Ventaja: Desacoplada de productos_publicados. Si una promo termina, la fila queda registrada (auditoría). Un producto puede tener histórico de promos.

Validación: No duplicar promos activas del mismo producto (constraint única con WHERE activo = true).

2. Lógica de Cruce: JOIN en SQL vs. Merge en Node.js
Recomendación: JOIN en Supabase (View o query más elaborada) ✅

Razones:

Filtrado temprano: Supabase devuelve una sola query con precio promo ya calculado.
Consistencia: El servidor no necesita lógica de deduplicación; una única fuente de verdad.
Performance: Una round-trip en lugar de fetch + merge + iteración en Node.js.
Flujo mejorado:

GET /api/published-products
  → SELECT p.*, COALESCE(pr.precio_promo, p.precio) AS precio_aplicado
    FROM productos_publicados p
    LEFT JOIN product_promotions pr 
      ON p.id = pr.product_id 
      AND pr.activo = true 
      AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
    WHERE p.activo = true
  
  → Enriquece con Hermes (merge precio live de Hermes si hermes_id existe)
  → Retorna con precio_aplicado + precio_hermes


  Pseudocódigo del merge en Node.js:

  Para cada producto:
  1. Obtén precio_aplicado (promo or original)
  2. Obtén precio_hermes (si existe hermes_id)
  3. Devuelve: {
       ...producto,
       precio_base: producto.precio,
       precio_aplicado: precio_promo || producto.precio,
       precio_hermes: livePrice,
       precio_final: aplicar_logica_precedencia()
     }

     3. Precedencia de Precios (crítico)
Define explícitamente en tu servidor qué precio gana:

Opción A (Recomendada): Promo > Hermes > Base
precio_final = precio_promo (si existe y activa)
             || precio_hermes (si existe)
             || precio_base

 Opción B: Hermes > Promo > Base (si Hermes siempre es "vivo")
             precio_final = precio_hermes
             || precio_promo (fallback si Hermes falla)
             || precio_base

Elige según tu negocio. Documéntalo en /src/lib/pricingLogic.ts para que sea reutilizable.

4. Estado Global del Carrito (Zustand)
Recomendación: Persistir el "precio capturado" al agregar; validar en checkout ✅

Por qué:

El usuario ve consistencia mientras navega el carrito.
Un precio no cambia mientras el producto está en el carrito (evita sorpresas).
En checkout, revalidás contra la BD: si la promo expiró entre que lo agregó y que compró, actualizás y notificás.
Flujo:

1. ADD_TO_CART (ProductDetail):
   - Captura precio_final en ese momento
   - Almacena en Zustand: { product_id, price_captured, quantity, ... }

2. CART VIEW:
   - Muestra price_captured (sin queries)

3. CHECKOUT (antes de crear orden):
   - Valida precio_captured contra `/api/validate-prices`
   - Si cambió, notifica y da opción: "Aceptar nuevo precio" o "Remover del carrito"
   - Si la promo expiró: precio vuelve al original
   - Persist el precio_final validado en web_orders


Ventaja: Respuesta rápida, sin queries a cada render del carrito.
Seguridad: Validación server-side antes de cobrar (nunca confíes en el cliente).


5. Admin de Promociones
Endpoint /api/admin/promotions:

GET: Listar promos activas + expiradas.
POST: Crear promo (valida: fecha_inicio < fecha_fin, precio_promo < precio_base).
PATCH: Editar (cambiar precio, fechas, activar/desactivar).
DELETE: Soft-delete (mark activo = false) para auditoría.
Gate: Requiere is_admin = true (que ya validás en admin auth).

Resumen: Flujo Completo

FRONTEND (ProductList):
  ↓
  GET /api/published-products
    ├─ Supabase: productos_publicados LEFT JOIN product_promotions
    ├─ Hermes: fetch live (precios, stock)
    └─ Merge + precedencia: precio_final = promo || hermes || base
  ↓
  Mostrar con badge "Oferta" si precio_final < precio_base
  
FRONTEND (ProductDetail → ADD_TO_CART):
  ↓
  Captura price_captured (precio_final actual)
  ↓
  Zustand: guarda { product_id, price_captured, quantity }
  
FRONTEND (Cart):
  ↓
  Muestra items con price_captured (sin queries)
  
BACKEND (Checkout):
  ↓
  POST /api/mercadopago/checkout
    ├─ Valida cada item contra /api/validate-prices
    ├─ Si precio cambió: actualiza price_captured o rechaza
    └─ Crea web_orders con precio_final_validado


Consideraciones Finales
Aspecto	Decisión
Tabla de promos	Nueva tabla product_promotions (desacoplada)
Merge de datos	JOIN en Supabase + merge en Node.js
Persistencia carrito	Precio capturado en Zustand + validación en checkout
Precedencia	Promo > Hermes > Base (documenta en código)
Admin	Nueva sección /admin/promotions con CRUD
Auditoría	Soft-delete + timestamps en tabla de promos
Cache	Cache-Control: no-store (promos pueden cambiar en vivo)
Esta arquitectura permite:

✅ Cambiar promos sin tocar Hermes
✅ Historial de promociones
✅ Validación server-side en checkout
✅ Escalabilidad (una tabla por feature, sin lógica compleja en ORM)
✅ Admin simple y auditado