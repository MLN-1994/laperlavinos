import { unstable_noStore as noStore } from 'next/cache';
import { getHomePublicityConfig } from '@/lib/publicity';

export default async function PromoStrip() {
  noStore();
  const publicity = await getHomePublicityConfig();

  if (!publicity.strip_active || !publicity.strip_text) {
    return null;
  }

  const style = {
    backgroundColor: publicity.strip_bg_color,
    color: publicity.strip_text_color,
  };

  const content = (
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
      {publicity.strip_text}
    </span>
  );

  return (
    <div style={style} className="w-full py-2 text-center px-4">
      {publicity.strip_link ? (
        <a
          href={publicity.strip_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          {content}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-70">
            <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
          </svg>
        </a>
      ) : (
        content
      )}
    </div>
  );
}
