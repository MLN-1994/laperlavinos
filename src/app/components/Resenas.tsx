const REVIEWS = [
  {
    text: 'Excelente selección y llegó en 2 días.',
    name: 'Carolina M.',
  },
  {
    text: 'El sommelier me ayudó por WhatsApp, top.',
    name: 'Martín R.',
  },
  {
    text: 'La caja venía perfecta, re bien embalada.',
    name: 'Lucía F.',
  },
];

export default function Resenas() {
  return (
    <section className="border-t border-[#E8DFD0] bg-[#F5EFE6] py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-3 rounded-sm border border-[#E8DFD0] bg-white p-6 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-[#6B5744]">"{r.text}"</p>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-wider text-[#C9A96E]">★★★★★</span>
                <span className="text-xs font-semibold text-[#1A120B]">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
