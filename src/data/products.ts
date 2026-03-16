// src/data/products.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Malbec Reserva",
    price: 9500,
    description: "Vino tinto Malbec de gran cuerpo, con notas a ciruela y vainilla. Ideal para carnes rojas.",
    image: "https://images.unsplash.com/photo-1610631787813-9eeb1a2386cc?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Tinto"
  },
  {
    id: 2,
    name: "Chardonnay Premium",
    price: 8700,
    description: "Vino blanco Chardonnay fresco, con aromas a frutas tropicales y un final suave.",
    image: "https://images.unsplash.com/photo-1611571940159-425a28706d6f?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Blanco"
  },
  {
    id: 3,
    name: "Cabernet Sauvignon Gran Reserva",
    price: 12000,
    description: "Cabernet Sauvignon intenso, con taninos firmes y notas a pimiento y especias.",
    image: "https://plus.unsplash.com/premium_photo-1725075087044-5c76af72aaa6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Tinto"
  }
];