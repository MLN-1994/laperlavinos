import Link from "next/link";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-14 text-neutral-600">
      <div className="mx-auto max-w-[1440px]">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Columna 1: Sobre nosotros */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
              La Perla
            </p>
            <h3 className="font-serif text-lg font-light leading-snug text-neutral-800">
              Vinos de alta gama y regalos corporativos
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              Tienda física en Pilmaiquén 292, Bahía Blanca.📍
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Contacto
            </p>
            <ul className="flex flex-col gap-3 text-sm text-neutral-500">
              <li>
                <a
                  href="mailto:ventas@laperlawines.com.ar"
                  className="inline-flex items-center gap-2 transition-colors hover:text-neutral-900"
                >
                  <HiOutlineMail className="h-4 w-4 shrink-0 text-neutral-400" />
                  ventas@laperlawines.com.ar
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5492915342403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-neutral-900"
                >
                  <FaWhatsapp className="h-4 w-4 shrink-0 text-neutral-400" />
                  0291 534-2403
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/laperlawines/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-neutral-900"
                >
                  <FaInstagram className="h-4 w-4 shrink-0 text-neutral-400" />
                  @laperlawines
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Información legal
            </p>
            <ul className="flex flex-col gap-2 text-sm text-neutral-500">
              <li>
                <Link href="/legal/terminos" className="transition-colors hover:text-neutral-900">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="transition-colors hover:text-neutral-900">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/devoluciones" className="transition-colors hover:text-neutral-900">
                  Cambios y Devoluciones
                </Link>
              </li>
            </ul>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Beber con moderación.<br />
              Prohibida su venta a menores de 18 años.
            </p>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-12 border-t border-neutral-200 pt-6 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Ultra Premium Drink S.R.L. · CUIT 30-71722318-3 · Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
