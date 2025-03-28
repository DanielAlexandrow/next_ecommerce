import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductCard } from '@/components/Store/ProductCard/ProductCard';
import { StoreProduct } from '@/types';

// Test data factory
const createTestProduct = (overrides = {}): StoreProduct => ({
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    available: true,
    images: [{
        id: 1,
        name: 'test.jpg',
        path: '/storage/images/test.jpg',
        pivot: { image_id: 1 }
    }],
    categories: [{
        id: 1,
        name: 'Test Category',
        pivot: { category_id: 1 }
    }],
    brand: {
        id: 1,
        name: 'Test Brand'
    },
    subproducts: [{
        id: 1,
        name: 'Test Subproduct',
        product_id: 1,
        price: 100,
        available: true
    }],
    reviews: [],
    average_rating: 0,
    ...overrides
});

describe('ProductCard', () => {
    let mockProduct: StoreProduct;

    beforeEach(() => {
        mockProduct = createTestProduct();
    });

    it('displays product name and price', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('100.00', { exact: false })).toBeInTheDocument();
    });

    it('shows in stock badge when product is available', () => {
        const availableProduct = createTestProduct({
            subproducts: [{
                id: 1,
                name: 'Test Subproduct',
                product_id: 1,
                price: 100,
                available: true
            }]
        });
        render(<ProductCard product={availableProduct} />);
        expect(screen.getByText(/in stock/i)).toBeInTheDocument();
    });

    it('hides in stock badge when product is unavailable', () => {
        const unavailableProduct = createTestProduct({
            subproducts: [{
                id: 1,
                name: 'Test Subproduct',
                product_id: 1,
                price: 100,
                available: false
            }]
        });
        render(<ProductCard product={unavailableProduct} />);
        expect(screen.queryByText(/in stock/i)).not.toBeInTheDocument();
    });

    it('shows product image', () => {
        render(<ProductCard product={mockProduct} />);
        const image = screen.getByRole('img') as HTMLImageElement;
        expect(image.src).toContain('test.jpg');
    });

    it('shows lowest price from subproducts', () => {
        const productWithMultiplePrices = createTestProduct({
            subproducts: [
                { id: 1, name: 'Expensive', product_id: 1, price: 200, available: true },
                { id: 2, name: 'Cheap', product_id: 1, price: 50, available: true }
            ]
        });

        render(<ProductCard product={productWithMultiplePrices} />);
        expect(screen.getByText('50.00', { exact: false })).toBeInTheDocument();
    });

    it('shows placeholder image when no images available', () => {
        const productWithoutImages = createTestProduct({ images: [] });
        render(<ProductCard product={productWithoutImages} />);
        const image = screen.getByRole('img') as HTMLImageElement;
        expect(image.src).toContain('placeholder');
    });
}); 