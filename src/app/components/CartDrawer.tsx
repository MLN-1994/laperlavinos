'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { XMarkIcon, TrashIcon, ShoppingBagIcon, ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { CheckoutBuyerInput } from '@/types/mercadopago';

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
  notes: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// TODO: Integrar API de Andreani aquí.
function ShippingCalculator() {
  return (
    <div className="mt-4 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPinIcon className="h-4 w-4 text-neutral-400" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Costo de envío</p>
      </div>
      <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
        Código Postal
        <input
          type="text"
          maxLength={8}
          placeholder="Ej: 1900"
          className="w-36 rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-neutral-400"
        />
      </label>
      <p className="mt-2 text-[10px] text-neutral-400 italic">
        Cálculo de envío disponible próximamente.
      </p>
    </div>
  );
}

const inputClass =
  'w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-neutral-400';
const labelClass =
  'flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400';

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cart, removeFromCart, addToCart, decreaseQuantity } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [buyerForm, setBuyerForm] = useState<CheckoutBuyerInput>(initialBuyerForm);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const subtotal = cart.reduce((acc: number, item) => acc + item.price * item.quantity, 0);

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
    if (buyerForm.address.trim().length < 8) return 'Ingresa una direccion valida para el pedido.';
    return null;
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
        body: JSON.stringify({
          buyer: {
            name: buyerForm.name.trim(),
            email: buyerForm.email.trim(),
            phone: buyerForm.phone.trim(),
            documentType: buyerForm.documentType.trim(),
            documentNumber: buyerForm.documentNumber.trim(),
            address: buyerForm.address.trim(),
            notes: buyerForm.notes?.trim() || undefined,
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
        }),
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
                            {cart.map((product) => (
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
                                        className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 transition"
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
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Formulario colapsable + Shipping Calculator */}
                      {cart.length > 0 && (
                        <div className="px-6 pb-6">

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
                              <div className="grid gap-3">

                                <label className={labelClass}>
                                  Nombre y apellido
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
                                    Email
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
                                    Teléfono
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
                                    Documento
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
                                    Número
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

                                <label className={labelClass}>
                                  Dirección
                                  <input
                                    type="text"
                                    value={buyerForm.address}
                                    onChange={(e) =>
                                      handleBuyerFieldChange('address', e.target.value)
                                    }
                                    autoComplete="street-address"
                                    className={inputClass}
                                    placeholder="Dirección completa o referencia para coordinar"
                                  />
                                </label>

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

                          {/* Sección de envío — placeholder Andreani */}
                          <ShippingCalculator />

                        </div>
                      )}
                    </div>

                    {/* ── FOOTER (fijo abajo, siempre al alcance del pulgar) ── */}
                    {cart.length > 0 && (
                      <div className="flex-shrink-0 z-10 border-t border-neutral-200 bg-white px-6 py-5">
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-xs font-serif uppercase tracking-[0.2em] text-neutral-500">
                            Total Estimado
                          </p>
                          <p className="text-xl font-serif text-neutral-800">
                            ${subtotal.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest italic mb-4">
                          Impuestos y envíos calculados al finalizar.
                        </p>

                        {checkoutError && (
                          <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-red-600">
                            {checkoutError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleCheckout()}
                          disabled={checkoutLoading}
                          className="group relative w-full flex items-center justify-center overflow-hidden border border-neutral-800 bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-800 transition-all hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-0 z-0 bg-neutral-800 transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                          <span className="relative z-10">
                            {checkoutLoading ? 'Generando Link...' : 'Finalizar Pedido'}
                          </span>
                        </button>
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