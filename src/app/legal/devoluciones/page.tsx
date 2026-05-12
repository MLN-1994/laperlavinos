import type { Metadata } from 'next';
import LegalShell from '../LegalShell';

export const metadata: Metadata = {
  title: 'Política de Cambios y Devoluciones',
  description:
    'Política de cambios, devoluciones y derecho de arrepentimiento de La Perla Vinos, conforme a la Ley 24.240.',
  robots: { index: true, follow: true },
};

export default function DevolucionesPage() {
  return (
    <LegalShell
      title="Política de Cambios y Devoluciones"
      lastUpdated="12 de mayo de 2026"
    >

      <h2>1. Marco legal</h2>
      <p>
        La presente política se rige por la <strong>Ley 24.240 de Defensa del Consumidor</strong>{' '}
        y su modificatoria <strong>Ley 26.361</strong>, en particular los artículos 10 bis, 17,
        18 y 34, y por las disposiciones del{' '}
        <strong>Código Civil y Comercial de la Nación</strong> en materia de vicios redhibitorios.
      </p>

      <h2>2. Derecho de arrepentimiento — Art. 34 Ley 24.240</h2>
      <p>
        Conforme al artículo 34 de la Ley 24.240 (modif. por Ley 26.361), en las operaciones de
        venta a distancia el consumidor tiene derecho a <strong>revocar la aceptación</strong>{' '}
        dentro de los <strong>10 (diez) días hábiles</strong> contados desde la fecha en que
        recibe el producto, sin necesidad de invocar causa alguna y sin penalidad.
      </p>

      <h3>Excepción aplicable a bebidas y comestibles</h3>
      <p>
        <strong>
          Este derecho no aplica a bebidas alcohólicas, vinos, espumantes ni productos
          alimenticios
        </strong>{' '}
        comercializados por La Perla Vinos, en virtud de la naturaleza perecedera y consumible
        de dichos bienes, conforme a las excepciones admitidas por la normativa vigente para
        productos que por su naturaleza no pueden ser devueltos o que puedan deteriorarse
        rápidamente.
      </p>
      <p>
        Quedan igualmente excluidos del derecho de arrepentimiento los productos con etiqueta
        o packaging personalizado a pedido del comprador.
      </p>

      <h2>3. Cambio por producto en mal estado o incorrecto</h2>
      <p>
        La Perla Vinos garantiza la calidad de sus productos al momento del despacho. Si el
        comprador recibe un producto en mal estado, dañado o diferente al adquirido, tendrá
        derecho al cambio o a la devolución del importe, bajo las siguientes condiciones:
      </p>
      <ul>
        <li>
          El reclamo debe realizarse dentro de las{' '}
          <strong>48 (cuarenta y ocho) horas</strong> de recibida la mercadería.
        </li>
        <li>
          Se deberá conservar y presentar la <strong>factura de compra</strong> (en versión
          física o digital) y el remito de entrega.
        </li>
        <li>
          El producto debe encontrarse sin abrir, en su envase original y con todos sus
          accesorios o componentes.
        </li>
      </ul>
      <p>
        Vencido el plazo de 48 horas sin que se haya formulado reclamo, se presume la
        conformidad del comprador con el estado del producto recibido.
      </p>

      <h2>4. Procedimiento para solicitar un cambio o reclamo</h2>
      <p>
        Para iniciar una gestión de cambio o reclamo, el comprador deberá comunicarse con
        nuestro centro de atención al cliente por los siguientes canales:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{' '}
          <a href="mailto:laperlavinos@gmail.com">laperlavinos@gmail.com</a>
        </li>
        <li>
          <strong>WhatsApp:</strong>{' '}
          <a href="https://wa.me/5492915342403">0291 534-2403</a>
        </li>
      </ul>
      <p>
        Nuestro equipo brindará al comprador la información necesaria y coordinará la solución
        más conveniente para cada caso (retiro del producto, envío de reemplazo o reembolso
        del importe abonado).
      </p>

      <h2>5. Reembolsos</h2>
      <p>
        En los casos en que proceda la devolución del importe, el reembolso se realizará a
        través del mismo medio de pago utilizado en la compra original, dentro de los plazos
        que establezca la pasarela de pago correspondiente (Mercado Pago u OpenPay/BBVA
        Argentina).
      </p>

      <h2>6. Incumplimiento en el plazo de entrega — Art. 10 bis Ley 24.240</h2>
      <p>
        Si La Perla no entregare el producto en el plazo informado al momento de la compra,
        el consumidor podrá, a su elección:
      </p>
      <ul>
        <li>Exigir el cumplimiento de la entrega.</li>
        <li>Aceptar otro producto o prestación de servicio equivalente.</li>
        <li>
          Rescindir el contrato con derecho a la restitución total de lo pagado, más los
          daños y perjuicios que correspondan.
        </li>
      </ul>

      <h2>7. Contacto y autoridad de aplicación</h2>
      <p>
        Para cualquier consulta o reclamo relacionado con esta política, el consumidor puede
        comunicarse con La Perla Vinos a través de los canales indicados en el punto 4, o
        recurrir a:
      </p>
      <ul>
        <li>
          <strong>Dirección Nacional de Defensa del Consumidor (DNDC):</strong>{' '}
          0800-666-1518 |{' '}
          <a
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
            target="_blank"
            rel="noopener noreferrer"
          >
            consumidor.gob.ar
          </a>
        </li>
        <li>
          <strong>Defensoría del Consumidor de Bahía Blanca:</strong> Alsina 65, Bahía Blanca.
        </li>
      </ul>

    </LegalShell>
  );
}
