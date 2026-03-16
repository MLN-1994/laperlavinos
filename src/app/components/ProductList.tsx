"use client";

import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { PRODUCTS } from '../../data/products';
import { CheckIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-10 text-gray-900 tracking-tight">
                Destacados de la semana
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
            </div>
        </div>
    );
}

function ProductCard({ product, addToCart }: { product: any, addToCart: any }) {
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">
                        {product.category}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1 italic">
                    {product.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                        ${product.price.toLocaleString('es-AR')}
                    </span>
                    <button 
                        onClick={handleAdd}
                        disabled={isAdded}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                            isAdded 
                                ? 'bg-green-500 text-white scale-105' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {isAdded ? (
                            <>
                                <CheckIcon className="h-5 w-5" />
                                ¡Listo!
                            </>
                        ) : (
                            <>
                                <ShoppingCartIcon className="h-5 w-5" />
                                Agregar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}