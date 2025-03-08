import { create } from 'zustand';
import { Subproduct, CartItem } from '@/types';
import { cartApi } from '@/api/cartApi';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (subproduct: Subproduct) => Promise<void>;
  removeFromCart: (subproductId: number) => Promise<void>;
  updateQuantity: (subproductId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  addToCart: async (subproduct: Subproduct) => {
    set({ loading: true, error: null });
    try {
      const response = await cartApi.addItem(subproduct.id);
      set({ items: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to add item to cart', loading: false });
    }
  },
  
  removeFromCart: async (subproductId: number) => {
    set({ loading: true, error: null });
    try {
      const updatedCart = await cartApi.removeItem(subproductId);
      set({ items: updatedCart, loading: false });
    } catch (error) {
      set({ error: 'Failed to remove item from cart', loading: false });
    }
  },
  
  updateQuantity: async (subproductId: number, quantity: number) => {
    set({ loading: true, error: null });
    try {
      // Implement update quantity API call if needed
      const { items } = get();
      const updatedItems = items.map(item => 
        item.id === subproductId ? { ...item, quantity } : item
      );
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ error: 'Failed to update item quantity', loading: false });
    }
  },
  
  clearCart: () => {
    set({ items: [], error: null });
  },
  
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await cartApi.getItems();
      set({ items: response, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cart', loading: false });
    }
  },
}));
