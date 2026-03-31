export default function PublicidadPage() {
  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-[28px] border border-[#dbd0c2] bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cbbca3]">
            Campañas y promociones
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Publicidad</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#d6cdbf] sm:text-[15px]">
            Esta sección puede crecer después para campañas, destacados, pop-ups y piezas promocionales asociadas al contenido comercial del sitio.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="max-w-3xl rounded-[24px] border border-[#e4d9c9] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">Módulo pendiente</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Por ahora esta sección está reservada para futuras piezas de publicidad. Si querés mostrar avance visual, ya quedó integrada al mismo sistema del admin y lista para evolucionar sin romper la coherencia del panel.
          </p>
        </div>
      </div>
    </section>
  );
}
