import { create } from 'zustand';
import { Subproduct, CartItem, Deal } from '@/types';
import cartApi from '@/api/cartApi';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  appliedDeal: Deal | null;
  addToCart: (subproduct: Subproduct) => Promise<void>;
  removeFromCart: (subproductId: number) => Promise<void>;
  updateQuantity: (subproductId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,
  error: null,
  originalTotal: 0,
  discountAmount: 0,
  finalTotal: 0,
  appliedDeal: null,
  
  addToCart: async (subproduct: Subproduct) => {
    set({ loading: true, error: null });
    try {
      const response = await cartApi.addItem(subproduct.id);
      const cartWithDeals = await cartApi.getCartWithDeals();
      set({ 
        items: cartWithDeals.items, 
        originalTotal: cartWithDeals.original_total,
        discountAmount: cartWithDeals.discount_amount,
        finalTotal: cartWithDeals.final_total,
        appliedDeal: cartWithDeals.applied_deal,
        loading: false 
      });
    } catch (error) {
      set({ error: 'Failed to add item to cart', loading: false });
    }
  },
  
  removeFromCart: async (subproductId: number) => {
    set({ loading: true, error: null });
    try {
      await cartApi.removeItem(subproductId);
      const cartWithDeals = await cartApi.getCartWithDeals();
      set({ 
        items: cartWithDeals.items,
        originalTotal: cartWithDeals.original_total,
        discountAmount: cartWithDeals.discount_amount,
        finalTotal: cartWithDeals.final_total,
        appliedDeal: cartWithDeals.applied_deal,
        loading: false 
      });
    } catch (error) {
      set({ error: 'Failed to remove item from cart', loading: false });
    }
  },
  
  updateQuantity: async (subproductId: number, quantity: number) => {
    set({ loading: true, error: null });
    try {
      if (quantity > 0) {
        await cartApi.addItem(subproductId);
      } else {
        await cartApi.removeItem(subproductId);
      }
      const cartWithDeals = await cartApi.getCartWithDeals();
      set({ 
        items: cartWithDeals.items,
        originalTotal: cartWithDeals.original_total,
        discountAmount: cartWithDeals.discount_amount,
        finalTotal: cartWithDeals.final_total,
        appliedDeal: cartWithDeals.applied_deal,
        loading: false 
      });
    } catch (error) {
      set({ error: 'Failed to update item quantity', loading: false });
    }
  },
  
  clearCart: () => {
    set({ 
      items: [], 
      error: null,
      originalTotal: 0,
      discountAmount: 0,
      finalTotal: 0,
      appliedDeal: null 
    });
  },
  
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cartWithDeals = await cartApi.getCartWithDeals();
      set({ 
        items: cartWithDeals.items,
        originalTotal: cartWithDeals.original_total,
        discountAmount: cartWithDeals.discount_amount,
        finalTotal: cartWithDeals.final_total,
        appliedDeal: cartWithDeals.applied_deal,
        loading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch cart', loading: false });
    }
  },
}));
