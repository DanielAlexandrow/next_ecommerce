import { createStore } from 'zustand/vanilla';
import { StoreProduct, Review } from '@/types';
import axios from 'axios';

interface ProductState {
    product: StoreProduct | null;
    selectedOption: any;
    reviews: Review[];
    setProduct: (product: StoreProduct) => void;
    setSelectedOption: (option: any) => void;
    loadReviews: () => Promise<void>;
}

export const useProductStore = createStore<ProductState>((set, get) => ({
    product: null,
    selectedOption: null,
    reviews: [],
    
    setProduct: (product) => {
        set({ 
            product, 
            selectedOption: product.subproducts[0]
        });
    },
    
    setSelectedOption: (option) => {
        set({ selectedOption: option });
    },
    
    loadReviews: async () => {
        const { product } = get();
        if (!product) return;
        
        try {
            const response = await axios.get(`/products/${product.id}/reviews`);
            set({ reviews: response.data.reviews.data });
        } catch (error) {
            console.error('Failed to load reviews:', error);
        }
    }
}));