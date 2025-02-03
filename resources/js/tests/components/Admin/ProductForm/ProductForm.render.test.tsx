import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';
import type { Product } from '@/types';

// Mock child components
vi.mock('@/components/Admin/ProductForm/BrandSelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-brand-select">Brand Select</div>
}));

vi.mock('@/components/Admin/ProductForm/CategorySelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-category-select">Category Select</div>
}));

vi.mock('@/components/Admin/ProductForm/ImageSelect', () => ({
    default: (): JSX.Element => <div data-testid="mock-image-select">Image Select</div>
}));

const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    available: true,
    images: [],
    categories: [],
    brand: { id: 1, name: 'Test Brand' }, // Mock Brand object with id
    price: 10,
    subproducts: [{
        id: 1,
        name: 'Test Subproduct',
        price: 10,
        available: true,
        product_id: 1 // Added product_id here
    }]
};

describe('ProductForm Render Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<ProductForm mode="new" product={mockProduct as Product | undefined} />);

        expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('product-description-input')).toBeInTheDocument();
        expect(screen.getByTestId('product-available-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('mock-brand-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-category-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-image-select')).toBeInTheDocument();
    });

    it('handles edit mode with existing product data', () => {
        const existingProduct = {
            ...mockProduct,
            name: 'Existing Product',
            description: 'Existing Description',
            available: false
        };

        render(<ProductForm mode="edit" product={existingProduct as Product | undefined} />);

        const nameInput = screen.getByTestId('product-name-input');
        const descriptionInput = screen.getByTestId('product-description-input');
        const availableCheckbox = screen.getByTestId('product-available-checkbox');

        expect(nameInput).toHaveValue('Existing Product');
        expect(descriptionInput).toHaveValue('Existing Description');
        expect(availableCheckbox).not.toBeChecked();
    });
});
