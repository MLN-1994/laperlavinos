import { unstable_noStore as noStore } from 'next/cache';
import { BanknotesIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import { getHomePublicityConfig } from '@/lib/publicity';
import type { PublicityIconName } from '@/types/publicity';

const iconMap: Record<PublicityIconName, typeof TruckIcon> = {
  truck: TruckIcon,
  card: CreditCardIcon,
  banknotes: BanknotesIcon,
};

export default async function PublicityHighlights() {
  noStore();
  const publicity = await getHomePublicityConfig();

  if (!publicity.promo_active && !publicity.benefits_active) {
    return null;
  }

  return (
    <section className="relative z-10 mt-8 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1220px] space-y-6">
        {publicity.promo_active ? (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[6px] border border-[#c5b28d]/12 bg-[linear-gradient(180deg,_#184f3b_0%,_#124332_100%)] px-5 py-6 text-center text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)] sm:px-8 sm:py-7">
            <p className="text-xl font-semibold tracking-tight sm:text-[2.05rem]">
              {publicity.promo_title}
            </p>
            <p className="mt-1.5 text-sm text-[#e4efe9] sm:text-[15px]">
              {publicity.promo_subtitle}
            </p>
            <p className="mt-2 text-[1.65rem] font-semibold tracking-tight text-[#f5efe2] sm:mt-3 sm:text-[2.2rem]">{publicity.promo_heading}</p>
            {publicity.promo_cta_label ? (
              publicity.promo_cta_href ? (
                <a
                  href={publicity.promo_cta_href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center justify-center text-sm font-semibold text-[#e8d7b0] transition hover:opacity-85 sm:mt-3"
                >
                  {publicity.promo_cta_label}
                </a>
              ) : (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center justify-center text-sm font-semibold text-[#e8d7b0] transition hover:opacity-85 sm:mt-3"
                >
                  {publicity.promo_cta_label}
                </button>
              )
            ) : null}
          </div>
        ) : null}

        {publicity.benefits_active ? (
          <div className="mx-auto max-w-6xl rounded-[6px] bg-[#f7f4ef] px-5 py-6 text-[#303438] shadow-[0_14px_34px_rgba(0,0,0,0.12)] sm:px-8 sm:py-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              {publicity.benefit_items.map((item, index) => {
                const Icon = iconMap[item.icon];

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 ${index < publicity.benefit_items.length - 1 ? 'md:border-r md:border-[#ddd5ca] md:pr-6 lg:pr-10' : ''} ${index > 0 ? 'md:pl-6 lg:pl-10' : ''}`}
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
        ) : null}
      </div>
    </section>
  );
}