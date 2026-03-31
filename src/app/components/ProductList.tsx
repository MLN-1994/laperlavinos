"use client";

import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

import { usePublishedProducts } from '../../hooks/usePublishedProducts';
import ProductCard from "./ProductCard";

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);
    const { productos, loading, error } = usePublishedProducts();

    if (loading) {
        return (
            <section className="rounded-[32px] border border-[#beb9b1]/10 bg-black/20 px-6 py-20 text-center text-sm text-[#beb9b1]/70 backdrop-blur-sm">
                Cargando productos...
            </section>
        );
    }

    if (error) {
        return (
            <section className="rounded-[32px] border border-[#d97b70]/20 bg-[#4a2522]/35 px-6 py-20 text-center text-sm text-[#f0b7ae] backdrop-blur-sm">
                Error: {error}
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="rounded-[32px] border border-[#beb9b1]/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(0,0,0,0.08))] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6 lg:p-8">
                <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#beb9b1]/8 pb-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a68a5c]">Tienda</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#ebe3d2]">Productos</h3>
                    </div>
                    <p className="text-sm text-[#beb9b1]/60">{productos.length} disponibles</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {productos.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        addToCart={() =>
                            addToCart({
                                id: product.id,
                                name: product.nombre,
                                price: product.precio,
                                description: product.descripcion,
                                image: product.imagen_url || "",
                                category: product.categoria_id || "",
                            })
                        }
                    />
                ))}
                </div>
            </div>
        </section>
    );
}

