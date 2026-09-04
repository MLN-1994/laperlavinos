'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { XMarkIcon, TrashIcon, ShoppingBagIcon, ChevronDownIcon, MapPinIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import type { CheckoutBuyerInput } from '@/types/mercadopago';
import { SiMercadopago, SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si';
import { getShippingCost, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const initialBuyerForm: CheckoutBuyerInput = {
  name: '',
  email: '',
  phone: '',
  documentType: 'DNI',
  documentNumber: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  notes: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

function ShippingEstimate({ province, city, postalCode, subtotal, onProvinceChange }: { province: string; city?: string; postalCode?: string; subtotal: number; onProvinceChange: (p: string) => void }) {
  const cost = getShippingCost(province, subtotal, city, postalCode);
  const qualifiesBySubtotal = subtotal >= FREE_SHIPPING_THRESHOLD;
  const isLocalFree = !!province && cost === 0 && !qualifiesBySubtotal;
  const isThresholdFree = !!province && cost === 0 && qualifiesBySubtotal;
  return (
    <div className="mt-4 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPinIcon className="h-4 w-4 text-neutral-400" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Envío a domicilio — Andreani</p>
      </div>
      <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
        Provincia de destino <span className="text-red-400">*</span>
        <select
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-neutral-400"
        >
          <option value="">Seleccioná una provincia...</option>
          {ARGENTINA_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      {isThresholdFree ? (
        <p className="mt-3 text-sm font-semibold text-green-600">¡Envío gratis! Tu pedido supera ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}.</p>
      ) : cost !== null ? (
        <p className="mt-3 text-sm text-neutral-700">
          Envío estimado:{' '}
          {isLocalFree ? (
            <span className="font-semibold text-green-600">Sin cargo (Bahía Blanca)</span>
          ) : (
            <span className="font-semibold">${cost.toLocaleString('es-AR')}</span>
          )}
        </p>
      ) : (
        <>
          <p className="mt-2 text-[10px] text-neutral-400 italic">
            Seleccioná tu provincia para ver el costo de envío.
          </p>
          <p className="mt-1 text-[10px] text-green-600 italic">
            Envío gratis en pedidos mayores a ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}.
          </p>
        </>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-neutral-400';
const labelClass =
  'flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400';
const TRANSFER_DISCOUNT_MIN_SUBTOTAL = 150000;

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cart, removeFromCart, addToCart, decreaseQuantity } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [openPayLoading, setOpenPayLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [buyerForm, setBuyerForm] = useState<CheckoutBuyerInput>(initialBuyerForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'envio' | 'retiro'>('envio');

  const subtotal = cart.reduce((acc: number, item) => acc + item.price * item.quantity, 0);
  const transferDiscountEligible = subtotal >= TRANSFER_DISCOUNT_MIN_SUBTOTAL;
  const missingForTransferDiscount = Math.max(TRANSFER_DISCOUNT_MIN_SUBTOTAL - subtotal, 0);

  const handleBuyerFieldChange = <K extends keyof CheckoutBuyerInput>(
    field: K,
    value: CheckoutBuyerInput[K],
  ) => {
    setBuyerForm((current) => ({ ...current, [field]: value }));
  };

  const validateBuyerForm = () => {
    if (!buyerForm.name.trim()) return 'Ingresa nombre y apellido para continuar.';
    if (!isValidEmail(buyerForm.email.trim())) return 'Ingresa un email valido.';
    if (buyerForm.phone.trim().length < 6) return 'Ingresa un telefono valido.';
    if (!buyerForm.documentType.trim()) return 'Selecciona el tipo de documento.';
    if (buyerForm.documentNumber.trim().length < 5) return 'Ingresa un documento valido.';
    if (deliveryMethod === 'envio') {
      if (buyerForm.address.trim().length < 5) return 'Ingresa una dirección válida para el envío.';
      if (buyerForm.city.trim().length < 2) return 'Ingresa la ciudad o localidad de entrega.';
      if (!/^\d{4,8}$/.test(buyerForm.postalCode.trim())) return 'Ingresa un código postal válido (ej: 1900).';
      if (!buyerForm.province.trim()) return 'Seleccioná la provincia de destino para calcular el envío.';
    }
    return null;
  };

  const buildCheckoutPayload = () => {
    const shippingCost = deliveryMethod === 'retiro' ? 0 : (getShippingCost(buyerForm.province, subtotal, buyerForm.city, buyerForm.postalCode) ?? 0);
    return {
    buyer: {
      name: buyerForm.name.trim(),
      email: buyerForm.email.trim(),
      phone: buyerForm.phone.trim(),
      documentType: buyerForm.documentType.trim(),
      documentNumber: buyerForm.documentNumber.trim(),
      address: buyerForm.address.trim(),
      province: buyerForm.province.trim(),
      notes: buyerForm.notes?.trim() || undefined,
    },
    shipping: deliveryMethod === 'retiro'
      ? { tipo: 'retiro', amount: 0 }
      : {
          province: buyerForm.province.trim(),
          city: buyerForm.city.trim(),
          postalCode: buyerForm.postalCode.trim(),
          amount: shippingCost,
        },
    items: cart.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.description,
      quantity: product.quantity,
      unit_price: product.price,
      currency_id: 'ARS',
      picture_url: product.image,
      category_id: product.category,
    })),
  };
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) return;

    const formError = validateBuyerForm();
    if (formError) {
      setCheckoutError(formError);
      setIsFormOpen(true);
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const data = (await response.json()) as {
        error?: string;
        initPoint?: string;
        sandboxInitPoint?: string;
      };

      if (!response.ok) throw new Error(data.error ?? 'No se pudo generar el link de pago.');

      const destination = data.initPoint || data.sandboxInitPoint;
      if (!destination) throw new Error('Mercado Pago no devolvió una URL de checkout.');

      window.location.href = destination;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'No se pudo generar el link de pago.',
      );
      setCheckoutLoading(false);
    }
  };

  const handleOpenPayCheckout = async () => {
    if (cart.length === 0 || openPayLoading) return;

    const formError = validateBuyerForm();
    if (formError) {
      setCheckoutError(formError);
      setIsFormOpen(true);
      return;
    }

    setOpenPayLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/openpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const data = (await response.json()) as {
        error?: string;
        checkoutUrl?: string;
      };

      if (!response.ok) throw new Error(data.error ?? 'No se pudo generar el link de pago.');
      if (!data.checkoutUrl) throw new Error('OpenPay no devolvió una URL de checkout.');

      window.location.href = data.checkoutUrl;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'No se pudo generar el link de pago con OpenPay.',
      );
      setOpenPayLoading(false);
    }
  };

  const handleTransferenciaCheckout = async () => {
    if (cart.length === 0 || transferLoading) return;

    const formError = validateBuyerForm();
    if (formError) {
      setCheckoutError(formError);
      setIsFormOpen(true);
      return;
    }

    setTransferLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/transferencia/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const data = (await response.json()) as {
        error?: string;
        externalReference?: string;
      };

      if (!response.ok) throw new Error(data.error ?? 'No se pudo generar el pedido.');
      if (!data.externalReference) throw new Error('No se recibió la referencia del pedido.');

      window.location.href = `/transferencia/confirmacion?ref=${data.externalReference}`;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'No se pudo generar el pedido.',
      );
      setTransferLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={setIsOpen}>

        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-400"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">

                  {/* ── Panel principal: 3 zonas fijas ─────────── */}
                  <div className="flex h-[100dvh] flex-col overflow-x-hidden bg-white shadow-2xl border-l border-neutral-200">

                    {/* ── HEADER (fijo arriba) ──────────────────── */}
                    <div className="flex-shrink-0 z-10 flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-white">
                      <Dialog.Title className="text-xl font-serif tracking-widest uppercase text-neutral-800">
                        Tu Selección
                      </Dialog.Title>
                      <button
                        type="button"
                        aria-label="Cerrar carrito"
                        className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <XMarkIcon className="h-6 w-6" strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* ── BANNER ENVÍO GRATIS ──────────────────── */}
                    {cart.length > 0 && (() => {
                      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
                      const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
                      if (remaining <= 0) {
                        return (
                          <div className="flex-shrink-0 flex items-center justify-center gap-2 bg-green-50 border-b border-green-200 px-6 py-2.5">
                            <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-[0.15em]">¡Envío gratis en tu pedido!</p>
                          </div>
                        );
                      }
                      return (
                        <div className="flex-shrink-0 border-b border-neutral-200 bg-neutral-50 px-6 py-3">
                          <div className="flex justify-between items-baseline mb-1.5">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Envío gratis a partir de ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] font-semibold text-[#a68a5c]">te faltan ${remaining.toLocaleString('es-AR')}</p>
                          </div>
                          <div className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
                            <div className="h-full rounded-full bg-[#a68a5c] transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── MAIN (scroll independiente) ──────────── */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">

                      {/* Lista de productos */}
                      <div className="px-6 py-4">
                        {cart.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-60 text-neutral-300">
                            <ShoppingBagIcon className="h-12 w-12 mb-4 stroke-1" />
                            <p className="text-sm font-light italic">Tu cava está vacía</p>
                          </div>
                        ) : (
                          <ul role="list" className="divide-y divide-neutral-100">
                            {cart.map((product) => {
                              const stockValue = Number(product.stock);
                              const maxAllowed = Number.isFinite(stockValue)
                                ? Math.max(0, Math.floor(stockValue))
                                : null;
                              const reachedLimit = maxAllowed !== null && product.quantity >= maxAllowed;

                              return (
                              <li key={product.id} className="flex py-5">
                                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-100 border border-neutral-200">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between text-sm font-serif tracking-tight text-neutral-800">
                                    <h3 className="line-clamp-1 uppercase">{product.name}</h3>
                                    <p className="ml-4 text-neutral-700">
                                      ${(product.price * product.quantity).toLocaleString('es-AR')}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-xs mt-2">
                                    <div className="flex items-center border border-neutral-200 rounded-sm">
                                      <button
                                        onClick={() => decreaseQuantity(product.id)}
                                        className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 transition"
                                      >
                                        −
                                      </button>
                                      <span className="px-3 py-1 text-neutral-800 border-x border-neutral-200 min-w-[32px] text-center">
                                        {product.quantity}
                                      </span>
                                      <button
                                        onClick={() => addToCart(product)}
                                        className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 transition disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                                        disabled={reachedLimit}
                                        title={reachedLimit ? 'Stock maximo alcanzado' : 'Sumar una unidad'}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(product.id)}
                                      className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      <span className="uppercase text-[10px] tracking-tighter">Quitar</span>
                                    </button>
                                  </div>
                                  {reachedLimit && (
                                    <p className="mt-1 text-[10px] text-neutral-400">
                                      Stock maximo alcanzado ({maxAllowed}).
                                    </p>
                                  )}
                                </div>
                              </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      {/* Formulario colapsable + Shipping Calculator */}
                      {cart.length > 0 && (
                        <div className="px-6 pb-6">

                          {/* Selector de método de entrega */}
                          <div className="mb-4">
                            <p className="mb-2 text-[9px] uppercase tracking-[0.28em] text-neutral-400">¿Cómo querés recibir tu pedido?</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setDeliveryMethod('envio')}
                                className={`flex items-center justify-center gap-2 rounded-sm border px-3 py-3 text-[11px] uppercase tracking-[0.12em] transition ${
                                  deliveryMethod === 'envio'
                                    ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#a68a5c] font-semibold'
                                    : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                                }`}
                              >
                                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                                Envío a domicilio
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeliveryMethod('retiro')}
                                className={`flex items-center justify-center gap-2 rounded-sm border px-3 py-3 text-[11px] uppercase tracking-[0.12em] transition ${
                                  deliveryMethod === 'retiro'
                                    ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#a68a5c] font-semibold'
                                    : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                                }`}
                              >
                                <BuildingStorefrontIcon className="h-4 w-4 flex-shrink-0" />
                                Retiro en local
                              </button>
                            </div>
                          </div>

                          {/* Acordeón "Tus datos para finalizar" */}
                          <button
                            type="button"
                            onClick={() => setIsFormOpen((v) => !v)}
                            className="w-full flex items-center justify-between rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100"
                          >
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                                Pedido y contacto
                              </p>
                              <p className="mt-0.5 text-sm font-serif uppercase tracking-[0.12em] text-neutral-800">
                                Tus datos para finalizar
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:block text-[10px] text-neutral-400 uppercase tracking-wider">
                                {isFormOpen ? 'Ocultar' : 'Completar'}
                              </span>
                              <ChevronDownIcon
                                className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${
                                  isFormOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {isFormOpen && (
                            <div className="mt-2 rounded-sm border border-neutral-200 bg-white px-4 py-4">
                              <p className="text-[10px] text-red-400 mb-3"><span className="font-bold">*</span> Campos obligatorios</p>
                              <div className="grid gap-3">

                                <label className={labelClass}>
                                  Nombre y apellido <span className="text-red-400">*</span>
                                  <input
                                    type="text"
                                    value={buyerForm.name}
                                    onChange={(e) => handleBuyerFieldChange('name', e.target.value)}
                                    autoComplete="name"
                                    className={inputClass}
                                    placeholder="Quien recibe o retira el pedido"
                                  />
                                </label>

                                {/* Email / Teléfono — 1 col en mobile, 2 col en sm+ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <label className={labelClass}>
                                    Email <span className="text-red-400">*</span>
                                    <input
                                      type="email"
                                      value={buyerForm.email}
                                      onChange={(e) =>
                                        handleBuyerFieldChange('email', e.target.value)
                                      }
                                      autoComplete="email"
                                      className={inputClass}
                                      placeholder="mail@ejemplo.com"
                                    />
                                  </label>
                                  <label className={labelClass}>
                                    Teléfono <span className="text-red-400">*</span>
                                    <input
                                      type="tel"
                                      value={buyerForm.phone}
                                      onChange={(e) =>
                                        handleBuyerFieldChange('phone', e.target.value)
                                      }
                                      autoComplete="tel"
                                      className={inputClass}
                                      placeholder="Teléfono de contacto"
                                    />
                                  </label>
                                </div>

                                {/* Documento / Número — siempre 2 columnas */}
                                <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
                                  <label className={labelClass}>
                                    Documento <span className="text-red-400">*</span>
                                    <select
                                      value={buyerForm.documentType}
                                      onChange={(e) =>
                                        handleBuyerFieldChange('documentType', e.target.value)
                                      }
                                      className={inputClass}
                                    >
                                      <option value="DNI">DNI</option>
                                      <option value="CUIT">CUIT</option>
                                      <option value="CUIL">CUIL</option>
                                      <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                  </label>
                                  <label className={labelClass}>
                                    Número <span className="text-red-400">*</span>
                                    <input
                                      type="text"
                                      value={buyerForm.documentNumber}
                                      onChange={(e) =>
                                        handleBuyerFieldChange('documentNumber', e.target.value)
                                      }
                                      className={inputClass}
                                      placeholder="Número de documento"
                                    />
                                  </label>
                                </div>

                                {deliveryMethod === 'envio' && (
                                  <>
                                    <label className={labelClass}>
                                      Dirección <span className="text-red-400">*</span>
                                      <input
                                        type="text"
                                        value={buyerForm.address}
                                        onChange={(e) =>
                                          handleBuyerFieldChange('address', e.target.value)
                                        }
                                        autoComplete="street-address"
                                        className={inputClass}
                                        placeholder="Calle, número, piso/depto"
                                      />
                                    </label>

                                    {/* Ciudad / CP — 2 columnas */}
                                    <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                                      <label className={labelClass}>
                                        Ciudad / Localidad <span className="text-red-400">*</span>
                                        <input
                                          type="text"
                                          value={buyerForm.city}
                                          onChange={(e) => handleBuyerFieldChange('city', e.target.value)}
                                          autoComplete="address-level2"
                                          className={inputClass}
                                          placeholder="Ej: Mar del Plata"
                                        />
                                      </label>
                                      <label className={labelClass}>
                                        Cód. Postal <span className="text-red-400">*</span>
                                        <input
                                          type="text"
                                          value={buyerForm.postalCode}
                                          onChange={(e) => handleBuyerFieldChange('postalCode', e.target.value)}
                                          autoComplete="postal-code"
                                          maxLength={8}
                                          className={inputClass}
                                          placeholder="7600"
                                        />
                                      </label>
                                    </div>
                                  </>
                                )}

                                <label className={labelClass}>
                                  Observaciones
                                  <textarea
                                    value={buyerForm.notes}
                                    onChange={(e) =>
                                      handleBuyerFieldChange('notes', e.target.value)
                                    }
                                    rows={2}
                                    className={inputClass}
                                    placeholder="Retiro, horario o comentario útil para el pedido"
                                  />
                                </label>

                              </div>
                            </div>
                          )}

                          {/* Sección de envío / retiro */}
                          {deliveryMethod === 'retiro' ? (
                            <div className="mt-4 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-4">
                              <div className="flex items-center gap-2 mb-2">
                                <BuildingStorefrontIcon className="h-4 w-4 text-[#a68a5c] flex-shrink-0" />
                                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Retiro en local</p>
                              </div>
                              <p className="text-sm font-semibold text-neutral-800">Pilmaiquén 292, Bahía Blanca</p>
                              <p className="text-xs text-neutral-500 mt-0.5">CP 8000 · Una vez confirmado el pedido, te contactamos para coordinar el horario de retiro.</p>
                              <p className="mt-3 text-sm font-semibold text-green-600">Sin costo de envío</p>
                            </div>
                          ) : (
                            <ShippingEstimate
                              province={buyerForm.province}
                              city={buyerForm.city}
                              postalCode={buyerForm.postalCode}
                              subtotal={subtotal}
                              onProvinceChange={(p) => handleBuyerFieldChange('province', p)}
                            />
                          )}

                        </div>
                      )}
                    </div>

                    {/* ── FOOTER (fijo abajo, siempre al alcance del pulgar) ── */}
                    {cart.length > 0 && (
                      <div className="flex-shrink-0 z-10 border-t border-neutral-200 bg-white px-6 py-5">
                        {(() => {
                          const shippingCost = deliveryMethod === 'retiro' ? 0 : getShippingCost(buyerForm.province, subtotal, buyerForm.city, buyerForm.postalCode);
                          const total = subtotal + (shippingCost ?? 0);
                          return (
                            <>
                              <div className="flex items-baseline justify-between mb-1">
                                <p className="text-xs font-serif uppercase tracking-[0.2em] text-neutral-500">Productos</p>
                                <p className="text-sm font-serif text-neutral-600">${subtotal.toLocaleString('es-AR')}</p>
                              </div>
                              {shippingCost !== null && (
                                <div className="flex items-baseline justify-between mb-1">
                                  <p className="text-xs font-serif uppercase tracking-[0.2em] text-neutral-500">Envío</p>
                                  <p className="text-sm font-serif">
                                    {shippingCost === 0
                                      ? <span className="text-green-600 font-semibold">Gratis</span>
                                      : <span className="text-neutral-600">${shippingCost.toLocaleString('es-AR')}</span>
                                    }
                                  </p>
                                </div>
                              )}
                              <div className="flex items-baseline justify-between mb-4">
                                <p className="text-xs font-serif uppercase tracking-[0.2em] text-neutral-500">Total</p>
                                <p className="text-xl font-serif text-neutral-800">${total.toLocaleString('es-AR')}</p>
                              </div>
                              {deliveryMethod === 'envio' && shippingCost === null && (
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest italic mb-2">
                                  Seleccioná tu provincia para ver el costo de envío.
                                </p>
                              )}
                            </>
                          );
                        })()}

                        {checkoutError && (
                          <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-red-600">
                            {checkoutError}
                          </p>
                        )}

                        {/* Separador de métodos de pago */}
                        <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-neutral-400 text-center">
                          Elegí cómo pagar
                        </p>

                        {/* Transferencia bancaria */}
                        <button
                          type="button"
                          onClick={() => void handleTransferenciaCheckout()}
                          disabled={checkoutLoading || openPayLoading || transferLoading}
                          className="group relative w-full flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                        >
                          <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                          <span className="relative z-10">
                            {transferLoading ? 'Procesando...' : 'Transferencia — 10% OFF desde $150.000'}
                          </span>
                        </button>
                        <p className="mb-2 text-center text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                          {transferDiscountEligible
                            ? 'Descuento activo para este carrito por transferencia.'
                            : `Te faltan $${missingForTransferDiscount.toLocaleString('es-AR')} para el 10% OFF en transferencia.`}
                        </p>

                        {/* Mercado Pago */}
                        <button
                          type="button"
                          onClick={() => void handleCheckout()}
                          disabled={checkoutLoading || openPayLoading || transferLoading}
                          className="group relative w-full flex items-center justify-center gap-2 overflow-hidden border border-[#009ee3] bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-[#009ee3] transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                        >
                          <span className="absolute inset-0 z-0 bg-[#009ee3] transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                          <SiMercadopago className="relative z-10 h-4 w-4 flex-shrink-0" />
                          <span className="relative z-10">
                            {checkoutLoading ? 'Generando...' : 'Mercado Pago'}
                          </span>
                        </button>

                        {/* OpenPay (BBVA) */}
                        <button
                          type="button"
                          onClick={() => void handleOpenPayCheckout()}
                          disabled={checkoutLoading || openPayLoading || transferLoading}
                          className="group relative w-full flex items-center justify-center overflow-hidden border border-neutral-800 bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-800 transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-0 z-0 bg-neutral-800 transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                          <span className="relative z-10">
                            {openPayLoading ? 'Generando...' : 'Tarjetas / Débito'}
                          </span>
                        </button>

                        {/* Logos tarjetas OpenPay */}
                        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                          <SiVisa className="h-4 w-auto text-[#1a1f71]" title="Visa" />
                          <SiMastercard className="h-4 w-auto text-[#eb001b]" title="Mastercard" />
                          <SiAmericanexpress className="h-4 w-auto text-[#2e77bc]" title="American Express" />
                          {['Cabal', 'Naranja', 'Maestro'].map((brand) => (
                            <span key={brand} className="rounded border border-neutral-200 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-neutral-400">{brand}</span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}