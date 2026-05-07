export default function GeodesicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white pointer-events-none">

      {/* Superior izquierda */}
      <div
        className="absolute -top-16 -left-16 w-[320px] md:w-[480px] opacity-[0.14]"
        style={{ filter: 'sepia(0.2) brightness(1.2)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* Superior derecha */}
      <div
        className="absolute -top-10 -right-20 w-[300px] md:w-[460px] opacity-[0.09]"
        style={{ filter: 'invert(65%) sepia(21%) saturate(651%) hue-rotate(3deg) brightness(92%) contrast(88%)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* Centro izquierda */}
      <div
        className="hidden md:block absolute top-[42%] -left-20 w-[260px] opacity-[0.07]"
        style={{ filter: 'invert(62%) sepia(94%) saturate(1915%) hue-rotate(13deg) brightness(94%) contrast(96%)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* Centro derecha */}
      <div
        className="hidden md:block absolute top-[38%] -right-16 w-[220px] opacity-[0.06] blur-[1px]"
        style={{ filter: 'sepia(0.2) brightness(1.2)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* Inferior izquierda */}
      <div
        className="hidden md:block absolute bottom-[-8%] left-[10%] w-[200px] opacity-[0.06]"
        style={{ filter: 'invert(22%) sepia(87%) saturate(3736%) hue-rotate(354deg) brightness(89%) contrast(92%)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* Inferior derecha */}
      <div
        className="hidden md:block absolute bottom-[-6%] right-[12%] w-[280px] opacity-[0.05]"
        style={{ filter: 'invert(65%) sepia(21%) saturate(651%) hue-rotate(3deg) brightness(92%) contrast(88%)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

    </div>
  );
}