import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { z } from 'zod';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Add it to the global object
vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock the store
vi.mock('@/stores/store/productSearchStore', () => ({
    useProductSearchStore: vi.fn(),
    filterSchema: z.object({
        name: z.string(),
        minPrice: z.number().min(0),
        maxPrice: z.number().min(0),
        sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest']),
        category: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        inStock: z.boolean().optional(),
    })
}));

// Mock the product API
vi.mock('@/api/productApi', () => ({
    productApi: {
        searchProducts: vi.fn()
    }
}));

// Mock Inertia router
vi.mock('@inertiajs/react', () => ({
    router: {
        visit: vi.fn()
    }
}));

// Mock toast notifications
vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn()
    }
}));

import ProductSearch from '@/pages/store/ProductSearch';
import { useProductSearchStore } from '@/stores/store/productSearchStore';
import { productApi } from '@/api/productApi';
import { StoreProduct } from '@/types';

describe('ProductSearch', () => {
    const mockProducts: StoreProduct[] = [
        {
            id: 1,
            name: 'Test Product 1',
            description: 'Test Description 1',
            images: [{ id: 1, name: 'test1.jpg', path: '/images/test1.jpg', pivot: { image_id: 1 } }],
            subproducts: [
                { id: 1, name: 'Sub 1', product_id: 1, price: 10, available: true }
            ],
            categories: [],
            available: true,
            brand: null
        },
        {
            id: 2,
            name: 'Test Product 2',
            description: 'Test Description 2',
            images: [{ id: 2, name: 'test2.jpg', path: '/images/test2.jpg', pivot: { image_id: 2 } }],
            subproducts: [
                { id: 2, name: 'Sub 2', product_id: 2, price: 20, available: false }
            ],
            categories: [],
            available: false,
            brand: null
        }
    ];

    const defaultFilters = {
        name: '',
        minPrice: 0,
        maxPrice: 1000,
        sortBy: 'newest' as const,
        category: undefined,
        rating: undefined,
        inStock: undefined
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default store state
        (useProductSearchStore as any).mockReturnValue({
            products: mockProducts,
            filters: defaultFilters,
            isLoading: false,
            setProducts: vi.fn(),
            setIsLoading: vi.fn(),
            setFilters: vi.fn(),
            resetFilters: vi.fn(),
            isSidebarOpen: false,
            setIsSidebarOpen: vi.fn(),
            loadProducts: vi.fn(),
            handleProductClick: vi.fn(),
            handleAddToCart: vi.fn(),
            getLowestPrice: vi.fn(),
            getProductRating: vi.fn()
        });

        // Setup default API response
        (productApi.searchProducts as any).mockResolvedValue({
            products: mockProducts
        });
    });

    it('renders product list correctly', async () => {
        render(<ProductSearch />);

        // Check if products are rendered
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();

        // Check if prices are displayed
        expect(screen.getByText('$10')).toBeInTheDocument();
        expect(screen.getByText('$20')).toBeInTheDocument();

        // Check if stock badges are displayed correctly
        expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('shows loading state', async () => {
        (useProductSearchStore as any).mockReturnValue({
            products: [],
            filters: {
                name: '',
                minPrice: 0,
                maxPrice: 1000,
                sortBy: 'newest'
            },
            isLoading: true,
            setProducts: vi.fn(),
            setIsLoading: vi.fn()
        });

        render(<ProductSearch />);

        // Check if loading skeletons are displayed
        const skeletons = screen.getAllByTestId('product-skeleton');
        expect(skeletons).toHaveLength(6);
    });

    it('shows empty state when no products found', async () => {
        (useProductSearchStore as any).mockReturnValue({
            products: [],
            filters: {
                name: '',
                minPrice: 0,
                maxPrice: 1000,
                sortBy: 'newest'
            },
            isLoading: false,
            setProducts: vi.fn(),
            setIsLoading: vi.fn()
        });

        render(<ProductSearch />);

        expect(screen.getByText('No products found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });

    it('loads products when filters change', async () => {
        const setProducts = vi.fn();
        const setIsLoading = vi.fn();

        (useProductSearchStore as any).mockReturnValue({
            products: [],
            filters: {
                name: 'test',
                minPrice: 0,
                maxPrice: 1000,
                sortBy: 'newest'
            },
            isLoading: false,
            setProducts,
            setIsLoading
        });

        render(<ProductSearch />);

        // Verify loading state is managed correctly
        expect(setIsLoading).toHaveBeenCalledWith(true);

        await act(async () => {
            await Promise.resolve();
        });

        // Verify products are set after loading
        expect(setProducts).toHaveBeenCalledWith(mockProducts);
        expect(setIsLoading).toHaveBeenCalledWith(false);
    });
}); 