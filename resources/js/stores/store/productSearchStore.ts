import { create } from 'zustand';
import { StoreProduct } from '@/types';
import { z } from 'zod';
import { productApi } from '@/api/productApi';
import { cartApi } from '@/api/cartApi';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

// Validation schemas
const filterSchema = z.object({
    name: z.string().optional(),
    minPrice: z.number().min(0, 'Minimum price cannot be negative'),
    maxPrice: z.number().min(0, 'Maximum price cannot be negative'),
    sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest']),
    category: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    inStock: z.boolean().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface ProductSearchState {
    products: StoreProduct[];
    filters: FilterValues;
    isLoading: boolean;
    isSidebarOpen: boolean;
    error: string | null;
    loadProducts: () => Promise<void>;
    setProducts: (products: StoreProduct[] | null) => void;
    setFilters: (newFilters: Partial<FilterValues>) => void;
    resetFilters: () => void;
    setIsLoading: (loading: boolean) => void;
    setIsSidebarOpen: (open: boolean) => void;
    handleProductClick: (productId: number | null) => void;
    handleAddToCart: (product: StoreProduct | null, e?: React.MouseEvent) => Promise<void>;
    getLowestPrice: (product: StoreProduct | null) => number;
    getProductRating: (product: StoreProduct | null) => number;
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
    // State
    products: [],
    filters: defaultFilters,
    isLoading: false,
    isSidebarOpen: false,
    error: null,

    // Actions
    loadProducts: async () => {
        const { filters, setIsLoading, setProducts, setError } = get();
        if (!filters) {
            setError('Invalid filter configuration');
            return;
        }

        setIsLoading(true);
        try {
            const validatedFilters = filterSchema.parse(filters);
            const data = await productApi.searchProducts(validatedFilters);
            if (!data?.products) {
                throw new Error('No products data received from API');
            }
            setProducts(data.products);
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError('Invalid filter values: ' + error.errors.map(e => e.message).join(', '));
            } else {
                console.error('Failed to load products:', error);
                setError('Failed to load products');
            }
        } finally {
            setIsLoading(false);
        }
    },

    setProducts: (products) => {
        if (!products) {
            set({ error: 'Cannot set null products array', products: [] });
            return;
        }
        if (!Array.isArray(products)) {
            set({ error: 'Products must be an array', products: [] });
            return;
        }
        set({ products, error: null });
    },

    setError: (error: string | null) => set({ error }),

    setFilters: (newFilters) => {
        if (!newFilters) {
            console.error('setFilters: No filter values provided');
            return;
        }

        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };

        try {
            filterSchema.parse(updatedFilters);
            set({ filters: updatedFilters, error: null });
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Invalid filter values:', error.errors);
                set({ error: 'Invalid filter values' });
            }
        }
    },

    resetFilters: () => set({ filters: defaultFilters, error: null }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

    handleProductClick: (productId) => {
        if (!productId) {
            console.error('handleProductClick: No product ID provided');
            return;
        }
        router.visit(`/product/${productId}`);
    },

    handleAddToCart: async (product, e) => {
        if (e) {
            e.stopPropagation();
        }

        if (!product) {
            toast.error('Cannot add to cart: Invalid product');
            return;
        }

        const availableSubproduct = product.subproducts?.find(sp => sp.available);
        if (!availableSubproduct) {
            toast.error('No available options for this product');
            return;
        }

        try {
            const response = await cartApi.addItem(availableSubproduct.id);
            if (!response?.result?.headers?.['x-message']) {
                throw new Error('Invalid response from cart API');
            }
            toast.success(response.result.headers['x-message']);
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error('Failed to add item to cart');
        }
    },

    getLowestPrice: (product) => {
        if (!product) return 0;
        if (!product.subproducts || !Array.isArray(product.subproducts)) return 0;
        return Math.min(...product.subproducts.map(sp => sp.price));
    },

    getProductRating: (product) => {
        if (!product) return 0;
        
        if (typeof product.average_rating === 'number') {
            return product.average_rating;
        }

        if (!product.reviews || !Array.isArray(product.reviews) || product.reviews.length === 0) {
            return 0;
        }

        const total = product.reviews.reduce((acc, review) => {
            if (typeof review.rating !== 'number') return acc;
            return acc + review.rating;
        }, 0);

        return total / product.reviews.length;
    }
}));