## Cambios para la web pedidos por clientes - laperlaweb 27/5/26

- Sacar etiqueta de exclusivo a las fotos
- Home: Cuando entras al producto, que primero no se vea la descripción del producto. Solo titulo de producto, precio 
- Búsquedas: aparecen todos los productos. Sacar informacion y que aparezca solo el buscador. Que solo diga tienda.
- Filtros: Faltan agregar más(por bodega eso nose si ya esta en el hermes sino quedara para mas adelante) 
- En la pestañas/categorias del header principales, agregar “otros” y ahi sumar vodka, coñac y brandys, aperitivos, tequila, ron, licores, spirits,cerveza importada, aguas minerales, almaven, regaleria/accesorios(revisar bien el nombre de las categorias/grupos en hermes).
- Cambiar formato de las fotos a 4:5 (están en 1:1)
- Cuando elegís un producto y querer volver - te lleva a la Home y debería volver a la pagina donde estaba o al menos productos.
- Secciones: Sumar y armar la del recomendaste. (Los elegidos del mes) una caja pensada con identidad. Que vaya a una pagina aparte con varios productos.
- Revisar el responsive del banner (la imagen se corta, incluso subiendo la medida recomendada)
- cuando entras a ver el producto (debe ser detalle del producto) que aparezca formas de pago/ envíos
- Agregar buscador en la home, en el header
- Mejorar el formato del texto de la descripcion del producto del detalle del producto. No es posible dejar tabulaciones ni espaciados entre parrafos, queda todo recto

- Mail institucional (se debia de antes): ventas@laperlawines.com.ar
- tambie tengo  el codigo del formulario de mailchip

## Cambios para la web pedidos por clientes - laperlaweb 27/5/26

> Lista original recibida el 27/05/26. Organizada en fases de implementación el mismo día.

---

## PLAN OPERATIVO DE IMPLEMENTACIÓN

### Actualización 30/05/2026 - Reseñas Home (hardcode)

- Se rediseñó el bloque de reseñas de Home con estilo visual tipo Google (sin foto de perfil), manteniendo formato de tarjetas.
- Cada tarjeta ahora muestra: nombre, tiempo de publicación (ej. "hace 2 meses"), calificación en estrellas y texto de reseña.
- Se dejó intencionalmente hardcodeado para esta etapa, listo para migrar a carga manual desde Supabase en el próximo paso.
- Se reemplazaron los textos de ejemplo por 3 reseñas reales compartidas desde Google:
  - Mariana Oyague - 4 estrellas - hace 9 meses
  - Martin Cardena - 4 estrellas - hace 3 anos
  - Daniel Tarayre - 5 estrellas - hace un ano
- Se agregó CTA debajo de las tarjetas: "VER MAS RESENAS EN GOOGLE" con link externo a la ficha del negocio.

### Pendiente para cerrar la seccion de resenas (Supabase)

1) Ejecutar SQL de base
- Archivo: `docs/google-reviews-supabase.sql`
- Incluye:
  - tabla `public.client_reviews`
  - constraint de estrellas `rating between 1 and 5`
  - RLS y politicas
  - carga inicial de 3 resenas

2) Como cargar nuevas resenas manualmente desde Supabase
- Ir a Table Editor -> `client_reviews` -> Insert row
- Campos obligatorios por fila:
  - `author_name`: nombre visible (ej: "Maria Perez")
  - `source_tag`: usar `@Google`
  - `published_ago`: texto corto (ej: "hace 2 meses")
  - `rating`: numero entero de `1` a `5`
  - `review_text`: texto de la resena
- Campos recomendados:
  - `sort_order`: orden manual (1, 2, 3...)
  - `is_active`: `true` para mostrar, `false` para ocultar
  - `source_url`: link directo a la resena en Google (opcional)

3) Reglas de carga para mantener calidad visual
- Mantener textos entre 40 y 180 caracteres para evitar tarjetas desbalanceadas.
- Priorizar resenas de 4 y 5 estrellas para Home.
- Corregir errores ortograficos leves solo si no cambia el sentido del comentario.
- Usar un formato consistente en `published_ago` (ej: "hace 1 mes", "hace 3 anos").

4) Siguiente paso tecnico (cuando se decida)
- Reemplazar `REVIEWS` hardcodeado por fetch server-side desde `client_reviews` y mantener el mismo diseno actual.

### Actualizacion 30/05/2026 - Bloqueo de compra sin stock (Hermes)

Diagnostico confirmado con Workbench:
- `vista_articulos.Stock` existe y es tipo `double`.
- Registros auditados: 2867 filas, `NULL = 0`, numericos = 2867.
- Distribucion: `stock_negativo = 247`, `stock_cero = 746`, `stock_positivo = 1874`.

Implementacion aplicada en web:
- Frontend:
  - Card de producto: boton agregar deshabilitado cuando `stock <= 0` y badge "Sin stock".
  - Detalle de producto: bloqueo de agregar cuando `stock <= 0`, limite de cantidad por stock disponible.
  - Carrito: boton `+` bloqueado al alcanzar stock maximo del item.
- Backend:
  - Checkout MercadoPago/OpenPay/Transferencia valida stock vivo de Hermes por item.
  - Si no hay stock (`<= 0`) o la cantidad supera stock disponible, responde `409` y no genera checkout.
  - Si no se puede validar stock en productos Hermes, se bloquea checkout por seguridad.

Archivos tocados:
- `src/store/useCartStore.ts`
- `src/app/components/ProductCard.tsx`
- `src/app/components/ProductDetail.tsx`
- `src/app/components/ProductList.tsx`
- `src/app/components/CartDrawer.tsx`
- `src/app/api/mercadopago/checkout/route.ts`
- `src/app/api/openpay/checkout/route.ts`
- `src/app/api/transferencia/checkout/route.ts`
- `src/app/producto/[id]/page.tsx`

### FASE 1 — Correcciones rápidas (sin dependencias, bajo riesgo)

- [ ] **1.1** Quitar la etiqueta "Exclusivo" de las tarjetas de producto (aparece cuando el producto no tiene categoría asignada) → `ProductCard.tsx` línea ~59
- [ ] **1.2** Corregir botón "Volver" en el detalle del producto: actualmente lleva al Home, debería volver a la página anterior o a `/productos` → `ProductDetail.tsx` (usar `router.back()` o link fijo a `/productos`)
- [ ] **1.3** Actualizar mail institucional a `ventas@laperlawines.com.ar` en todos los lugares (Footer, emails de pedido, textos legales)
- [ ] **1.4** Mejorar formato del texto de descripción en el detalle del producto: no respeta saltos de línea ni tabs → `ProductDetail.tsx` (aplicar `whitespace-pre-line` o renderizar párrafos)

Fase 1 completa. Resumen de lo aplicado:

