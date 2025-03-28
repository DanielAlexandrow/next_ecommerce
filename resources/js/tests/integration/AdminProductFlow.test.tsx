import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';
import ProductList from '@/components/Admin/ProductList';
import ImageUpload from '@/components/Admin/ImageUpload';
import { useProductStore } from '@/stores/productStore';
import { useImageStore } from '@/stores/imageStore';
import type { Product, ProductImage } from '@/types';

// Mock the stores
vi.mock('@/stores/productStore');
vi.mock('@/stores/imageStore');

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);

const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: [],
    categories: [],
    available: true,
    brand: { id: 1, name: 'Test Brand' },
    subproducts: [],
    category_id: 1
};

const mockNewProduct: Partial<Product> = {
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    category_id: 1,
    available: true,
    images: [],
    categories: [],
    brand: { id: 1, name: 'Test Brand' },
    subproducts: []
};

describe('Admin Product Management Flow', () => {
    beforeEach(() => {
        // Reset store states
        useProductStore.setState({
            products: [],
            isLoading: false,
            createProduct: vi.fn(),
            updateProduct: vi.fn(),
            deleteProduct: vi.fn()
        });

        useImageStore.setState({
            images: [],
            uploadImage: vi.fn(),
            deleteImage: vi.fn()
        });
    });

    it('should create new product with images', async () => {
        const createProduct = vi.fn().mockResolvedValue(mockProduct);
        const mockImage: ProductImage = {
            id: 1,
            name: 'test-image.jpg',
            url: 'test-image.jpg',
            path: '/images/test-image.jpg',
            product_id: 1
        };
        const uploadImage = vi.fn().mockResolvedValue(mockImage);

        useProductStore.setState({ createProduct });
        useImageStore.setState({ uploadImage });

        render(
            <>
                <ProductForm mode="new" product={mockNewProduct} />
                <ImageUpload onUpload={uploadImage} />
            </>
        );

        // Fill product form
        fireEvent.change(screen.getByLabelText(/name/i), {
            target: { value: mockProduct.name }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: mockProduct.description }
        });
        fireEvent.change(screen.getByLabelText(/price/i), {
            target: { value: mockProduct.price }
        });
        fireEvent.change(screen.getByLabelText(/category/i), {
            target: { value: mockProduct.category_id }
        });

        // Upload image
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const input = screen.getByLabelText(/upload image/i);
        fireEvent.change(input, { target: { files: [file] } });

        // Submit form
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        // Verify product creation and image upload
        await waitFor(() => {
            expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
                name: mockProduct.name,
                description: mockProduct.description,
                price: mockProduct.price,
                category_id: mockProduct.category_id
            }));
            expect(uploadImage).toHaveBeenCalled();
        });
    });

    it('should edit existing product', async () => {
        const updateProduct = vi.fn().mockResolvedValue({
            ...mockProduct,
            name: 'Updated Product',
            description: 'New Description'
        });

        useProductStore.setState({
            products: [mockProduct],
            updateProduct
        });

        render(<ProductForm mode="edit" product={mockProduct} />);

        // Update form fields
        fireEvent.change(screen.getByLabelText(/name/i), {
            target: { value: 'Updated Product' }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: 'New Description' }
        });

        // Submit form
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        // Verify product update
        await waitFor(() => {
            expect(updateProduct).toHaveBeenCalledWith(1, expect.objectContaining({
                name: 'Updated Product',
                description: 'New Description'
            }));
        });
    });

    it('should delete product with confirmation', async () => {
        const deleteProduct = vi.fn().mockResolvedValue({ success: true });

        useProductStore.setState({
            products: [mockProduct],
            deleteProduct
        });

        render(<ProductList products={[mockProduct]} onDelete={deleteProduct} />);

        // Click delete button
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        // Verify product deletion
        await waitFor(() => {
            expect(deleteProduct).toHaveBeenCalledWith(1);
        });
    });

    it('should show validation errors in product form', async () => {
        render(<ProductForm mode="new" product={mockNewProduct} />);

        // Submit empty form
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        // Verify validation errors
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/price is required/i)).toBeInTheDocument();
            expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        });
    });

    it('should handle image upload errors', async () => {
        const uploadImage = vi.fn().mockRejectedValue(new Error('Upload failed'));

        useImageStore.setState({ uploadImage });

        render(<ImageUpload onUpload={uploadImage} onError={console.error} />);

        // Attempt image upload
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const input = screen.getByLabelText(/upload image/i);
        fireEvent.change(input, { target: { files: [file] } });

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
        });
    });
}); 