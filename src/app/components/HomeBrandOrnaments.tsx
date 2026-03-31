export default function HomeBrandOrnaments() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute left-[-4.5rem] top-24 w-40 opacity-[0.14] sm:left-[-5rem] sm:top-28 sm:w-52 lg:left-0 lg:top-32 lg:w-64"
        style={{ filter: 'sepia(0.18) brightness(1.15)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="h-auto w-full" />
      </div>

      <div
        className="absolute right-[-3.5rem] top-[22rem] w-36 opacity-[0.09] sm:right-[-3rem] sm:top-[23rem] sm:w-44 lg:right-4 lg:top-[26rem] lg:w-64"
        style={{
          filter: 'invert(67%) sepia(22%) saturate(425%) hue-rotate(358deg) brightness(92%) contrast(88%)',
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="h-auto w-full" />
      </div>

      <div
        className="absolute top-[42rem] left-[4%] hidden w-32 opacity-[0.05] md:block lg:w-44"
        style={{ filter: 'sepia(0.12) brightness(1.08)' }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="h-auto w-full" />
      </div>

      <div
        className="absolute bottom-28 right-[8%] hidden w-40 opacity-[0.06] lg:block lg:w-56"
        style={{
          filter: 'invert(67%) sepia(22%) saturate(425%) hue-rotate(358deg) brightness(92%) contrast(88%)',
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="h-auto w-full" />
      </div>
    </div>
  );
}