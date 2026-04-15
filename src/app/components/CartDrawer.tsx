'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
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

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cart, removeFromCart, addToCart, decreaseQuantity } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [buyerForm, setBuyerForm] = useState<CheckoutBuyerInput>(initialBuyerForm);

  const subtotal = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0);

  const handleBuyerFieldChange = <K extends keyof CheckoutBuyerInput>(field: K, value: CheckoutBuyerInput[K]) => {
    setBuyerForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateBuyerForm = () => {
    if (!buyerForm.name.trim()) {
      return 'Ingresa nombre y apellido para continuar.';
    }

    if (!isValidEmail(buyerForm.email.trim())) {
      return 'Ingresa un email valido.';
    }

    if (buyerForm.phone.trim().length < 6) {
      return 'Ingresa un telefono valido.';
    }

    if (!buyerForm.documentType.trim()) {
      return 'Selecciona el tipo de documento.';
    }

    if (buyerForm.documentNumber.trim().length < 5) {
      return 'Ingresa un documento valido.';
    }

    if (buyerForm.address.trim().length < 8) {
      return 'Ingresa una direccion valida para el pedido.';
    }

    return null;
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) {
      return;
    }

    const formError = validateBuyerForm();

    if (formError) {
      setCheckoutError(formError);
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const data = (await response.json()) as { error?: string; initPoint?: string; sandboxInitPoint?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo generar el link de pago.');
      }

      const destination = data.initPoint || data.sandboxInitPoint;

      if (!destination) {
        throw new Error('Mercado Pago no devolvió una URL de checkout.');
      }

      window.location.href = destination;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'No se pudo generar el link de pago.');
      setCheckoutLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={setIsOpen}>
        
        {/* Overlay con desenfoque profundo */}
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
                  {/* Contenedor Principal con estilo de marca */}
                  <div className="flex h-full flex-col bg-[#3c3c3b] shadow-2xl border-l border-[#beb9b1]/10">
                    
                    {/* Header del Carrito */}
                    <div className="px-6 py-6 border-b border-[#beb9b1]/10">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-serif tracking-widest uppercase text-[#beb9b1]">
                          Tu Selección
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-full p-1 text-[#beb9b1] hover:bg-[#beb9b1]/10 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <XMarkIcon className="h-6 w-6" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Lista de Productos */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-[#beb9b1]/40">
                          <ShoppingBagIcon className="h-12 w-12 mb-4 stroke-1" />
                          <p className="text-sm font-light italic">Tu cava está vacía</p>
                        </div>
                      ) : (
                        <ul role="list" className="divide-y divide-[#beb9b1]/5">
                          {cart.map((product) => (
                            <li key={product.id} className="flex py-6 transition-opacity">
                              {/* Imagen del producto */}
                              <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-[#1a1a1a] border border-[#beb9b1]/10">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-sm font-serif tracking-tight text-[#beb9b1]">
                                    <h3 className="line-clamp-1 uppercase">{product.name}</h3>
                                    <p className="ml-4 text-[#a68a5c]">${(product.price * product.quantity).toLocaleString('es-AR')}</p>
                                  </div>
                                </div>
                                
                                <div className="flex flex-1 items-end justify-between text-xs">
                                  {/* Selector de cantidad minimalista */}
                                  <div className="flex items-center border border-[#beb9b1]/20 rounded-sm">
                                    <button
                                      onClick={() => decreaseQuantity(product.id)}
                                      className="px-3 py-1 text-[#beb9b1] hover:bg-[#beb9b1]/10 transition"
                                    >
                                      −
                                    </button>
                                    <span className="px-3 py-1 text-[#beb9b1] border-x border-[#beb9b1]/20 min-w-[32px] text-center">
                                      {product.quantity}
                                    </span>
                                    <button
                                      onClick={() => addToCart(product)}
                                      className="px-3 py-1 text-[#beb9b1] hover:bg-[#beb9b1]/10 transition"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(product.id)}
                                    className="text-[#d03416]/70 hover:text-[#d03416] transition-colors flex items-center gap-1"
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

                    {/* Footer con totales */}
                    {cart.length > 0 && (
                      <div className="border-t border-[#beb9b1]/10 px-6 py-8 bg-[#1a1a1a]/30 backdrop-blur-md">
                        <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/35 px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.28em] text-[#beb9b1]/50">Pedido y contacto</p>
                              <p className="mt-1 text-sm font-serif uppercase tracking-[0.12em] text-[#beb9b1]">Tus datos para finalizar</p>
                            </div>
                            <p className="max-w-[9rem] text-right text-[10px] uppercase tracking-[0.18em] text-[#beb9b1]/40">
                              Quedan guardados en el pedido antes de pagar.
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                              Nombre y apellido
                              <input
                                type="text"
                                value={buyerForm.name}
                                onChange={(event) => handleBuyerFieldChange('name', event.target.value)}
                                autoComplete="name"
                                className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                placeholder="Quien recibe o retira el pedido"
                              />
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                                Email
                                <input
                                  type="email"
                                  value={buyerForm.email}
                                  onChange={(event) => handleBuyerFieldChange('email', event.target.value)}
                                  autoComplete="email"
                                  className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                  placeholder="mail@ejemplo.com"
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                                Telefono
                                <input
                                  type="tel"
                                  value={buyerForm.phone}
                                  onChange={(event) => handleBuyerFieldChange('phone', event.target.value)}
                                  autoComplete="tel"
                                  className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                  placeholder="Telefono de contacto"
                                />
                              </label>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                              <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                                Documento
                                <select
                                  value={buyerForm.documentType}
                                  onChange={(event) => handleBuyerFieldChange('documentType', event.target.value)}
                                  className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                >
                                  <option value="DNI">DNI</option>
                                  <option value="CUIT">CUIT</option>
                                  <option value="CUIL">CUIL</option>
                                  <option value="Pasaporte">Pasaporte</option>
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                                Numero
                                <input
                                  type="text"
                                  value={buyerForm.documentNumber}
                                  onChange={(event) => handleBuyerFieldChange('documentNumber', event.target.value)}
                                  className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                  placeholder="Numero de documento"
                                />
                              </label>
                            </div>

                            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                              Direccion
                              <input
                                type="text"
                                value={buyerForm.address}
                                onChange={(event) => handleBuyerFieldChange('address', event.target.value)}
                                autoComplete="street-address"
                                className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                placeholder="Direccion completa o referencia para coordinar"
                              />
                            </label>

                            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                              Observaciones
                              <textarea
                                value={buyerForm.notes}
                                onChange={(event) => handleBuyerFieldChange('notes', event.target.value)}
                                rows={3}
                                className="rounded-sm border border-[#beb9b1]/15 bg-[#24201d] px-3 py-3 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
                                placeholder="Retiro, horario o comentario util para operar el pedido"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm font-serif tracking-[0.2em] uppercase text-[#beb9b1]">
                          <p>Total Estimado</p>
                          <p className="text-lg text-[#a68a5c] tracking-normal">${subtotal.toLocaleString('es-AR')}</p>
                        </div>
                        <p className="mt-2 text-[10px] text-[#beb9b1]/40 uppercase tracking-widest italic">
                          Impuestos y envíos calculados al finalizar.
                        </p>
                        {checkoutError && (
                          <p className="mt-4 rounded border border-[#d03416]/40 bg-[#d03416]/10 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-[#f3c3ba]">
                            {checkoutError}
                          </p>
                        )}
                        <div className="mt-8">
                          <button
                            type="button"
                            onClick={() => void handleCheckout()}
                            disabled={checkoutLoading}
                            className="group relative w-full flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#a68a5c] transition-all hover:text-[#3c3c3b]"
                          >
                            <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                            <span className="relative z-10">{checkoutLoading ? 'Generando Link...' : 'Finalizar Pedido'}</span>
                          </button>
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