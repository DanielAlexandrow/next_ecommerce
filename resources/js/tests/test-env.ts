import { useProductSearchStore } from '@/stores/store/productSearchStore';
import { StoreProduct, ProductImage, ProductCategory, Subproduct } from '@/types';

// Test environment configuration
export const testEnv = {
    // Test data
    mockProducts: [
        {
            id: 1,
            name: 'Test Product 1',
            description: 'Description 1',
            available: true,
            brand: { id: 1, name: 'Brand 1' },
            categories: [{
                id: 1,
                name: 'Category 1',
                pivot: { category_id: 1 }
            }] as ProductCategory[],
            images: [{
                id: 1,
                name: 'test1.jpg',
                path: '/storage/images/test1.jpg',
                pivot: { image_id: 1 }
            }] as ProductImage[],
            subproducts: [
                {
                    id: 1,
                    name: 'Sub 1',
                    product_id: 1,
                    price: 100,
                    available: true
                }
            ] as Subproduct[],
            reviews: [],
            average_rating: 0
        },
        {
            id: 2,
            name: 'Test Product 2',
            description: 'Description 2',
            available: false,
            brand: { id: 1, name: 'Brand 1' },
            categories: [{
                id: 2,
                name: 'Category 2',
                pivot: { category_id: 2 }
            }] as ProductCategory[],
            images: [{
                id: 2,
                name: 'test2.jpg',
                path: '/storage/images/test2.jpg',
                pivot: { image_id: 2 }
            }] as ProductImage[],
            subproducts: [
                {
                    id: 2,
                    name: 'Sub 2',
                    product_id: 2,
                    price: 200,
                    available: false
                }
            ] as Subproduct[],
            reviews: [],
            average_rating: 0
        }
    ] as StoreProduct[],

    // Store helpers
    setupProductStore() {
        const store = useProductSearchStore.getState();
        store.resetFilters();
        store.setProducts(this.mockProducts);
        store.setIsLoading(false);
        return store;
    },

    clearProductStore() {
        const store = useProductSearchStore.getState();
        store.resetFilters();
        store.setProducts([]);
        store.setIsLoading(false);
    },

    // Test data helpers
    getProductById(id: number) {
        return this.mockProducts.find(p => p.id === id);
    },

    getAvailableProducts() {
        return this.mockProducts.filter(p => p.available);
    },

    getUnavailableProducts() {
        return this.mockProducts.filter(p => !p.available);
    },
};

export default testEnv; 