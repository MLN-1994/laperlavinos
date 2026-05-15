import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getBankInfo } from '@/lib/transferencia';

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const metadata = {
  title: 'Pedido registrado — La Perla Vinos',
};

export default async function TransferenciaConfirmacionPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  if (!ref) redirect('/productos');

  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from('web_orders')
    .select(
      'id, external_reference, status, buyer_name, buyer_email, total_amount, shipping_amount, currency_id, notes, created_at',
    )
    .eq('external_reference', ref)
    .eq('payment_provider', 'transferencia')
    .single();

  if (error || !order) {
    redirect('/productos');
  }

  // discount_amount puede no existir aún si la migración SQL no se corrió
  const rawOrder = order as typeof order & { discount_amount?: number };
  const discountAmount = rawOrder.discount_amount ?? 0;
  const productsTotal = (order.total_amount - (order.shipping_amount ?? 0)) + discountAmount;

  const bankInfo = getBankInfo();

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 pt-16">
      <div className="mx-auto max-w-lg px-4">

        {/* ─── Cabecera ──────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#a68a5c] bg-[#a68a5c]/10 text-[#a68a5c]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a68a5c]">La Perla Vinos</p>
          <h1 className="mt-2 text-2xl font-serif font-light tracking-wide text-neutral-800">
            ¡Tu pedido fue registrado!
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Realizá la transferencia y te confirmamos en cuanto acreditemos el pago.
          </p>
        </div>

        {/* ─── Resumen del pedido ─────────────────────────────────── */}
        <div className="mb-5 overflow-hidden rounded-sm border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Resumen del pedido</p>
          </div>
          <div className="space-y-2.5 px-5 py-4 text-sm text-neutral-600">
            {discountAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Productos</span>
                  <span>{formatARS(productsTotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Descuento 10% transferencia</span>
                  <span>−{formatARS(discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400">Envío</span>
              <span>{order.shipping_amount === 0 ? 'Gratis' : formatARS(order.shipping_amount ?? 0)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2.5 text-base font-semibold text-neutral-800">
              <span>Total a transferir</span>
              <span className="text-[#c9a96e]">{formatARS(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* ─── Datos bancarios ─────────────────────────────────────── */}
        <div className="mb-5 overflow-hidden rounded-sm border border-amber-200 bg-amber-50">
          <div className="border-b border-amber-100 bg-amber-100/60 px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">Datos para la transferencia</p>
          </div>
          {bankInfo.configured ? (
            <div className="space-y-3 px-5 py-4 text-sm">
              {bankInfo.titular && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Titular</p>
                  <p className="mt-1 font-medium text-neutral-800">{bankInfo.titular}</p>
                </div>
              )}
              {bankInfo.banco && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Banco</p>
                  <p className="mt-1 font-medium text-neutral-800">{bankInfo.banco}</p>
                </div>
              )}
              {bankInfo.cbu && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">CBU</p>
                  <p className="mt-1 break-all font-mono font-semibold tracking-wider text-neutral-800">{bankInfo.cbu}</p>
                </div>
              )}
              {bankInfo.alias && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Alias</p>
                  <p className="mt-1 font-mono font-semibold text-neutral-800">{bankInfo.alias}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-4">
              <p className="text-sm text-amber-700">
                Te enviaremos los datos bancarios a{' '}
                <span className="font-semibold">{order.buyer_email ?? 'tu email'}</span> a la brevedad.
              </p>
            </div>
          )}
        </div>

        {/* ─── Importe y concepto ──────────────────────────────────── */}
        <div className="mb-5 overflow-hidden rounded-sm border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Datos de la transferencia</p>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Monto exacto</p>
              <p className="mt-1 text-xl font-semibold text-[#c9a96e]">{formatARS(order.total_amount)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Concepto / Referencia</p>
              <p className="mt-1 break-all font-mono text-xs text-neutral-600">{order.external_reference}</p>
            </div>
          </div>
        </div>

        {/* ─── Nota final ──────────────────────────────────────────── */}
        <div className="mb-8 rounded-sm border border-neutral-200 bg-neutral-50 px-5 py-4">
          <p className="text-sm leading-relaxed text-neutral-500">
            Una vez que realices la transferencia, lo confirmamos en menos de 24 horas hábiles y coordinamos el envío.
            Podés enviarnos el comprobante por WhatsApp o email.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a
              href="https://wa.me/5492915342403"
              className="text-[#a68a5c] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp →
            </a>
            <a
              href="mailto:laperlavinos@gmail.com"
              className="text-[#a68a5c] underline-offset-2 hover:underline"
            >
              laperlavinos@gmail.com →
            </a>
          </div>
        </div>

        {/* ─── CTA ─────────────────────────────────────────────────── */}
        <div className="text-center">
          <Link
            href="/productos"
            className="inline-block border border-[#a68a5c] px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-colors hover:bg-[#a68a5c] hover:text-white"
          >
            Seguir comprando
          </Link>
        </div>

      </div>
    </main>
  );
}
