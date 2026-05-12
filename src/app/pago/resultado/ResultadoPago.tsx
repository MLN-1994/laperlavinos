'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon, ClockIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/useCartStore';

type PaymentStatus = 'success' | 'failure' | 'pending' | 'unknown';

function resolveStatus(params: URLSearchParams): PaymentStatus {
  // Mercado Pago añade collection_status=approved|rejected|pending automáticamente
  const collectionStatus = params.get('collection_status');
  if (collectionStatus === 'approved') return 'success';
  if (collectionStatus === 'rejected') return 'failure';
  if (collectionStatus === 'pending') return 'pending';

  // OpenPay / parámetro explícito
  const status = params.get('status');
  if (status === 'success') return 'success';
  if (status === 'failure' || status === 'failed') return 'failure';
  if (status === 'pending') return 'pending';

  return 'unknown';
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  showRetry: boolean;
}

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  success: {
    icon: CheckCircleIcon,
    iconBg: 'bg-emerald-900/40',
    iconColor: 'text-emerald-400',
    title: '¡Pago aprobado!',
    description:
      'Tu pedido fue recibido con éxito. En breve te contactamos para coordinar la entrega.',
    ctaLabel: 'Seguir comprando',
    ctaHref: '/',
    showRetry: false,
  },
  failure: {
    icon: XCircleIcon,
    iconBg: 'bg-red-900/40',
    iconColor: 'text-red-400',
    title: 'El pago no fue procesado',
    description:
      'No se pudo completar la transacción. Revisá los datos de tu tarjeta o intentalo con otro medio de pago.',
    ctaLabel: 'Volver a la tienda',
    ctaHref: '/',
    showRetry: true,
  },
  pending: {
    icon: ClockIcon,
    iconBg: 'bg-amber-900/40',
    iconColor: 'text-amber-400',
    title: 'Pago en revisión',
    description:
      'Tu pago está siendo procesado. Te notificaremos por email cuando esté confirmado.',
    ctaLabel: 'Volver a la tienda',
    ctaHref: '/',
    showRetry: false,
  },
  unknown: {
    icon: QuestionMarkCircleIcon,
    iconBg: 'bg-neutral-800',
    iconColor: 'text-neutral-400',
    title: 'No pudimos verificar el pago',
    description:
      'Si realizaste una compra, revisá tu casilla de email o contactanos para que te ayudemos.',
    ctaLabel: 'Volver al inicio',
    ctaHref: '/',
    showRetry: false,
  },
};

export default function ResultadoPago() {
  const params = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const status = resolveStatus(params);
  // MP envía external_reference; OpenPay envía ref
  const ref = params.get('external_reference') ?? params.get('ref') ?? null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tarjeta principal */}
      <div className="rounded-sm border border-neutral-800 bg-neutral-900/80 px-8 py-10 text-center shadow-2xl backdrop-blur-sm">

        {/* Ícono */}
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>

        {/* Título */}
        <h1 className="font-serif text-2xl font-light tracking-tight text-neutral-100 sm:text-3xl">
          {config.title}
        </h1>

        {/* Descripción */}
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          {config.description}
        </p>

        {/* Referencia del pedido (solo en pago aprobado) */}
        {ref && status === 'success' && (
          <div className="mt-5 rounded-sm border border-neutral-800 bg-neutral-800/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">
              Referencia de pedido
            </p>
            <p className="font-mono text-xs text-[#c9a96e] break-all">{ref}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={config.ctaHref}
            className="block w-full rounded-sm bg-[#a68a5c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-[#c9a96e]"
          >
            {config.ctaLabel}
          </Link>

          {config.showRetry && (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="block w-full rounded-sm border border-neutral-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              Reintentar pago
            </button>
          )}
        </div>
      </div>

      {/* Contacto de soporte */}
      <p className="mt-6 text-center text-xs text-neutral-600">
        ¿Tenés dudas?{' '}
        <a
          href="mailto:laperlavinos@gmail.com"
          className="text-neutral-400 underline underline-offset-2 hover:text-neutral-300"
        >
          laperlavinos@gmail.com
        </a>
        {' '}·{' '}
        <a
          href="https://wa.me/5492915342403"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 underline underline-offset-2 hover:text-neutral-300"
        >
          WhatsApp
        </a>
      </p>
    </div>
  );
}
