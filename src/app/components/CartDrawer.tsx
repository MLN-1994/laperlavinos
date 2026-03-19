'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { cart, removeFromCart, addToCart, decreaseQuantity } = useCartStore();

  const subtotal = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0);

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
                        <div className="flex justify-between text-sm font-serif tracking-[0.2em] uppercase text-[#beb9b1]">
                          <p>Total Estimado</p>
                          <p className="text-lg text-[#a68a5c] tracking-normal">${subtotal.toLocaleString('es-AR')}</p>
                        </div>
                        <p className="mt-2 text-[10px] text-[#beb9b1]/40 uppercase tracking-widest italic">
                          Impuestos y envíos calculados al finalizar.
                        </p>
                        <div className="mt-8">
                          <button
                            className="group relative w-full flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#a68a5c] transition-all hover:text-[#3c3c3b]"
                          >
                            <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                            <span className="relative z-10">Finalizar Pedido</span>
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