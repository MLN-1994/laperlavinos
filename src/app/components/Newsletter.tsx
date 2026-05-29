'use client';

const MAILCHIMP_ACTION =
  'https://gmail.us18.list-manage.com/subscribe/post?u=d6bb58c7ea5715dda59bc311c&id=63dca8231f&f_id=0013aee6f0';

export default function Newsletter() {
  return (
    <section className="relative w-full border-y border-neutral-800 bg-neutral-900/90 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a68a5c]/60 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(420px,560px)] lg:items-center lg:gap-12">
          <div className="text-center lg:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a68a5c]">
              Newsletter
            </p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-tight text-neutral-200 sm:text-3xl">
              Novedades y recomendaciones
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400 lg:max-w-lg">
              Sumate para recibir novedades, etiquetas destacadas y lanzamientos antes que nadie.
            </p>
          </div>

          <form
            action={MAILCHIMP_ACTION}
            method="post"
            target="_blank"
            rel="noreferrer"
            className="space-y-3 rounded-[4px] border border-neutral-700 bg-neutral-900/60 p-4 sm:p-5"
          >
            <div className="space-y-1">
              <label htmlFor="mce-EMAIL" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Email
              </label>
              <input
                id="mce-EMAIL"
                name="EMAIL"
                type="email"
                required
                placeholder="tu mail..."
                className="w-full rounded-[4px] border border-neutral-700 bg-neutral-800/70 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-[#a68a5c]/70 focus:ring-1 focus:ring-[#a68a5c]/30"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="mce-FNAME" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Nombre
                </label>
                <input
                  id="mce-FNAME"
                  name="FNAME"
                  type="text"
                  placeholder="opcional"
                  className="w-full rounded-[4px] border border-neutral-700 bg-neutral-800/70 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-[#a68a5c]/70 focus:ring-1 focus:ring-[#a68a5c]/30"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="mce-PHONE" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Teléfono
                </label>
                <input
                  id="mce-PHONE"
                  name="PHONE"
                  type="text"
                  placeholder="opcional"
                  className="w-full rounded-[4px] border border-neutral-700 bg-neutral-800/70 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-[#a68a5c]/70 focus:ring-1 focus:ring-[#a68a5c]/30"
                />
              </div>
            </div>

            <input type="hidden" name="tags" value="3076534" />
            <div aria-hidden="true" className="absolute -left-[5000px]">
              <input
                type="text"
                name="b_d6bb58c7ea5715dda59bc311c_63dca8231f"
                tabIndex={-1}
                defaultValue=""
              />
            </div>

            <button
              type="submit"
              name="subscribe"
              id="mc-embedded-subscribe"
              className="w-full rounded-[4px] border border-neutral-700 bg-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition-colors duration-200 hover:border-[#a68a5c] hover:bg-[#a68a5c] hover:text-neutral-900"
            >
              Suscribirme
            </button>

            <p className="text-[11px] text-neutral-500">
              Al enviar, se abrirá Mailchimp en una nueva pestaña para completar la suscripción.
            </p>
          </form>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#a68a5c]/60 to-transparent" />
    </section>
  );
}
