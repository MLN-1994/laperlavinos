import { BanknotesIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';

const highlights = [
  {
    title: 'Envio gratis',
    description: 'CABA y AMBA desde 200.000',
    icon: TruckIcon,
  },
  {
    title: '3 cuotas sin interés',
    description: 'Tarjetas bancarias Amex, Visa y Master.',
    icon: CreditCardIcon,
  },
  {
    title: '15% pagando con transferencia',
    description: 'No incluye regalos y cajas navideñas.',
    icon: BanknotesIcon,
  },
];

export default function PublicityHighlights() {
  return (
    <section className="relative z-20 space-y-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[6px] border border-[#c5b28d]/12 bg-[linear-gradient(180deg,_#184f3b_0%,_#124332_100%)] px-5 py-6 text-center text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)] sm:px-8 sm:py-7">
        <p className="text-xl font-semibold tracking-tight sm:text-[2.05rem]">
          12 Cuotas Sin Interés + 10% Off Pagando con American Express
        </p>
        <p className="mt-1.5 text-sm text-[#e4efe9] sm:text-[15px]">
          Válido para todos los productos con código RG2026
        </p>
        <p className="mt-2 text-[1.65rem] font-semibold tracking-tight text-[#f5efe2] sm:mt-3 sm:text-[2.2rem]">Catálogo de Regalos 2026</p>
        <button
          type="button"
          className="mt-2 inline-flex items-center justify-center text-sm font-semibold text-[#e8d7b0] transition hover:opacity-85 sm:mt-3"
        >
          Descargar PDF
        </button>
      </div>

      <div className="mx-auto max-w-6xl rounded-[6px] bg-[#f7f4ef] px-5 py-6 text-[#303438] shadow-[0_14px_34px_rgba(0,0,0,0.12)] sm:px-8 sm:py-8">
        <div className="grid gap-6 md:grid-cols-3 md:gap-0">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 ${index < highlights.length - 1 ? 'md:border-r md:border-[#ddd5ca] md:pr-6 lg:pr-10' : ''} ${index > 0 ? 'md:pl-6 lg:pl-10' : ''}`}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-[#2f3437]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.04em] text-[#303438] sm:text-[15px]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#7a7d80]">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}