# Plan de Modificaciones — Rediseño Visual laperlavinos.com

_Fecha inicio: 15 mayo 2026_

---

## Contexto

El cliente solicitó un rediseño visual completo del sitio web. Se recibió un mockup con nueva identidad: tema claro crema/beige, tipografía serif para títulos, navegación completa en el header y nuevas secciones en la home. El panel de administración (rutas `/admin/*`) **no se toca** — mantiene su tema oscuro.

---

## Paleta de Colores (extraída del mockup)

| Variable CSS | Hex | Uso |
|---|---|---|
| `--lp-bg` | `#F5EFE6` | Fondo principal (crema cálido) |
| `--lp-white` | `#FFFFFF` | Header, cards de productos |
| `--lp-text` | `#1A120B` | Texto principal (marrón muy oscuro) |
| `--lp-text-muted` | `#6B5744` | Texto secundario |
| `--lp-text-light` | `#9E8B7A` | Labels, captions |
| `--lp-gold` | `#C9A96E` | Acento dorado |
| `--lp-gold-dark` | `#A68A5C` | Hover / acento dorado oscuro |
| `--lp-border` | `#E8DFD0` | Bordes suaves |
| `--lp-dark` | `#1A120B` | Tiles categorías, botones primarios |
| `--lp-strip` | `#EDE5D8` | PromoStrip fondo |

---

## Tipografía

- **Headings:** Playfair Display (Google Fonts — serif refinada, igual al mockup)
- **Body / UI:** Sans-serif actual (mantener)
- Importar vía `next/font/google` en `layout.tsx`

---

## Plan de Fases

### Fase 0 — Checkpoint pre-rediseño ✅ (pendiente commit)

Commitear todos los archivos sin commit antes de empezar el rediseño.  
Archivos modificados/nuevos sin commit a la fecha:

**Modificados:**
- `src/app/components/CartDrawer.tsx` — retiro/envío, formulario comprador, 3 métodos de pago, cálculo de envío
- `src/app/components/AdminOrdersPanel.tsx` — acciones aprobar/rechazar transferencias, UI optimista, badge pendientes
- `src/app/admin/pedidos/page.tsx` — integración con panel de órdenes actualizado
- `src/app/api/mercadopago/checkout/route.ts` — actualizado con nuevos campos
- `src/app/api/openpay/checkout/route.ts` — actualizado con nuevos campos
- `src/store/useCartStore.ts` — nuevos campos para transferencia
- `src/types/supabase.ts` — todos los nuevos campos: payment_provider, discount_amount, discount_type, notas_internas, openpay_order_uuid

**Nuevos archivos:**
- `src/lib/transferencia.ts` — TRANSFER_DISCOUNT_PCT=10, getBankInfo(), applyTransferDiscount()
- `src/lib/orderEmail.ts` — sendOrderConfirmationEmail(), sendTransferPendingEmail() (requiere RESEND_API_KEY)
- `src/lib/shipping.ts` — getShippingCost(), zonas Patagonia ($20.990) y general ($24.426), umbral envío gratis $190.000
- `src/app/api/admin/orders/[id]/status/route.ts` — PATCH: aprobar→'transferencia_aprobada' / rechazar→'transferencia_rechazada'
- `src/app/api/transferencia/checkout/route.ts` — checkout transferencia, aplica 10% descuento
- `src/app/transferencia/confirmacion/page.tsx` — página post-transferencia con datos bancarios

---

### Fase 1 — Design System (globals.css + fuentes) ✅ COMPLETADA

**Archivos modificados:**
- `src/app/globals.css` — nueva paleta, variables `--lp-*`, body usa `var(--lp-bg)` y `var(--lp-text)`
- `src/app/layout.tsx` — importados Playfair Display + Inter via `next/font/google`, `GeodesicBackground` removido (era dark-only), variables de font aplicadas en `<html>`

**Cambios realizados:**
- CSS variables `:root` → paleta crema (ver tabla arriba)
- Body fondo `#F5EFE6`, texto `#1A120B`
- `--font-playfair` y `--font-sans` disponibles como variables CSS en todo el proyecto

**Condición especial:** Las rutas `/admin/*` usan clases Tailwind hardcodeadas (neutral-900/800/700). NO se tocaron — el admin mantiene tema oscuro por diseño.

---

### Fase 2 — Header ✅ COMPLETADA

**Archivos modificados:**
- `src/app/components/Header.tsx` — rediseño completo
- `src/app/components/ProductList.tsx` — agregado `useSearchParams` para leer `?categoria=` de URL
- `src/app/productos/page.tsx` — envuelto en `<Suspense>`, fondo actualizado a crema, removidas clases dark

**Cambios realizados en Header:**
- Fondo: `bg-white`, borde `border-[#E8DFD0]`, `shadow-sm`
- Logo: cambiado a `LOGOLaPerla.png` (logo oscuro sobre blanco, sin `brightness-0 invert`)
- Navegación desktop: 6 items + **VINOS con sub-menú hover** (dropdown con: Tintos, Blancos, Rosados, Naranjos, Cava)
- Links del nav con grupos exactos de Hermes (`?categoria=VINOS+TINTOS`, `?categoria=WHISKY`, etc.)
- Carrito: icono a la derecha, fondo hover crema, badge negro
- **Hamburger mobile nuevo**: menú desplegable con acordeón para VINOS (expandir/colapsar sub-categorías)

**Cambios en ProductList:**
- Lee `?categoria=` al cargar → pre-filtra productos automáticamente
- `useEffect` sincroniza el filtro cuando el usuario navega entre categorías desde el header

