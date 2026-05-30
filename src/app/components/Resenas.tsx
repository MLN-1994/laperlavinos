type ReviewItem = {
  id: string;
  name: string;
  publishedAgo: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

const REVIEWS: ReviewItem[] = [
  {
    id: 'mariana-oyague',
    name: 'Mariana Oyague',
    publishedAgo: 'hace 9 meses',
    rating: 4,
    text: 'Bueno precios buena atencion',
  },
  {
    id: 'martin-cardena',
    name: 'Martin Cardena',
    publishedAgo: 'hace 3 anos',
    rating: 4,
    text: 'Excelente atencion, algunas cosas en precio razonable, otras un poco alto.',
  },
  {
    id: 'daniel-tarayre',
    name: 'Daniel Tarayre',
    publishedAgo: 'hace un ano',
    rating: 5,
    text: 'Buena atencion y buena variedad',
  },
];

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?kgmid=/g/11ry9hnrkp&hl=es-419&q=Vinoteca+La+Perla+Wines+-+Patagonia&shem=epsd1,rimspwouohc&shndl=30&source=sh/x/loc/osrp/m5/1&kgs=e57a164c2fe80d5a&utm_source=epsd1,rimspwouohc,sh/x/loc/osrp/m5/1';

function StarRating({ rating }: { rating: ReviewItem['rating'] }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Calificación: ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          aria-hidden="true"
          className={value <= rating ? 'text-[#F4B400]' : 'text-[#D6D6D6]'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Resenas() {
  return (
    <section className="border-t border-[#E8DFD0] bg-[#F5EFE6] py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="flex min-h-[170px] flex-col gap-4 rounded-md border border-[#E8DFD0] bg-white p-5 shadow-[0_2px_10px_rgba(26,18,11,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1A120B]">{r.name}</p>
                  <div className="mt-0.5 text-[11px] text-[#7D7D7D]">{r.publishedAgo}</div>
                </div>
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#E6E6E6] text-[11px] font-semibold text-[#4285F4]"
                  aria-hidden="true"
                  title="Google"
                >
                  G
                </span>
              </div>
              <StarRating rating={r.rating} />
              <p className="text-sm leading-relaxed text-[#4A4037]">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-[#D8CCB9] bg-white/70 px-4 py-2 text-[11px] font-medium tracking-[0.06em] text-[#5F4D3D] transition-colors hover:bg-white hover:text-[#1A120B]"
          >
            Ver mas resenas en Google
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
