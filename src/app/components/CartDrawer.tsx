'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'; // Necesitas instalar @heroicons/react

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart } = useCartStore();

  const subtotal = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={setIsOpen}>
        {/* Fondo oscuro con desenfoque */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30  transition-opacity" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between border-b pb-4">
                        <Dialog.Title className="text-lg font-bold text-gray-900">Carrito de Compras</Dialog.Title>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="sr-only">Cerrar panel</span>
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-8">
                        {cart.length === 0 ? (
                          <p className="text-center text-gray-500 mt-10">Tu carrito está vacío</p>
                        ) : (
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {cart.map((product) => (
                              <li key={product.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{product.name}</h3>
                                      <p className="ml-4">${(product.price * product.quantity).toLocaleString('es-AR')}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    {/* Selector de cantidad profesional */}
                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                      <button
                                        onClick={() => decreaseQuantity(product.id)}
                                        className="px-3 py-1 hover:bg-gray-100 transition text-gray-600 font-bold"
                                      >
                                        −
                                      </button>
                                      <span className="px-3 py-1 font-medium text-gray-900 border-x border-gray-200">
                                        {product.quantity}
                                      </span>
                                      <button
                                        onClick={() => addToCart(product)}
                                        className="px-3 py-1 hover:bg-gray-100 transition text-gray-600 font-bold"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(product.id)}
                                      className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1 ml-2"
                                      title="Eliminar todo"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                        <div className="flex justify-between text-base font-bold text-gray-900">
                          <p>Subtotal</p>
                          <p>${subtotal.toLocaleString('es-AR')}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 font-medium">Envío calculado en el checkout.</p>
                        <div className="mt-6">
                          <button
                            className="w-full flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                          >
                            Ir a Pagar con Mercado Pago
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