1.1 Badge "Exclusivo" eliminado — Ahora en las tarjetas el único badge que aparece es el de % de descuento cuando un producto está en oferta. Sin categorías, sin "Exclusivo"
1.2 Botón "Volver" ahora redirige a /productos como fallback (en vez de Home)
1.3 ventas@laperlawines.com.ar actualizado en 9 archivos: Footer, transferencia, emails de pedido, resultado de pago, newsletter API, y las 3 páginas legales
1.4 Descripción del producto con whitespace-pre-line — respeta saltos de línea y espaciados

---

### FASE 2 — Página de catálogo / Tienda

- [ ] **2.1** Simplificar el encabezado de `/productos`: quitar el texto "Productos", el subtítulo "Encontrá etiquetas, varietales y regalos filtrando por texto..." y el contador "103 visibles de 103". Que solo aparezca el título **"Tienda"** → `ProductList.tsx`

Fase 2 lista. Quedó solo el título "Tienda" — sin el subtítulo descriptivo, sin el contador de productos, sin el label "TIENDA" pequeño arriba. Directo al buscador. 

---

### FASE 3 — Detalle del producto

- [ ] **3.1** Colapsar la descripción por defecto: al entrar mostrar solo **título + precio**. La descripción se expande con botón "Ver más" → `ProductDetail.tsx`
Listo. Saqué la descripción de las cards — ahora muestran solo nombre y precio. El detalle del producto sigue igual con la descripción completa.
- [ ] **3.2** Agregar sección de **formas de pago y envíos** en el detalle del producto (Mercado Pago, Tarjetas, Transferencia; envío a domicilio / retiro en local) → `ProductDetail.tsx`

Listo, sin errores. En el detalle del producto ahora aparece debajo del botón "Añadir al carrito":

Transferencia bancaria con badge "10% OFF" en dorado
Mercado Pago con ícono azul
Tarjetas / Débito con logos de Visa, Mastercard, Amex, Cabal, Naranja
Envío a domicilio (Andreani) con ícono de pin
Retiro en local — Pilmaiquén 292, Bahía Blanca con ícono de local

---

### FASE 4 — Header: buscador y nuevas categorías

- [ ] **4.1** Agregar **buscador en el header**: integrar el componente `SearchBar.tsx` existente dentro de `Header.tsx`
- [ ] **4.2** Agregar categoría **"OTROS"** con dropdown en la navegación del header → `Header.tsx`, ampliar `NAV_ITEMS`. Subcategorías a incluir (verificar nombres exactos en Hermes antes de aplicar):
  - Vodka
  - Coñac y brandys
  - Aperitivos
  - Tequila
  - Ron
  - Licores
  - Spirits
  - Cerveza importada
  - Aguas minerales
  - Almacén
  - Regalería / Accesorios


Sin errores. Esto es lo que quedó implementado:

Header — cambios:

Buscador: ícono de lupa en la barra top. Al hacer click despliega una fila completa debajo del nav con input + botón "Buscar". Escape lo cierra. No satura la barra principal.
Mobile: el menú desplegable ahora abre con un buscador en el tope antes del listado de categorías.
Breakpoint: nav visible desde lg (1024px) en lugar de md (768px) — con 7 ítems en la nav era imposible a 768px.
OTROS: nuevo dropdown con Vodka, Coñac y brandys, Aperitivos, Tequila, Ron, Licores, Spirits, Cervezas importadas, Gaseosas/jugos/aguas, Almacén, Regalería — usando los nombres exactos de Hermes que están en CategoryFilter.
ProductList — cambios:

Lee el param ?q= de la URL al montar para sincronizar el filtro
El SearchBar recibe initialFilters con la query del URL para mostrarla en el input también
Cuando navegás desde el header a /productos?q=malbec, el resultado aparece filtrado automáticamente
---

### FASE 5 — Imágenes y responsive

- [ ] **5.1** Cambiar aspect ratio de las fotos de productos de **1:1 a 4:5** → `ProductCard.tsx` y `ProductDetail.tsx` (clase Tailwind `aspect-[4/5]`)
ProductCard.tsx: aspect-[3/4] (no es 1:1)
ProductDetail.tsx: aspect-square (eso sí es 1:1)
Los cambios necesarios son:

ProductCard: aspect-[3/4] → aspect-[4/5]
ProductDetail: aspect-square → aspect-[4/5]
Listo. Resumen:

ProductCard: aspect-[3/4] → aspect-[4/5] (las tarjetas de la grilla)
ProductDetail: aspect-square (1:1) → aspect-[4/5] (la imagen principal en el detalle)

- [ ] **5.2** Corregir el responsive del **banner**: la imagen se corta incluso con la medida recomendada → `BannerList.tsx` (ajustar `object-position`, `object-fit` y alturas por breakpoint)

- [x] **5.2** Corregir responsive del banner -> COMPLETADO
  - Se ajustó el banner principal para que en mobile no se rompa y en desktop no se vea sobredimensionado.
  - Se eliminó el texto superpuesto del banner en frontend para dejar una pieza visual limpia, solo con imagen.
  - Se quitó del panel admin de banners la sección de carga de texto, ya que dejó de utilizarse en la web.
  - Se unificó la guía de carga para banners en admin con la especificación ya definida:
    - imagen horizontal
    - mínimo 1920 x 800 px
    - formato WebP o JPG
    - peso máximo 800 KB
    - ideal menos de 500 KB
  - Nota operativa: para que el carrusel mantenga una altura consistente, todos los banners deben respetar la misma proporción.



---

### FASE 6 — Filtros adicionales

- [ ] **6.1** Agregar más filtros en `/productos` (ej. rango de precio). **Filtro por bodega: PENDIENTE** — confirmar si el campo "bodega" está disponible en `vista_articulos` de Hermes antes de implementar.

Actualización 29/05/2026:
- El filtro de rango de precio quedó con tope máximo fijo en $2.000.000 para evitar escalas irreales en la vinoteca.


NO EXISTEN TALES FILTROS/CATEGORIAS EN EL SISTEMA DE HERMES

---

### FASE 7 — Integración Mailchimp (newsletter)

- [x] **7.1** Integrar el formulario embed de Mailchimp en `Newsletter.tsx` (reemplaza la lógica actual de suscripción a Supabase).
  - Se integró el formulario con el `action` oficial de Mailchimp y campos `EMAIL`, `FNAME`, `PHONE`, `tags` y honeypot.
  - **Nota:** Mailchimp (campañas/suscripciones) y Resend (emails transaccionales de pedidos) son **complementarios**, no excluyentes. Se pueden usar los dos a la vez.

---

### APLAZADOS / Sin fecha definida

- **Filtro por bodega**: cuando se confirme disponibilidad del campo en Hermes.
- **Sección "Los elegidos del mes"**: grilla de varios productos recomendados con página propia `/recomendados`. Al retomar: nueva sección home con identidad propia, grilla de 4-6 productos gestionable desde admin Secciones, con link a página propia.

