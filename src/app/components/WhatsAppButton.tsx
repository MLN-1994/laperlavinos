'use client';

const WA_NUMBER = '5492915342403';
const WA_MESSAGE = encodeURIComponent('Hola, me comunico desde la web de La Perla Vinos. Quería consultar sobre ');

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] shadow-lg shadow-black/30 transition-transform duration-200 hover:scale-110 hover:shadow-[#25d366]/40"
    >
      {/* WhatsApp SVG oficial */}
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 2C8.281 2 2 8.277 2 16c0 2.47.643 4.788 1.768 6.8L2 30l7.383-1.736A13.94 13.94 0 0 0 16.004 30C23.719 30 30 23.723 30 16S23.719 2 16.004 2zm0 25.385a11.34 11.34 0 0 1-5.789-1.582l-.414-.247-4.383 1.031 1.063-4.266-.27-.438A11.356 11.356 0 0 1 4.617 16c0-6.277 5.109-11.385 11.387-11.385S27.389 9.723 27.389 16 22.281 27.385 16.004 27.385zm6.242-8.523c-.343-.172-2.031-1.004-2.344-1.117-.316-.113-.543-.172-.773.172-.23.343-.887 1.117-1.09 1.347-.2.23-.4.258-.742.086-.344-.172-1.449-.535-2.762-1.703-1.02-.91-1.711-2.035-1.91-2.379-.2-.344-.023-.531.148-.703.153-.152.344-.398.516-.598.172-.199.23-.343.344-.57.113-.23.059-.43-.027-.602-.086-.172-.773-1.863-1.059-2.551-.277-.668-.563-.578-.773-.59-.199-.012-.43-.016-.66-.016-.23 0-.602.086-.918.43-.316.344-1.203 1.176-1.203 2.867s1.23 3.324 1.402 3.554c.172.23 2.422 3.7 5.867 5.188.82.355 1.461.566 1.961.723.824.262 1.574.226 2.168.137.66-.098 2.031-.832 2.316-1.633.285-.8.285-1.488.2-1.633-.082-.144-.313-.23-.656-.402z" />
      </svg>
    </a>
  );
}
