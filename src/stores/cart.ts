import { create } from "zustand";

interface CartState {
  productId: string | null;
  setProduct: (id: string | null) => void;
}

// Cart state: only holds one product at a time (Artelier sells unique pieces)
export const useCartStore = create<CartState>((set) => ({
  productId: null,
  setProduct: (id) => set({ productId: id }),
}));