---

## Lista original (referencia cruzada)

- Sacar etiqueta de exclusivo a las fotos → **Fase 1.1**
- Al entrar al producto no ver descripción, solo título y precio → **Fase 3.1**
- Búsquedas: sacar información, que solo diga "Tienda" → **Fase 2.1**
- Filtros: faltan más (por bodega pendiente Hermes) → **Fase 6.1**
- Header: agregar "Otros" con vodka, coñac, aperitivos, tequila, ron, licores, etc. → **Fase 4.2**
- Cambiar formato de fotos a 4:5 → **Fase 5.1**
- Al volver desde el producto te lleva al Home → **Fase 1.2**
- Sección "Los elegidos del mes" con página propia → **Aplazado**
- Responsive del banner (imagen se corta) → **Fase 5.2**
- Detalle del producto: mostrar formas de pago/envíos → **Fase 3.2**
- Agregar buscador en la home / header → **Fase 4.1**
- Mejorar formato del texto de descripción → **Fase 1.4**
- Mail institucional ventas@laperlawines.com.ar → **Fase 1.3**
- Formulario Mailchimp → **Fase 7.1**



## CODIGO DE EMBEBIDO DE MAILCHIMP:

<div id="mc_embed_shell">
      <link href="//cdn-images.mailchimp.com/embedcode/classic-061523.css" rel="stylesheet" type="text/css">
  <style type="text/css">
        #mc_embed_signup{background:#fff; false;clear:left; font:14px Helvetica,Arial,sans-serif; width: 600px;}
        /* Add your own Mailchimp form style overrides in your site stylesheet or in this style block.
           We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
</style>
<div id="mc_embed_signup">
    <form action="https://gmail.us18.list-manage.com/subscribe/post?u=d6bb58c7ea5715dda59bc311c&amp;id=63dca8231f&amp;f_id=0013aee6f0" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank">
        <div id="mc_embed_signup_scroll"><h2>Sumate a nuestro Newsletter</h2>
            <div class="indicates-required"><span class="asterisk">*</span> indica que es obligatorio</div>
            <div class="mc-field-group"><label for="mce-EMAIL">Dirección de correo electrónico <span class="asterisk">*</span></label><input type="email" name="EMAIL" class="required email" id="mce-EMAIL" required="" value=""></div><div class="mc-field-group"><label for="mce-FNAME">Nombre </label><input type="text" name="FNAME" class=" text" id="mce-FNAME" value=""></div><div class="mc-field-group"><label for="mce-PHONE">Número de teléfono </label><input type="text" name="PHONE" class="REQ_CSS" id="mce-PHONE" value=""></div>
<div hidden=""><input type="hidden" name="tags" value="3076534"></div>
        <div id="mce-responses" class="clear">
            <div class="response" id="mce-error-response" style="display: none;"></div>
            <div class="response" id="mce-success-response" style="display: none;"></div>
        </div><div aria-hidden="true" style="position: absolute; left: -5000px;"><input type="text" name="b_d6bb58c7ea5715dda59bc311c_63dca8231f" tabindex="-1" value=""></div><div class="clear"><input type="submit" name="subscribe" id="mc-embedded-subscribe" class="button" value="Subscribe"></div>
    </div>
</form>
</div>
<script type="text/javascript" src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"></script><script type="text/javascript">(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[4]='PHONE';ftypes[4]='phone';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[5]='BIRTHDAY';ftypes[5]='birthday';fnames[6]='COMPANY';ftypes[6]='text';fnames[7]='MMERGE7';ftypes[7]='text';}(jQuery));var $mcj = jQuery.noConflict(true);
    // SMS Phone Multi-Country Functionality
    if(!window.MC) {
      window.MC = {};
    }
    window.MC.smsPhoneData = {
      defaultCountryCode: 'AR',
      programs: [],
      smsProgramDataCountryNames: []
    };

    function getCountryUnicodeFlag(countryCode) {
       return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    };

    // HTML sanitization function to prevent XSS
    function sanitizeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // URL sanitization function to prevent javascript: and data: URLs
    function sanitizeUrl(url) {
      if (typeof url !== 'string') return '';
      const trimmedUrl = url.trim().toLowerCase();
      if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('vbscript:')) {
        return '#';
      }
      return url;
    }

    const getBrowserLanguage = () => {
      if (!window?.navigator?.language?.split('-')[1]) {
        return window?.navigator?.language?.toUpperCase();
      }
      return window?.navigator?.language?.split('-')[1];
    };

    
    function getDefaultCountryProgram(defaultCountryCode, smsProgramData) {
      if (!smsProgramData || smsProgramData.length === 0) {
        return null;
      }

      const browserLanguage = getBrowserLanguage();

      if (browserLanguage) {
        const foundProgram = smsProgramData.find(
          (program) => program?.countryCode === browserLanguage,
        );
        if (foundProgram) {
          return foundProgram;
        }
      }

      if (defaultCountryCode) {
        const foundProgram = smsProgramData.find(
          (program) => program?.countryCode === defaultCountryCode,
        );
        if (foundProgram) {
          return foundProgram;
        }
      }

      return smsProgramData[0];
    }

    function updateSmsLegalText(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }
      
      const programs = window?.MC?.smsPhoneData?.programs;
      if (!programs || !Array.isArray(programs)) {
        return;
      }
      
      const program = programs.find(program => program?.countryCode === countryCode);
      if (!program || !program.requiredTemplate) {
        return;
      }
    
      
      var smsConsentHtmlRenderingFixEnabled = true;
      
      const legalTextElement = document.querySelector('#legal-text-' + fieldName);
      if (!legalTextElement) {
        return;
      }
      
      const divRegex = new RegExp('</?[div][^>]*>', 'gi');
      const blockWrapperRegex = new RegExp('</?(?:div|p)[^>]*>', 'gi');
      const fullAnchorRegex = new RegExp('<a.*?</a>', 'g');
      const anchorRegex = new RegExp('<a href="(.*?)" target="(.*?)">(.*?)</a>');
      
      const template = smsConsentHtmlRenderingFixEnabled
        ? program.requiredTemplate
            .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
            .replace(blockWrapperRegex, '')
        : program.requiredTemplate.replace(divRegex, '');
      
      

      legalTextElement.textContent = '';
      const parts = template.split(/(<a href=".*?" target=".*?">.*?<\/a>)/g);
      parts.forEach(function(part) {
        if (!part) {
          return;
        }
        const anchorMatch = part.match(/<a href="(.*?)" target="(.*?)">(.*?)<\/a>/);
        if (anchorMatch) {
          const linkElement = document.createElement('a');
          linkElement.href = sanitizeUrl(anchorMatch[1]);
          linkElement.target = sanitizeHtml(anchorMatch[2]);
          linkElement.textContent = sanitizeHtml(anchorMatch[3]);
          legalTextElement.appendChild(linkElement);
        } else {
          legalTextElement.appendChild(document.createTextNode(part));
        }
      });
          
    }

    function generateDropdownOptions(smsProgramData) {
      if (!smsProgramData || smsProgramData.length === 0) {
        return '';
      }

      var programs = false
        ? smsProgramData.filter(function(p, i, arr) {
            return arr.findIndex(function(q) { return q.countryCode === p.countryCode; }) === i;
          })
        : smsProgramData;
      
      return programs.map(program => {
        const flag = getCountryUnicodeFlag(program.countryCode);
        const countryName = getCountryName(program.countryCode);
        const callingCode = program.countryCallingCode || '';
        // Sanitize all values to prevent XSS
        const sanitizedCountryCode = sanitizeHtml(program.countryCode || '');
        const sanitizedCountryName = sanitizeHtml(countryName || '');
        const sanitizedCallingCode = sanitizeHtml(callingCode || '');
        return '<option value="' + sanitizedCountryCode + '">' + sanitizedCountryName + ' ' + sanitizedCallingCode + '</option>';
      }).join('');
    }

    function getCountryName(countryCode) {
      if (window.MC?.smsPhoneData?.smsProgramDataCountryNames && Array.isArray(window.MC.smsPhoneData.smsProgramDataCountryNames)) {
        for (let i = 0; i < window.MC.smsPhoneData.smsProgramDataCountryNames.length; i++) {
          if (window.MC.smsPhoneData.smsProgramDataCountryNames[i].code === countryCode) {
            return window.MC.smsPhoneData.smsProgramDataCountryNames[i].name;
          }
        }
      }
      return countryCode;
    }

    function getDefaultPlaceholder(countryCode) {
      if (!countryCode || typeof countryCode !== 'string') {
        return '+1 000 000 0000'; // Default US placeholder
      }
      
            var mockPlaceholders = [
        {
          countryCode: 'US',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the US country code +1 before the phone number',
        },
        {
          countryCode: 'GB',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GB country code +44 before the phone number',
        },
        {
          countryCode: 'CA',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the CA country code +1 before the phone number',
        },
        {
          countryCode: 'AU',
          placeholder: '+61 000 000 000',
          helpText: 'Include the AU country code +61 before the phone number',
        },
        {
          countryCode: 'DE',
          placeholder: '+49 000 0000000',
          helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
        },
        {
          countryCode: 'FR',
          placeholder: '+33 0 00 00 00 00',
          helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
        },
        {
          countryCode: 'ES',
          placeholder: '+34 000 000 000',
          helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
        },
        {
          countryCode: 'NL',
          placeholder: '+31 0 00000000',
          helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
        },
        {
          countryCode: 'BE',
          placeholder: '+32 000 00 00 00',
          helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
        },
        {
          countryCode: 'CH',
          placeholder: '+41 00 000 00 00',
          helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
        },
        {
          countryCode: 'AT',
          placeholder: '+43 000 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
        },
        {
          countryCode: 'IE',
          placeholder: '+353 00 000 0000',
          helpText: 'Include the IE country code +353 before the phone number',
        },
        {
          countryCode: 'IT',
          placeholder: '+39 000 000 0000',
          helpText: 'Includere il prefisso internazionale IT +39 prima del numero di telefono',
        },
        {
          countryCode: 'NO',
          placeholder: '+47 000 00 000',
          helpText: 'Inkluder NO landskode +47 før telefonnummeret',
        },
        {
          countryCode: 'SE',
          placeholder: '+46 00 000 00 00',
          helpText: 'Inkludera SE landskod +46 före telefonnumret',
        },
        {
          countryCode: 'DK',
          placeholder: '+45 00 00 00 00',
          helpText: 'Inkluder DK landekode +45 før telefonnummeret',
        },
        {
          countryCode: 'FI',
          placeholder: '+358 00 000 0000',
          helpText: 'Sisällytä FI-maakoodi +358 ennen puhelinnumeroa',
        },
        {
          countryCode: 'EE',
          placeholder: '+372 0000 0000',
          helpText: 'Lisage EE riigikood +372 telefoninumbri ette',
        },
        {
          countryCode: 'PL',
          placeholder: '+48 000 000 000',
          helpText: 'Podaj numer kierunkowy PL +48 przed numerem telefonu',
        },
        {
          countryCode: 'SK',
          placeholder: '+421 000 000 000',
          helpText: 'Pred telefónne číslo uveďte kód krajiny SK +421',
        },
        {
          countryCode: 'LV',
          placeholder: '+371 0000 0000',
          helpText: 'Iekļaujiet LV valsts kodu +371 pirms tālruņa numura',
        },
        {
          countryCode: 'LT',
          placeholder: '+370 0000 0000',
          helpText: 'Įtraukite LT šalies kodą +370 prieš telefono numerį',
        },
        {
          countryCode: 'GR',
          placeholder: '+30 000 000 0000',
          helpText: 'Συμπεριλάβετε τον κωδικό χώρας GR +30 πριν από τον αριθμό τηλεφώνου',
        },
        {
          countryCode: 'PT',
          placeholder: '+351 000 000 000',
          helpText: 'Inclua o código de país PT +351 antes do número de telefone',
        },
        {
          countryCode: 'HR',
          placeholder: '+385 00 000 0000',
          helpText: 'Uključite HR pozivni broj države +385 prije telefonskog broja',
        },
        {
          countryCode: 'SI',
          placeholder: '+386 00 000 000',
          helpText: 'Vključite SI kodo države +386 pred telefonsko številko',
        },
        {
          countryCode: 'IS',
          placeholder: '+354 000 0000',
          helpText: 'Láttu IS landsnúmer +354 fylgja á undan símanúmerinu',
        },
        {
          countryCode: 'LU',
          placeholder: '+352 000 000 000',
          helpText: 'Incluez le code pays LU +352 avant le numéro de téléphone',
        },
        {
          countryCode: 'MC',
          placeholder: '+377 00 00 00 00',
          helpText: 'Incluez le code pays MC +377 avant le numéro de téléphone',
        },
        {
          countryCode: 'AD',
          placeholder: '+376 000 000',
          helpText: 'Incloeu el codi de país AD +376 abans del número de telèfon',
        },
        {
          countryCode: 'JE',
          placeholder: '+44 0000 000000',
          helpText: 'Include the JE country code +44 before the phone number',
        },
        {
          countryCode: 'IM',
          placeholder: '+44 0000 000000',
          helpText: 'Include the IM country code +44 before the phone number',
        },
        {
          countryCode: 'GG',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GG country code +44 before the phone number',
        },
        {
          countryCode: 'AL',
          placeholder: '+355 00 000 0000',
          helpText: 'Përfshini kodin e vendit AL +355 para numrit të telefonit',
        },
        {
          countryCode: 'SM',
          placeholder: '+378 0000 000000',
          helpText: 'Includere il prefisso internazionale SM +378 prima del numero di telefono',
        },
        {
          countryCode: 'FO',
          placeholder: '+298 000000',
          helpText: 'Inkluder FO landekode +298 før telefonnummeret',
        },
        {
          countryCode: 'MT',
          placeholder: '+356 0000 0000',
          helpText: 'Include the MT country code +356 before the phone number',
        },
        {
          countryCode: 'LI',
          placeholder: '+423 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die LI-Ländervorwahl +423 ein',
        },
        {
          countryCode: 'GI',
          placeholder: '+350 000 00000',
          helpText: 'Include the GI country code +350 before the phone number',
        },
        {
          countryCode: 'MD',
          placeholder: '+373 00 000 000',
          helpText: 'Includeți codul de țară MD +373 înaintea numărului de telefon',
        },
        {
          countryCode: 'HU',
          placeholder: '+36 00 000 0000',
          helpText: 'A telefonszám előtt adja meg a HU országkódot +36',
        },
        {
          countryCode: 'NZ',
          placeholder: '+64 00 000 0000',
          helpText: 'Include the NZ country code +64 before the phone number',
        },
        {
          countryCode: 'ME',
          placeholder: '+382 00 000 000',
          helpText: 'Uključite ME pozivni broj države +382 prije telefonskog broja',
        },
      ];

      const selectedPlaceholder = mockPlaceholders.find(function(item) {
        return item && item.countryCode === countryCode;
      });
      
      return selectedPlaceholder ? selectedPlaceholder.placeholder : mockPlaceholders[0].placeholder;
    }

    function updatePlaceholder(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }
      
      const phoneInput = document.querySelector('#mce-' + fieldName);
      if (!phoneInput) {
        return;
      }
      
      const placeholder = getDefaultPlaceholder(countryCode);
      if (placeholder) {
        phoneInput.placeholder = placeholder;
      }
    }

    function updateCountryCodeInstruction(countryCode, fieldName) {
      updatePlaceholder(countryCode, fieldName);
      
    }

    function getDefaultHelpText(countryCode) {
      var mockPlaceholders = [
        {
          countryCode: 'US',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the US country code +1 before the phone number',
        },
        {
          countryCode: 'GB',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GB country code +44 before the phone number',
        },
        {
          countryCode: 'CA',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the CA country code +1 before the phone number',
        },
        {
          countryCode: 'AU',
          placeholder: '+61 000 000 000',
          helpText: 'Include the AU country code +61 before the phone number',
        },
        {
          countryCode: 'DE',
          placeholder: '+49 000 0000000',
          helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
        },
        {
          countryCode: 'FR',
          placeholder: '+33 0 00 00 00 00',
          helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
        },
        {
          countryCode: 'ES',
          placeholder: '+34 000 000 000',
          helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
        },
        {
          countryCode: 'NL',
          placeholder: '+31 0 00000000',
          helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
        },
        {
          countryCode: 'BE',
          placeholder: '+32 000 00 00 00',
          helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
        },
        {
          countryCode: 'CH',
          placeholder: '+41 00 000 00 00',
          helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
        },
        {
          countryCode: 'AT',
          placeholder: '+43 000 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
        },
        {
          countryCode: 'IE',
          placeholder: '+353 00 000 0000',
          helpText: 'Include the IE country code +353 before the phone number',
        },
        {
          countryCode: 'IT',
          placeholder: '+39 000 000 0000',
          helpText: 'Includere il prefisso internazionale IT +39 prima del numero di telefono',
        },
        {
          countryCode: 'NO',
          placeholder: '+47 000 00 000',
          helpText: 'Inkluder NO landskode +47 før telefonnummeret',
        },
        {
          countryCode: 'SE',
          placeholder: '+46 00 000 00 00',
          helpText: 'Inkludera SE landskod +46 före telefonnumret',
        },
        {
          countryCode: 'DK',
          placeholder: '+45 00 00 00 00',
          helpText: 'Inkluder DK landekode +45 før telefonnummeret',
        },
        {
          countryCode: 'FI',
          placeholder: '+358 00 000 0000',
          helpText: 'Sisällytä FI-maakoodi +358 ennen puhelinnumeroa',
        },
        {
          countryCode: 'EE',
          placeholder: '+372 0000 0000',
          helpText: 'Lisage EE riigikood +372 telefoninumbri ette',
        },
        {
          countryCode: 'PL',
          placeholder: '+48 000 000 000',
          helpText: 'Podaj numer kierunkowy PL +48 przed numerem telefonu',
        },
        {
          countryCode: 'SK',
          placeholder: '+421 000 000 000',
          helpText: 'Pred telefónne číslo uveďte kód krajiny SK +421',
        },
        {
          countryCode: 'LV',
          placeholder: '+371 0000 0000',
          helpText: 'Iekļaujiet LV valsts kodu +371 pirms tālruņa numura',
        },
        {
          countryCode: 'LT',
          placeholder: '+370 0000 0000',
          helpText: 'Įtraukite LT šalies kodą +370 prieš telefono numerį',
        },
        {
          countryCode: 'GR',
          placeholder: '+30 000 000 0000',
          helpText: 'Συμπεριλάβετε τον κωδικό χώρας GR +30 πριν από τον αριθμό τηλεφώνου',
        },
        {
          countryCode: 'PT',
          placeholder: '+351 000 000 000',
          helpText: 'Inclua o código de país PT +351 antes do número de telefone',
        },
        {
          countryCode: 'HR',
          placeholder: '+385 00 000 0000',
          helpText: 'Uključite HR pozivni broj države +385 prije telefonskog broja',
        },
        {
          countryCode: 'SI',
          placeholder: '+386 00 000 000',
          helpText: 'Vključite SI kodo države +386 pred telefonsko številko',
        },
        {
          countryCode: 'IS',
          placeholder: '+354 000 0000',
          helpText: 'Láttu IS landsnúmer +354 fylgja á undan símanúmerinu',
        },
        {
          countryCode: 'LU',
          placeholder: '+352 000 000 000',
          helpText: 'Incluez le code pays LU +352 avant le numéro de téléphone',
        },
        {
          countryCode: 'MC',
          placeholder: '+377 00 00 00 00',
          helpText: 'Incluez le code pays MC +377 avant le numéro de téléphone',
        },
        {
          countryCode: 'AD',
          placeholder: '+376 000 000',
          helpText: 'Incloeu el codi de país AD +376 abans del número de telèfon',
        },
        {
          countryCode: 'JE',
          placeholder: '+44 0000 000000',
          helpText: 'Include the JE country code +44 before the phone number',
        },
        {
          countryCode: 'IM',
          placeholder: '+44 0000 000000',
          helpText: 'Include the IM country code +44 before the phone number',
        },
        {
          countryCode: 'GG',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GG country code +44 before the phone number',
        },
        {
          countryCode: 'AL',
          placeholder: '+355 00 000 0000',
          helpText: 'Përfshini kodin e vendit AL +355 para numrit të telefonit',
        },
        {
          countryCode: 'SM',
          placeholder: '+378 0000 000000',
          helpText: 'Includere il prefisso internazionale SM +378 prima del numero di telefono',
        },
        {
          countryCode: 'FO',
          placeholder: '+298 000000',
          helpText: 'Inkluder FO landekode +298 før telefonnummeret',
        },
        {
          countryCode: 'MT',
          placeholder: '+356 0000 0000',
          helpText: 'Include the MT country code +356 before the phone number',
        },
        {
          countryCode: 'LI',
          placeholder: '+423 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die LI-Ländervorwahl +423 ein',
        },
        {
          countryCode: 'GI',
          placeholder: '+350 000 00000',
          helpText: 'Include the GI country code +350 before the phone number',
        },
        {
          countryCode: 'MD',
          placeholder: '+373 00 000 000',
          helpText: 'Includeți codul de țară MD +373 înaintea numărului de telefon',
        },
        {
          countryCode: 'HU',
          placeholder: '+36 00 000 0000',
          helpText: 'A telefonszám előtt adja meg a HU országkódot +36',
        },
        {
          countryCode: 'NZ',
          placeholder: '+64 00 000 0000',
          helpText: 'Include the NZ country code +64 before the phone number',
        },
        {
          countryCode: 'ME',
          placeholder: '+382 00 000 000',
          helpText: 'Uključite ME pozivni broj države +382 prije telefonskog broja',
        },
      ];
      
      if (!countryCode || typeof countryCode !== 'string') {
        return mockPlaceholders[0].helpText;
      }
      
      const selectedHelpText = mockPlaceholders.find(function(item) {
          return item && item.countryCode === countryCode;
        });
        
        return selectedHelpText ? selectedHelpText.helpText : mockPlaceholders[0].helpText;
    }

    function setDefaultHelpText(countryCode) {
      const helpTextSpan = document.querySelector('#help-text');
      if (!helpTextSpan) {
        return;
      }

        
    }

    function updateHelpTextCountryCode(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }
      
      setDefaultHelpText(countryCode);
    }

    function initializeSmsPhoneDropdown(fieldName) {
      if (!fieldName || typeof fieldName !== 'string') {
        return;
      }
      
      const dropdown = document.querySelector('#country-select-' + fieldName);
      const displayFlag = document.querySelector('#flag-display-' + fieldName);
      
      if (!dropdown || !displayFlag) {
        return;
      }

      const smsPhoneData = window.MC?.smsPhoneData;
      if (smsPhoneData && smsPhoneData.programs && Array.isArray(smsPhoneData.programs)) {
        dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
      }

      const defaultProgram = getDefaultCountryProgram(smsPhoneData?.defaultCountryCode, smsPhoneData?.programs);
      if (defaultProgram && defaultProgram.countryCode) {
        dropdown.value = defaultProgram.countryCode;
        
        const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
        if (flagSpan) {
          flagSpan.textContent = getCountryUnicodeFlag(defaultProgram.countryCode);
          flagSpan.setAttribute('aria-label', sanitizeHtml(defaultProgram.countryCode) + ' flag');
        }
        
        updateSmsLegalText(defaultProgram.countryCode, fieldName);
        updatePlaceholder(defaultProgram.countryCode, fieldName);
        updateCountryCodeInstruction(defaultProgram.countryCode, fieldName);
      }

     
      var smsNotRequiredRemoveCountryCodeEnabled = true;
      var smsField = Object.values({"EMAIL":{"name":"EMAIL","label":"Dirección de correo electrónico","helper_text":"","type":"email","required":true,"audience_field_name":"Dirección de correo electrónico","merge_id":0,"help_text_enabled":false,"enabled":true,"order":0,"field_type":"merge"},"FNAME":{"name":"FNAME","label":"Nombre","helper_text":"","type":"text","required":false,"audience_field_name":"Nombre","merge_id":1,"help_text_enabled":false,"enabled":true,"order":1,"field_type":"merge"},"PHONE":{"name":"PHONE","label":"Número de teléfono","helper_text":"","type":"phone","required":false,"audience_field_name":"Número de teléfono","phoneformat":"","merge_id":4,"help_text_enabled":false,"enabled":true,"order":2,"field_type":"merge"},"LNAME":{"name":"LNAME","label":"Apellidos","helper_text":"","type":"text","required":false,"audience_field_name":"Apellidos","enabled":false,"order":null,"field_type":"merge","merge_id":2},"ADDRESS":{"name":"ADDRESS","label":"Dirección","helper_text":"","type":"address","required":false,"audience_field_name":"Dirección","enabled":false,"order":null,"field_type":"merge","merge_id":3,"countries":{"2":"Albania","3":"Algeria","4":"Andorra","5":"Angola","6":"Argentina","7":"Armenia","8":"Australia","9":"Austria","10":"Azerbaijan","11":"Bahamas","12":"Bahrain","13":"Bangladesh","14":"Barbados","15":"Belarus","16":"Belgium","17":"Belize","18":"Benin","19":"Bermuda","20":"Bhutan","21":"Bolivia","22":"Bosnia and Herzegovina","23":"Botswana","24":"Brazil","25":"Bulgaria","26":"Burkina Faso","27":"Burundi","28":"Cambodia","29":"Cameroon","30":"Canada","31":"Cape Verde","32":"Cayman Islands","33":"Central African Republic","34":"Chad","35":"Chile","36":"China","37":"Colombia","38":"Congo","40":"Croatia","41":"Cyprus","42":"Czech Republic","43":"Denmark","44":"Djibouti","45":"Ecuador","46":"Egypt","47":"El Salvador","48":"Equatorial Guinea","49":"Eritrea","50":"Estonia","51":"Ethiopia","52":"Fiji","53":"Finland","54":"France","56":"Gabon","57":"Gambia","58":"Georgia","59":"Germany","60":"Ghana","61":"Greece","62":"Guam","63":"Guinea","64":"Guinea-Bissau","65":"Guyana","66":"Honduras","67":"Hong Kong","68":"Hungary","69":"Iceland","70":"India","71":"Indonesia","74":"Ireland","75":"Israel","76":"Italy","78":"Japan","79":"Jordan","80":"Kazakhstan","81":"Kenya","82":"Kuwait","83":"Kyrgyzstan","84":"Lao People's Democratic Republic","85":"Latvia","86":"Lebanon","87":"Lesotho","88":"Liberia","90":"Liechtenstein","91":"Lithuania","92":"Luxembourg","93":"Macedonia","94":"Madagascar","95":"Malawi","96":"Malaysia","97":"Maldives","98":"Mali","99":"Malta","100":"Mauritania","101":"Mexico","102":"Moldova","103":"Monaco","104":"Mongolia","105":"Morocco","106":"Mozambique","107":"Namibia","108":"Nepal","109":"Netherlands","110":"Netherlands Antilles","111":"New Zealand","112":"Nicaragua","113":"Niger","114":"Nigeria","116":"Norway","117":"Oman","118":"Pakistan","119":"Panama","120":"Paraguay","121":"Peru","122":"Philippines","123":"Poland","124":"Portugal","126":"Qatar","127":"Reunion","128":"Romania","129":"Russia","130":"Rwanda","132":"Samoa (Independent)","133":"Saudi Arabia","134":"Senegal","135":"Seychelles","136":"Sierra Leone","137":"Singapore","138":"Slovakia","139":"Slovenia","140":"Somalia","141":"South Africa","142":"South Korea","143":"Spain","144":"Sri Lanka","146":"Suriname","147":"Swaziland","148":"Sweden","149":"Switzerland","152":"Taiwan","153":"Tanzania","154":"Thailand","155":"Togo","156":"Tunisia","157":"Turkiye","158":"Turkmenistan","159":"Uganda","161":"Ukraine","162":"United Arab Emirates","163":"Uruguay","164":"USA","165":"Uzbekistan","166":"Vatican City State (Holy See)","167":"Venezuela","168":"Vietnam","169":"Virgin Islands (British)","170":"Yemen","173":"Zambia","174":"Zimbabwe","175":"Antigua And Barbuda","176":"Anguilla","178":"American Samoa","179":"Aruba","180":"Brunei Darussalam","181":"Bouvet Island","183":"Cook Islands","185":"Christmas Island","187":"Dominican Republic","188":"Western Sahara","189":"Falkland Islands","191":"Faroe Islands","192":"Grenada","193":"French Guiana","194":"Gibraltar","195":"Greenland","196":"Guadeloupe","198":"Guatemala","200":"Haiti","202":"Jamaica","203":"Kiribati","204":"Comoros","205":"Saint Kitts and Nevis","206":"Saint Lucia","207":"Marshall Islands","208":"Macau","210":"Martinique","212":"Mauritius","213":"New Caledonia","214":"Norfolk Island","215":"Nauru","217":"Niue","219":"Papua New Guinea","221":"Pitcairn","222":"Palau","223":"Solomon Islands","225":"Svalbard and Jan Mayen Islands","227":"San Marino","232":"Tonga","233":"Timor-Leste","234":"Trinidad and Tobago","235":"Tuvalu","237":"Saint Vincent and the Grenadines","238":"Virgin Islands (U.S.)","239":"Vanuatu","241":"Mayotte","242":"Myanmar","255":"Sao Tome and Principe","257":"South Georgia and the South Sandwich Islands","260":"Tajikistan","262":"United Kingdom","268":"Costa Rica","270":"Guernsey","272":"North Korea","274":"Afghanistan","275":"Cote D'Ivoire","276":"Cuba","277":"French Polynesia","278":"Iran","279":"Iraq","281":"Libya","282":"Palestine","285":"Syria","286":"Aaland Islands","287":"Turks & Caicos Islands","288":"Jersey  (Channel Islands)","289":"Dominica","290":"Montenegro","293":"Sudan","294":"Montserrat","298":"Curacao","302":"Sint Maarten","311":"South Sudan","315":"Republic of Kosovo","318":"Congo, Democratic Republic of the","323":"Isle of Man","324":"Saint Martin","325":"Bonaire, Saint Eustatius and Saba","326":"Serbia","327":"Saint Barthelemy"},"defaultcountry":164},"BIRTHDAY":{"name":"BIRTHDAY","label":"Birthday","helper_text":"","type":"birthday","required":false,"audience_field_name":"Birthday","dateformat":"MM/DD","enabled":false,"order":null,"field_type":"merge","merge_id":5},"COMPANY":{"name":"COMPANY","label":"Company","helper_text":"","type":"text","required":false,"audience_field_name":"Company","enabled":false,"order":null,"field_type":"merge","merge_id":6},"MMERGE7":{"name":"MMERGE7","label":"Full Name","helper_text":"","type":"text","required":false,"audience_field_name":"Full Name","enabled":false,"order":null,"field_type":"merge","merge_id":7}}).find(function(f) { return f.name === fieldName && f.type === 'smsphone'; });
      var isRequired = smsField ? smsField.required : false;
      var shouldAppendCountryCode = smsNotRequiredRemoveCountryCodeEnabled ? isRequired : true;
      
      var phoneInput = document.querySelector('#mce-' + fieldName);
      if (phoneInput && defaultProgram.countryCallingCode && shouldAppendCountryCode) {
        phoneInput.value = defaultProgram.countryCallingCode;
      }
      


      displayFlag?.addEventListener('click', function(e) {
        dropdown.focus();
      });


      dropdown?.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        if (!selectedCountry || typeof selectedCountry !== 'string') {
          return;
        }
        
        const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
        if (flagSpan) {
          flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
          flagSpan.setAttribute('aria-label', sanitizeHtml(selectedCountry) + ' flag');
        }

         
        const selectedProgram = window.MC?.smsPhoneData?.programs.find(function(program) {
          return program && program.countryCode === selectedCountry;
        });

        var smsNotRequiredRemoveCountryCodeEnabled = true;
        var smsField = Object.values({"EMAIL":{"name":"EMAIL","label":"Dirección de correo electrónico","helper_text":"","type":"email","required":true,"audience_field_name":"Dirección de correo electrónico","merge_id":0,"help_text_enabled":false,"enabled":true,"order":0,"field_type":"merge"},"FNAME":{"name":"FNAME","label":"Nombre","helper_text":"","type":"text","required":false,"audience_field_name":"Nombre","merge_id":1,"help_text_enabled":false,"enabled":true,"order":1,"field_type":"merge"},"PHONE":{"name":"PHONE","label":"Número de teléfono","helper_text":"","type":"phone","required":false,"audience_field_name":"Número de teléfono","phoneformat":"","merge_id":4,"help_text_enabled":false,"enabled":true,"order":2,"field_type":"merge"},"LNAME":{"name":"LNAME","label":"Apellidos","helper_text":"","type":"text","required":false,"audience_field_name":"Apellidos","enabled":false,"order":null,"field_type":"merge","merge_id":2},"ADDRESS":{"name":"ADDRESS","label":"Dirección","helper_text":"","type":"address","required":false,"audience_field_name":"Dirección","enabled":false,"order":null,"field_type":"merge","merge_id":3,"countries":{"2":"Albania","3":"Algeria","4":"Andorra","5":"Angola","6":"Argentina","7":"Armenia","8":"Australia","9":"Austria","10":"Azerbaijan","11":"Bahamas","12":"Bahrain","13":"Bangladesh","14":"Barbados","15":"Belarus","16":"Belgium","17":"Belize","18":"Benin","19":"Bermuda","20":"Bhutan","21":"Bolivia","22":"Bosnia and Herzegovina","23":"Botswana","24":"Brazil","25":"Bulgaria","26":"Burkina Faso","27":"Burundi","28":"Cambodia","29":"Cameroon","30":"Canada","31":"Cape Verde","32":"Cayman Islands","33":"Central African Republic","34":"Chad","35":"Chile","36":"China","37":"Colombia","38":"Congo","40":"Croatia","41":"Cyprus","42":"Czech Republic","43":"Denmark","44":"Djibouti","45":"Ecuador","46":"Egypt","47":"El Salvador","48":"Equatorial Guinea","49":"Eritrea","50":"Estonia","51":"Ethiopia","52":"Fiji","53":"Finland","54":"France","56":"Gabon","57":"Gambia","58":"Georgia","59":"Germany","60":"Ghana","61":"Greece","62":"Guam","63":"Guinea","64":"Guinea-Bissau","65":"Guyana","66":"Honduras","67":"Hong Kong","68":"Hungary","69":"Iceland","70":"India","71":"Indonesia","74":"Ireland","75":"Israel","76":"Italy","78":"Japan","79":"Jordan","80":"Kazakhstan","81":"Kenya","82":"Kuwait","83":"Kyrgyzstan","84":"Lao People's Democratic Republic","85":"Latvia","86":"Lebanon","87":"Lesotho","88":"Liberia","90":"Liechtenstein","91":"Lithuania","92":"Luxembourg","93":"Macedonia","94":"Madagascar","95":"Malawi","96":"Malaysia","97":"Maldives","98":"Mali","99":"Malta","100":"Mauritania","101":"Mexico","102":"Moldova","103":"Monaco","104":"Mongolia","105":"Morocco","106":"Mozambique","107":"Namibia","108":"Nepal","109":"Netherlands","110":"Netherlands Antilles","111":"New Zealand","112":"Nicaragua","113":"Niger","114":"Nigeria","116":"Norway","117":"Oman","118":"Pakistan","119":"Panama","120":"Paraguay","121":"Peru","122":"Philippines","123":"Poland","124":"Portugal","126":"Qatar","127":"Reunion","128":"Romania","129":"Russia","130":"Rwanda","132":"Samoa (Independent)","133":"Saudi Arabia","134":"Senegal","135":"Seychelles","136":"Sierra Leone","137":"Singapore","138":"Slovakia","139":"Slovenia","140":"Somalia","141":"South Africa","142":"South Korea","143":"Spain","144":"Sri Lanka","146":"Suriname","147":"Swaziland","148":"Sweden","149":"Switzerland","152":"Taiwan","153":"Tanzania","154":"Thailand","155":"Togo","156":"Tunisia","157":"Turkiye","158":"Turkmenistan","159":"Uganda","161":"Ukraine","162":"United Arab Emirates","163":"Uruguay","164":"USA","165":"Uzbekistan","166":"Vatican City State (Holy See)","167":"Venezuela","168":"Vietnam","169":"Virgin Islands (British)","170":"Yemen","173":"Zambia","174":"Zimbabwe","175":"Antigua And Barbuda","176":"Anguilla","178":"American Samoa","179":"Aruba","180":"Brunei Darussalam","181":"Bouvet Island","183":"Cook Islands","185":"Christmas Island","187":"Dominican Republic","188":"Western Sahara","189":"Falkland Islands","191":"Faroe Islands","192":"Grenada","193":"French Guiana","194":"Gibraltar","195":"Greenland","196":"Guadeloupe","198":"Guatemala","200":"Haiti","202":"Jamaica","203":"Kiribati","204":"Comoros","205":"Saint Kitts and Nevis","206":"Saint Lucia","207":"Marshall Islands","208":"Macau","210":"Martinique","212":"Mauritius","213":"New Caledonia","214":"Norfolk Island","215":"Nauru","217":"Niue","219":"Papua New Guinea","221":"Pitcairn","222":"Palau","223":"Solomon Islands","225":"Svalbard and Jan Mayen Islands","227":"San Marino","232":"Tonga","233":"Timor-Leste","234":"Trinidad and Tobago","235":"Tuvalu","237":"Saint Vincent and the Grenadines","238":"Virgin Islands (U.S.)","239":"Vanuatu","241":"Mayotte","242":"Myanmar","255":"Sao Tome and Principe","257":"South Georgia and the South Sandwich Islands","260":"Tajikistan","262":"United Kingdom","268":"Costa Rica","270":"Guernsey","272":"North Korea","274":"Afghanistan","275":"Cote D'Ivoire","276":"Cuba","277":"French Polynesia","278":"Iran","279":"Iraq","281":"Libya","282":"Palestine","285":"Syria","286":"Aaland Islands","287":"Turks & Caicos Islands","288":"Jersey  (Channel Islands)","289":"Dominica","290":"Montenegro","293":"Sudan","294":"Montserrat","298":"Curacao","302":"Sint Maarten","311":"South Sudan","315":"Republic of Kosovo","318":"Congo, Democratic Republic of the","323":"Isle of Man","324":"Saint Martin","325":"Bonaire, Saint Eustatius and Saba","326":"Serbia","327":"Saint Barthelemy"},"defaultcountry":164},"BIRTHDAY":{"name":"BIRTHDAY","label":"Birthday","helper_text":"","type":"birthday","required":false,"audience_field_name":"Birthday","dateformat":"MM/DD","enabled":false,"order":null,"field_type":"merge","merge_id":5},"COMPANY":{"name":"COMPANY","label":"Company","helper_text":"","type":"text","required":false,"audience_field_name":"Company","enabled":false,"order":null,"field_type":"merge","merge_id":6},"MMERGE7":{"name":"MMERGE7","label":"Full Name","helper_text":"","type":"text","required":false,"audience_field_name":"Full Name","enabled":false,"order":null,"field_type":"merge","merge_id":7}}).find(function(f) { return f.name === fieldName && f.type === 'smsphone'; });
        var isRequired = smsField ? smsField.required : false;
        var shouldAppendCountryCode = smsNotRequiredRemoveCountryCodeEnabled ? isRequired : true;
        
        var phoneInput = document.querySelector('#mce-' + fieldName);
        if (phoneInput && selectedProgram.countryCallingCode && shouldAppendCountryCode) {
          phoneInput.value = selectedProgram.countryCallingCode;
        }
        
        
        updateSmsLegalText(selectedCountry, fieldName);
        updatePlaceholder(selectedCountry, fieldName);
        updateCountryCodeInstruction(selectedCountry, fieldName);
      });
    }

    document.addEventListener('DOMContentLoaded', function() {
      const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
      
      smsPhoneFields.forEach(function(dropdown) {
        const fieldName = dropdown?.id.replace('country-select-', '');
        initializeSmsPhoneDropdown(fieldName);
      });
    });
    </script></div>


