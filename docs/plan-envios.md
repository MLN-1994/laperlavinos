# Plan de Envíos — La Perla Vinos

Fecha: 2026-05-12  
Origen: Bahía Blanca, Buenos Aires, CP 8000

---

## Contexto operativo

- Las chicas despachan en sucursal Andreani físicamente
- No se requiere integración de pickup/logística inversa por ahora
- El costo de envío se muestra al cliente ANTES de pagar
- Se guarda en `web_orders.shipping_amount` (campo ya existe)
- Andreani API (cotizador oficial) requiere contrato con +250 envíos/mes

---

## Opción A — Zonas con tarifas fijas (recomendada ahora)

Tarifas planas por zona geográfica, editables desde admin sin tocar código.

### Zonas propuestas desde Bahía Blanca

| Zona | Provincias incluidas | Precio estimado |
|------|----------------------|-----------------|
| 0 — Bahía Blanca | CP 8000–8099 | Gratis (entrega propia o retiro) |
| 1 — PBA interior | Buenos Aires (interior), La Pampa | A confirmar |
| 2 — CABA + GBA | CABA, Partidos del GBA | A confirmar |
| 3 — Centro | Córdoba, Santa Fe, Entre Ríos, Mendoza | A confirmar |
| 4 — Litoral + Cuyo | Corrientes, Misiones, Chaco, Formosa, San Juan, San Luis, Tucumán | A confirmar |
| 5 — NOA | Salta, Jujuy, Santiago del Estero, Catamarca | A confirmar |
| 6 — Patagonia | Neuquén, Río Negro, Chubut, Santa Cruz, Tierra del Fuego | A confirmar |

**Cómo averiguar los precios:**
1. Ir a https://www.andreani.com → simulador de envío
2. Origen: CP 8000 (Bahía Blanca)
3. Destino: un CP representativo de cada zona (ej: 1000 para CABA, 5000 para Córdoba, 8300 para Neuquén)
4. Peso: 1 caja de 6 botellas ≈ 10 kg, 30x30x40cm
5. Anotar el precio de cada zona y usarlo como tarifa plana

---

## Opción B — API de cotización en tiempo real (posible sin contrato)

Existen APIs públicas de cotización que NO requieren contrato con Andreani:

### Opción B1 — Andreani API pública de cotización
- URL: `https://apis.andreani.com/v2/tarifas`
- Requiere una API key básica (se obtiene registrándose como usuario, no como empresa)
- Devuelve precio exacto por CP origen → CP destino → peso → dimensiones
- **El despacho sigue siendo manual en sucursal** — la API solo calcula, no genera orden
- Limitación: puede cambiar sin aviso si Andreani modifica su política

### Opción B2 — OCA API
- Similar a Andreani, tiene cotizador público
- Menos cobertura en interior del país

### Opción B3 — Shipnow / Enviame (agregadores)
- Agregan múltiples transportistas
- Tienen plan gratuito para bajo volumen
- Devuelven cotización de Andreani, OCA, Correo Argentino en un solo request
- El despacho sigue siendo manual

---

## Recomendación

**Ahora:** Opción A (zonas fijas) — implementar en 1 día, sin dependencias externas, fácil de mantener.

**Cuando tengan volumen (+50 envíos/mes):** migrar a Opción B1 o B3 para cotización exacta por CP. El cambio es solo en la lógica de cálculo — el schema de `web_orders` y el formulario de checkout no cambian.

**El despacho físico en sucursal Andreani no cambia con ninguna opción** — la integración API solo afecta al cálculo del precio que ve el cliente. Las chicas siguen yendo a la sucursal con los bultos.

---

## Arquitectura técnica (Opción A)

```
Supabase tabla: shipping_zones
  id          uuid PK
  zone_name   text         -- "Bahía Blanca", "CABA + GBA", etc.
  provinces   text[]       -- ["Buenos Aires", "La Pampa"]
  base_price  numeric      -- precio en ARS
  free_above  numeric      -- monto de compra a partir del cual es gratis (null = nunca gratis)
  activo      boolean

Checkout flow:
  1. Cliente elige provincia en formulario
  2. Frontend consulta GET /api/shipping/quote?province=Buenos Aires
  3. API busca la zona correspondiente en shipping_zones
  4. Devuelve { zone, price, free_above }
  5. Se muestra al cliente antes de confirmar
  6. Al crear la preferencia MP/OpenPay, se suma al total
  7. Se guarda en web_orders.shipping_amount y shipping_provider = 'zona_fija'

Admin /admin/envios:
  - Tabla con las zonas
  - Editar precio por zona
  - Activar/desactivar zonas
```

---

## Siguiente paso

1. Simular envíos en andreani.com para obtener precios por zona
2. Confirmar precios → crear tabla `shipping_zones` en Supabase
3. Implementar selector de provincia en checkout + endpoint de cotización
4. Mostrar costo de envío en carrito y en resumen de pago

## Aviso interno de ventas

- Las ventas aprobadas por Mercado Pago, OpenPay y transferencia manual ahora disparan un aviso interno al mail configurado en `RESEND_NOTIFY_EMAIL`.
- Si no se define esa variable, el sistema usa `ventas@laperlawines.com.ar` como destino por defecto.
