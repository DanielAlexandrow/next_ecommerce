import { create } from 'zustand';
import { StoreProduct } from '@/types';
import { z } from 'zod';
import { productApi } from '@/api/productApi';
import { cartApi } from '@/api/cartApi';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

// Filter Schema
export const filterSchema = z.object({
    name: z.string(),
    minPrice: z.number().min(0),
    maxPrice: z.number().min(0),
    sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest']),
    category: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    inStock: z.boolean().optional(),
});

export type FilterValues = z.infer<typeof filterSchema>;

interface ProductSearchState {
    // Products
    products: StoreProduct[];
    setProducts: (products: StoreProduct[]) => void;
    loadProducts: () => Promise<void>;

    // Product Actions
    handleProductClick: (productId: number) => void;
    handleAddToCart: (product: StoreProduct, e?: React.MouseEvent) => Promise<void>;
    getLowestPrice: (product: StoreProduct) => number;
    getProductRating: (product: StoreProduct) => number;

    // Filters
    filters: FilterValues;
    setFilters: (filters: Partial<FilterValues>) => void;
    resetFilters: () => void;

    // UI State
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

const defaultFilters: FilterValues = {
    name: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'newest',
    category: undefined,
    rating: undefined,
    inStock: undefined,
};

export const useProductSearchStore = create<ProductSearchState>((set, get) => ({
    // Products
    products: [],
    setProducts: (products) => set({ products }),

    loadProducts: async () => {
        const { filters, setIsLoading, setProducts } = get();
        setIsLoading(true);
        try {
            const data = await productApi.searchProducts(filters);
            setProducts(data.products);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    },

    // Product Actions
    handleProductClick: (productId: number) => {
        router.visit(`/product/${productId}`);
    },

    handleAddToCart: async (product: StoreProduct, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            const availableSubproduct = product.subproducts.find(sp => sp.available);
            if (!availableSubproduct) {
                toast.error('No available options for this product');
                return;
            }

            const response = await cartApi.addItem(availableSubproduct.id);
            toast.success(response.result.headers['x-message']);
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error('Failed to add item to cart');
        }
    },

    getLowestPrice: (product: StoreProduct) => {
        return Math.min(...product.subproducts.map(sp => sp.price));
    },

    getProductRating: (product: StoreProduct) => {
        return product.average_rating ??
            (product.reviews?.length ?
                product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
                : 0);
    },

    // Filters
    filters: defaultFilters,
    setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    resetFilters: () => set({ filters: defaultFilters }),

    // UI State
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    isSidebarOpen: false,
    setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
})); 