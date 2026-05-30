
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


// Definimos qué tiene cada producto en el carrito (el producto + la cantidad)
interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: number | null;
  quantity: number;
}


interface CartState {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
  cart: [],

  addToCart: (product) => set((state) => {
    const stockValue = Number(product.stock);
    const hasFiniteStock = Number.isFinite(stockValue);
    const maxAllowed = hasFiniteStock ? Math.max(0, Math.floor(stockValue)) : null;

    const existingItem = state.cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (maxAllowed !== null && existingItem.quantity >= maxAllowed) {
        return state;
      }

      return {
        cart: state.cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                stock: product.stock ?? item.stock,
              }
            : item
        ),
      };
    }

    if (maxAllowed !== null && maxAllowed <= 0) {
      return state;
    }

    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  decreaseQuantity: (id) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === id);
    if (existingItem && existingItem.quantity > 1) {
      return {
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        ),
      };
    }
    return { cart: state.cart.filter((item) => item.id !== id) };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),

  clearCart: () => set({ cart: [] }),
    }),
    { name: 'laperla-cart' }
  )
);