**Notas:**
- Al hacer click en "WHISKYS" → va a `/productos?categoria=WHISKY` → filtra solo whiskies
- Al hacer click en "Vinos tintos" (sub-menú) → `/productos?categoria=VINOS+TINTOS` → filtra tintos
- PromoStrip: ya usa colores de Supabase (`strip_bg_color`, `strip_text_color`) — configurable desde admin sin tocar código

---

### Fase 3 — Home Page (secciones)

**Archivo principal:** `src/app/page.tsx`

Secciones en orden exacto según PDF, con alturas de referencia:

| # | Componente | Altura ref. | Descripción |
|---|---|---|---|
| 1 | `HeroBanner` | libre | Banner promocional full-width. Izquierda: texto grande + botón "Ir a Vinos". Derecha: imagen. Conectar con tabla `banners` de Supabase. |
| 2 | `TrustBar` | 52 px | 3 items: "Envíos a todo el país" · "Pago seguro" · "Atención personalizada por wsp" (tercer item lleva link a WhatsApp) |
| 3 | `CategoryTiles` | 120 px | 3 tiles con foto/logo clickeables: **VINOS** · **WHISKY** · **PARA REGALAR** → llevan a `/productos?categoria=X` |
| 4 | `MasVendidos` | 260 px | Título "LOS MÁS VENDIDOS" + link "ver todos →". Grid de 4 product cards. Requiere flag o selección manual en DB. |
| 5 | `ElElegido` | 200 px | Sección "EL ELEGIDO POR @ELRECOMENDANTE". Layout 50/50: foto producto izq + texto der ("VINO DEL MES · ABRIL / Malbec de altura...") + botón "VER MÁS". Click lleva a categoría especial. |
| 6 | `PorQueLaPerla` | 160 px | 3 columnas diferenciadores: "Curaduría propia" · "Atención personalizada" · "Experiencias". + botón "Empezar el quiz →" al pie (por ahora deshabilitado o scroll a sección quiz) |
| 7 | `VinoDelMes` | 200 px | Sección "VINO DEL MES por bodega destacada". Layout similar a ElElegido. Contenido editorial editable. |
| 8 | `Resenas` | 100 px | 3 testimonios: Carolina M. ★★★★★ / Martín R. ★★★★★ / Lucía F. ★★★★★ — texto hardcodeado inicial |
| 9 | `Newsletter` | libre | "5% OFF en tu primera compra" + "Suscribite y recibí novedades..." + input email + botón "Enviar" |
| 10 | `WineQuiz` | 140 px | **PARA AGREGAR MÁS ADELANTE** (Fase 7). "¿No sabés qué vino llevarte? Respondé 4 preguntas y nuestro sommelier te recomienda 3 botellas." + botón "Empezar el quiz →" |

---

### Fase 4 — Página de Productos (/productos)

**Archivos:**
- `src/app/productos/page.tsx`
- `src/app/components/ProductList.tsx`
- `src/app/components/ProductCard.tsx`
- `src/app/components/CategoryFilter.tsx`

**Cambios:**
- Fondo: `--lp-bg` (antes neutral-900)
- ProductCard: ya tiene fondo blanco, ajustar bordes y sombras
- ProductList: agregar skeleton loading (reemplazar "Cargando productos...")
- CategoryFilter: adaptar a tema claro
- Search bar: se mantiene aquí (no en header)

---

### Fase 5 — Detalle de Producto (/producto/[slug])

**Archivo:** `src/app/producto/[slug]/page.tsx` y componentes

**Cambios:**
- Adaptar fondos y textos a tema claro
- Galería de imágenes

---

### Fase 6 — CartDrawer (estilos)

**Archivo:** `src/app/components/CartDrawer.tsx`

**Nota:** La lógica ya está completa y funcional. Solo ajustar estilos al tema claro.

**Cambios:**
- Drawer fondo: `--lp-white`
- Textos y bordes: nueva paleta
- Botones primarios: `--lp-dark` con texto blanco
- Formulario de envío: adaptar inputs al tema claro

---

### Fase 7 — Wine Quiz (nuevo)

**Nuevo componente:** `src/app/components/WineQuiz.tsx`

Quiz interactivo de recomendación de vinos. Se agrega como sección en la home.  
Lógica: preguntas con opciones → resultado sugiere producto.

---

## Tareas Bloqueadas (esperando cliente/terceros)

| Tarea | Bloqueado por | Variables necesarias |
|---|---|---|
| Datos bancarios para transferencia | Cliente no los proporcionó aún | `TRANSFER_CBU`, `TRANSFER_ALIAS`, `TRANSFER_TITULAR`, `TRANSFER_BANCO` |
| Emails transaccionales | Dominio laperlavinos.com sin verificar en Resend | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_NOTIFY_EMAIL` |
| Envíos Andreani | Sin credenciales del cliente | `ANDREANI_USER`, `ANDREANI_PASSWORD`, `ANDREANI_CLIENT_ID` |

---

## Variables de Entorno Pendientes en Vercel

- `MERCADOPAGO_WEBHOOK_SECRET` — existe pero necesita marcarse como **Sensitive** (primero desmarcar scope Development)
- `SUPABASE_SERVICE_ROLE_KEY` — ídem
- `HERMES_PASSWORD` — ídem

---

## Deuda Técnica Conocida

- 2 errores de lint en `src/app/pago/resultado/ResultadoPago.tsx` (setLoadingSummary dentro de useEffect)
- ~22 warnings de `<img>` sin optimizar (usar `<Image>` de Next.js)
- Sin hamburguer menú en mobile

---

_Última actualización: 15 mayo 2026_
