"use client";

import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

import { useProductos } from '../../hooks/useProductos';
import ProductCard from "./ProductCard";

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);
    const { productos, loading, error } = useProductos();
    if (loading) return <p>Cargando productos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-10 text-gray-900 tracking-tight">
                Destacados de la semana
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
    );
}

