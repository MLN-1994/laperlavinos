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
    <section className="relative z-10 mt-8  px-4 sm:px-6 lg:px-10 ">
      <div className="mx-auto max-w-[1220px] space-y-6">
        {publicity.promo_active ? (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[6px] border border-neutral-100 bg-neutral-900/90  px-5 py-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:px-10 sm:py-5">
            <div className="mx-auto mb-5 h-px w-16 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
            <p className="text-xs font-light uppercase tracking-[0.35em] text-neutral-400">
              {publicity.promo_title}
            </p>
            <p className="mt-3 font-serif text-2xl tracking-tight text-neutral-200 sm:text-3xl">
              {publicity.promo_heading}
            </p>
            <p className="mt-2 text-sm text-neutral-400 sm:text-[15px]">
              {publicity.promo_subtitle}
            </p>
            {publicity.promo_cta_label ? (
              publicity.promo_cta_href ? (
                <a
                  href={publicity.promo_cta_href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 border border-neutral-700 rounded-[6px] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition-colors duration-300 ease-in-out hover:bg-neutral-700/30 hover:border-neutral-500 sm:mt-6"
                >
                  {publicity.promo_cta_label}
                </a>
              ) : (
                <button
                  type="button"
                  className="mt-5 inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-400 cursor-pointer px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition hover:bg-[#a68a5c] hover:text-neutral-900 sm:mt-6"
                >
                  {publicity.promo_cta_label}
                </button>
              )
            ) : null}
            <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          </div>
        ) : null}

        {publicity.benefits_active ? (
          <div className="mx-auto max-w-6xl rounded-[6px] border border-neutral-200 bg-white px-5 py-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:px-8 sm:py-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              {publicity.benefit_items.map((item, index) => {
                const Icon = iconMap[item.icon];

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 ${index < publicity.benefit_items.length - 1 ? 'md:border-r md:border-neutral-100 md:pr-6 lg:pr-10' : ''} ${index > 0 ? 'md:pl-6 lg:pl-10' : ''}`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-neutral-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-neutral-400">{item.description}</p>
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