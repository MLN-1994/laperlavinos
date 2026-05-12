import type { Metadata } from 'next';
import LegalShell from '../LegalShell';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del sitio y la tienda online de La Perla Vinos.',
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" lastUpdated="12 de mayo de 2026">

      <h2>1. Descripción del servicio</h2>
      <p>
        La Perla Vinos es la tienda online de <strong>Ultra Premium Drink S.R.L.</strong>, CUIT{' '}
        <strong>30-71722318-3</strong>, con domicilio en Pilmaiquén 292, Barrio Patagonia,
        Bahía Blanca, Provincia de Buenos Aires, CP 8000 (en adelante, &quot;La Perla&quot; o
        &quot;el Vendedor&quot;).
      </p>
      <p>
        A través del sitio web se ofrece la venta de bebidas alcohólicas, vinos de alta gama,
        espumantes y productos afines, así como regalos corporativos, con envíos a todo el
        territorio de la República Argentina.
      </p>

      <h2>2. Aceptación de los términos</h2>
      <p>
        El acceso y uso de este sitio implica la aceptación plena y sin reservas de los presentes
        Términos y Condiciones. Si no está de acuerdo con alguna de sus disposiciones, deberá
        abstenerse de utilizarlo.
      </p>
      <p>
        La Perla se reserva el derecho de modificar estos Términos y Condiciones en cualquier
        momento. Los cambios serán informados con al menos <strong>10 días corridos</strong> de
        anticipación mediante aviso en el sitio. El uso continuado del servicio después de
        publicada la actualización implica aceptación de los nuevos términos.
      </p>

      <h2>3. Capacidad para contratar</h2>
      <p>
        Podrán realizar compras en este sitio únicamente las personas:
      </p>
      <ul>
        <li>Mayores de <strong>18 años</strong> de edad.</li>
        <li>Con capacidad legal para contratar conforme a la legislación argentina.</li>
        <li>Con domicilio o dirección de entrega en el territorio argentino.</li>
      </ul>
      <p>
        <strong>
          La venta de bebidas alcohólicas a menores de 18 años está prohibida por la Ley 24.788.
        </strong>{' '}
        Al realizar una compra, el usuario declara bajo su responsabilidad ser mayor de edad.
        La Perla se reserva el derecho de cancelar cualquier pedido donde se presuma que el
        destinatario es menor de edad.
      </p>

      <h2>4. Proceso de compra</h2>
      <p>
        El proceso de compra consta de los siguientes pasos:
      </p>
      <ul>
        <li>Selección de productos y agregado al carrito.</li>
        <li>Ingreso de datos del comprador y dirección de entrega.</li>
        <li>Selección del medio de pago (Mercado Pago u OpenPay/BBVA).</li>
        <li>Confirmación y pago en la pasarela correspondiente.</li>
        <li>Recepción de confirmación por email.</li>
      </ul>
      <p>
        El contrato de compraventa se perfecciona en el momento en que La Perla confirma la
        recepción del pago aprobado y envía la confirmación al correo electrónico del comprador.
      </p>

      <h2>5. Precios</h2>
      <p>
        Todos los precios publicados en el sitio están expresados en <strong>pesos argentinos (ARS)</strong> e
        incluyen el Impuesto al Valor Agregado (IVA). Los precios son vinculantes para La Perla
        en el momento en que se genera la preferencia de pago, conforme al artículo 7 de la
        Ley 24.240.
      </p>
      <p>
        La Perla se reserva el derecho de modificar sus precios en cualquier momento, sin que
        dicha modificación afecte los pedidos ya confirmados y pagados.
      </p>

      <h2>6. Medios de pago</h2>
      <p>
        El sitio acepta los siguientes medios de pago:
      </p>
      <ul>
        <li>
          <strong>Mercado Pago</strong>: tarjetas de crédito, débito, Mercado Crédito y otros
          medios habilitados por la plataforma.
        </li>
        <li>
          <strong>OpenPay / BBVA Argentina</strong>: tarjetas de crédito y débito admitidas.
        </li>
      </ul>
      <p>
        Las transacciones son procesadas directamente por las pasarelas de pago indicadas, bajo
        sus propios términos y condiciones de seguridad. La Perla no almacena datos de tarjetas
        de crédito o débito.
      </p>

      <h2>7. Envíos y plazos de entrega</h2>
      <p>
        Los envíos se realizan a todo el territorio de la República Argentina. Los plazos
        estimados de entrega son:
      </p>
      <ul>
        <li>
          <strong>Bahía Blanca y zona:</strong> 3 a 5 días hábiles desde la confirmación del
          pago.
        </li>
        <li>
          <strong>Interior del país:</strong> 5 a 10 días hábiles desde la confirmación del
          pago.
        </li>
      </ul>
      <p>
        Los plazos son estimativos y pueden verse afectados por demoras del operador logístico,
        condiciones climáticas u otras causas ajenas a La Perla. En caso de demora superior al
        plazo informado, el comprador podrá ejercer los derechos previstos en el artículo 10 bis
        de la Ley 24.240.
      </p>

      <h2>8. Cambios y devoluciones</h2>
      <p>
        La política de cambios y devoluciones se rige por lo establecido en la{' '}
        <a href="/legal/devoluciones">Política de Cambios y Devoluciones</a>, que forma parte
        integrante de estos Términos y Condiciones.
      </p>

      <h2>9. Responsabilidad</h2>
      <p>
        La Perla será responsable por los defectos en la prestación de su servicio en la medida
        en que le sean imputables, conforme a las leyes vigentes. No será responsable por
        demoras, interrupciones o errores causados por terceros, fuerza mayor o caso fortuito.
      </p>
      <p>
        Las imágenes de los productos son de carácter ilustrativo. La Perla no garantiza que
        los colores, diseños o presentaciones de los productos coincidan exactamente con las
        imágenes publicadas.
      </p>

      <h2>10. Propiedad intelectual</h2>
      <p>
        Todos los contenidos del sitio (textos, imágenes, logotipos, diseños, código fuente) son
        propiedad de Ultra Premium Drink S.R.L. o de sus licenciantes. Queda prohibida su
        reproducción total o parcial sin autorización expresa y por escrito.
      </p>

      <h2>11. Jurisdicción y ley aplicable</h2>
      <p>
        Estos Términos y Condiciones se rigen por la legislación de la República Argentina,
        en particular por la <strong>Ley 24.240</strong> de Defensa del Consumidor y sus
        modificatorias. Para cualquier controversia derivada de su aplicación, las partes se
        someten a la competencia de los tribunales ordinarios con asiento en la ciudad de{' '}
        <strong>Bahía Blanca, Provincia de Buenos Aires</strong>, sin perjuicio de los
        derechos irrenunciables del consumidor conforme a la legislación aplicable.
      </p>
      <p>
        Para consultas o reclamos, el consumidor puede contactarse con:
      </p>
      <ul>
        <li>Email: <a href="mailto:laperlavinos@gmail.com">laperlavinos@gmail.com</a></li>
        <li>WhatsApp: <a href="https://wa.me/5492915342403">0291 534-2403</a></li>
        <li>
          Dirección: Pilmaiquén 292, Barrio Patagonia, Bahía Blanca, Buenos Aires, CP 8000.
        </li>
      </ul>
      <p>
        Asimismo, el consumidor tiene derecho a recurrir a la{' '}
        <strong>
          Dirección Nacional de Defensa del Consumidor (DNDC)
        </strong>{' '}
        al teléfono <strong>0800-666-1518</strong> o al sistema de conciliación en línea{' '}
        <a
          href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.consumidor.gob.ar
        </a>.
      </p>

    </LegalShell>
  );
}
