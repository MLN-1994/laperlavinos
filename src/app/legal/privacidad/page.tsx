import type { Metadata } from 'next';
import LegalShell from '../LegalShell';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Política de privacidad y tratamiento de datos personales de La Perla Vinos, conforme a la Ley 25.326.',
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" lastUpdated="12 de mayo de 2026">

      <h2>1. Responsable del tratamiento</h2>
      <p>
        <strong>Ultra Premium Drink S.R.L.</strong>, CUIT <strong>30-71722318-3</strong>,
        con domicilio en Pilmaiquén 292, Barrio Patagonia, Bahía Blanca, Provincia de Buenos
        Aires, CP 8000, es la responsable del tratamiento de los datos personales recolectados a
        través del sitio La Perla Vinos (en adelante, &quot;La Perla&quot;).
      </p>
      <p>
        La presente Política se rige por la{' '}
        <strong>Ley 25.326 de Protección de los Datos Personales</strong> y su decreto
        reglamentario 1558/2001, y por las disposiciones de la{' '}
        <strong>Ley 24.240 de Defensa del Consumidor</strong>.
      </p>

      <h2>2. Datos que recolectamos</h2>
      <p>
        Al realizar una compra o interactuar con el sitio, podemos recolectar los siguientes
        datos personales:
      </p>
      <ul>
        <li>Nombre y apellido.</li>
        <li>Dirección de correo electrónico.</li>
        <li>Número de teléfono o celular.</li>
        <li>Tipo y número de documento de identidad (DNI, CUIL u otro).</li>
        <li>Dirección de entrega (calle, número, localidad, provincia, código postal).</li>
        <li>Información de la transacción (monto, estado del pago, referencia del pedido).</li>
      </ul>
      <p>
        <strong>No almacenamos</strong> datos de tarjetas de crédito ni débito. Dichos datos
        son procesados exclusivamente por las pasarelas de pago habilitadas (Mercado Pago y
        OpenPay/BBVA Argentina), bajo sus propias políticas de seguridad.
      </p>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Los datos recolectados se utilizan exclusivamente para:</p>
      <ul>
        <li>Procesar y gestionar los pedidos de compra.</li>
        <li>Coordinar la entrega de los productos.</li>
        <li>Enviar confirmaciones de pedido y actualizaciones de estado.</li>
        <li>Atender consultas, reclamos y ejercicio de garantías.</li>
        <li>Cumplir con obligaciones legales y fiscales.</li>
        <li>
          Enviar comunicaciones comerciales (newsletter), únicamente si el usuario lo consintió
          expresamente.
        </li>
      </ul>

      <h2>4. Transferencia a terceros</h2>
      <p>
        Los datos personales pueden ser compartidos con los siguientes terceros, estrictamente
        en la medida necesaria para la prestación del servicio:
      </p>
      <ul>
        <li>
          <strong>Mercado Pago (MercadoLibre S.R.L.)</strong>: para el procesamiento de pagos.
        </li>
        <li>
          <strong>OpenPay / BBVA Argentina</strong>: para el procesamiento de pagos.
        </li>
        <li>
          <strong>Operadores logísticos</strong>: para la coordinación y entrega de los
          pedidos.
        </li>
      </ul>
      <p>
        La Perla no vende, cede ni transfiere datos personales a terceros con fines comerciales
        o publicitarios.
      </p>

      <h2>5. Consentimiento</h2>
      <p>
        Conforme al artículo 5 de la Ley 25.326, el suministro de datos personales al momento
        de realizar una compra implica el consentimiento libre, expreso e informado del titular
        para el tratamiento de sus datos con las finalidades indicadas en esta política.
      </p>
      <p>
        La suscripción al newsletter es voluntaria y puede cancelarse en cualquier momento
        mediante solicitud a <a href="mailto:ventas@laperlawines.com.ar">ventas@laperlawines.com.ar</a>.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        La Perla adopta medidas técnicas y organizativas razonables para proteger los datos
        personales contra el acceso no autorizado, la pérdida, alteración o divulgación
        indebida. Los datos se almacenan en servidores seguros y el acceso se limita al
        personal autorizado.
      </p>

      <h2>7. Derechos del titular</h2>
      <p>
        Conforme a los artículos 14 a 16 de la Ley 25.326, el titular de los datos tiene
        derecho a:
      </p>
      <ul>
        <li>
          <strong>Acceso</strong>: solicitar información sobre los datos personales que La Perla
          tiene registrados.
        </li>
        <li>
          <strong>Rectificación</strong>: corregir datos inexactos o desactualizados.
        </li>
        <li>
          <strong>Supresión</strong>: solicitar la eliminación de sus datos, salvo que exista
          obligación legal de conservarlos.
        </li>
        <li>
          <strong>Oposición</strong>: oponerse al tratamiento para fines de marketing directo.
        </li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, el titular debe enviar su solicitud por
        escrito a:
      </p>
      <ul>
        <li>Email: <a href="mailto:ventas@laperlawines.com.ar">ventas@laperlawines.com.ar</a></li>
        <li>
          Domicilio: Pilmaiquén 292, Barrio Patagonia, Bahía Blanca, Buenos Aires, CP 8000.
        </li>
      </ul>
      <p>
        La respuesta será brindada dentro de los plazos establecidos por la Ley 25.326. La
        &quot;DIRECCIÓN NACIONAL DE PROTECCIÓN DE DATOS PERSONALES&quot;, Órgano de Control de la
        Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se
        interpongan con relación al incumplimiento de las normas sobre protección de datos
        personales.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Este sitio puede utilizar cookies técnicas necesarias para su funcionamiento (por
        ejemplo, para mantener el estado del carrito de compras). No se utilizan cookies de
        seguimiento o publicidad de terceros.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        La Perla puede actualizar esta Política de Privacidad en cualquier momento. Los cambios
        serán publicados en esta misma página con indicación de la fecha de última
        actualización.
      </p>

    </LegalShell>
  );
}
