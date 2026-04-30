import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-[#beb9b1]/10 bg-[#111109] px-6 py-14 text-[#beb9b1]">
      <div className="mx-auto max-w-[1440px]">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Columna 1: Sobre nosotros */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a68a5c]">
              La Perla
            </p>
            <h3 className="font-serif text-lg font-light leading-snug text-[#ebe3d2]">
              Vinos de alta gama y regalos corporativos
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#beb9b1]/60">
              Tienda física en Pilmaiquén 292, Bahía Blanca.📍
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a68a5c]">
              Contacto
            </p>
            <ul className="flex flex-col gap-3 text-sm text-[#beb9b1]/70">
              <li>
                <a
                  href="mailto:laperlavinos@gmail.com"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#a68a5c]"
                >
                  <HiOutlineMail className="h-4 w-4 shrink-0 text-[#a68a5c]" />
                  laperlavinos@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5492915342403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#a68a5c]"
                >
                  <FaWhatsapp className="h-4 w-4 shrink-0 text-[#a68a5c]" />
                  0291 534-2403
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/laperlawines/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#a68a5c]"
                >
                  <FaInstagram className="h-4 w-4 shrink-0 text-[#a68a5c]" />
                  @laperlawines
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a68a5c]">
              Aviso legal
            </p>
            <p className="text-sm leading-relaxed text-[#beb9b1]/60">
              Beber con moderación.
            </p>
            <p className="text-sm leading-relaxed text-[#beb9b1]/60">
              Prohibida su venta a menores de 18 años.
            </p>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-12 border-t border-[#beb9b1]/10 pt-6 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between">
          <p className="text-xs text-[#beb9b1]/40">
            © {new Date().getFullYear()} La Perla Vinos. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#beb9b1]/30 italic">
            Tienda en desarrollo — gestión interna conectada a Hermes.
          </p>
        </div>
      </div>
    </footer>
  );
}
