const PROPS = [
  {
    title: 'Curaduría propia',
    desc: 'Selección de vinos con identidad. Cada botella pasa por nuestra curaduría personal.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 22V10"/><path d="M12 10C12 6 8 2 4 2"/><path d="M12 10C12 6 16 2 20 2"/>
      </svg>
    ),
  },
  {
    title: 'Atención personalizada',
    desc: 'Te ayudamos a elegir mejor. Asesoramiento real por WhatsApp, sin bots.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Experiencias',
    desc: 'Degustaciones, eventos y momentos únicos para vos y tus invitados.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

export default function PorQueLaPerla() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#E8DFD0]">
          {PROPS.map((prop) => (
            <div key={prop.title} className="flex flex-col items-center px-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E8DFD0] bg-[#F5EFE6]">
                {prop.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-[#1A120B]">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5744]">{prop.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
