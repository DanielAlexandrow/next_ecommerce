import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteProductModal from '@/components/Admin/DeleteProductModal/DeleteProductModal';
import { productApi } from '@/api/productApi';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('@/api/productApi', () => ({
    productApi: {
        deleteProduct: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('DeleteProductModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        productId: 1,
        productName: 'Test Product',
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders delete product modal correctly', () => {
        render(<DeleteProductModal {...mockProps} />);

        expect(screen.getByRole('heading', { name: 'Delete Product' })).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete "Test Product"/)).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('handles product deletion successfully', async () => {
        vi.mocked(productApi.deleteProduct).mockResolvedValueOnce({});

        render(<DeleteProductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Product/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(productApi.deleteProduct).toHaveBeenCalledWith(mockProps.productId);
            expect(toast.success).toHaveBeenCalledWith('Product deleted successfully');
            expect(mockProps.onDelete).toHaveBeenCalled();
            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles deletion error gracefully', async () => {
        vi.mocked(productApi.deleteProduct).mockRejectedValueOnce(new Error('API Error'));

        render(<DeleteProductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Product/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(productApi.deleteProduct).toHaveBeenCalledWith(mockProps.productId);
            expect(toast.error).toHaveBeenCalledWith('Failed to delete product');
        });
    });

    it('closes modal when cancel is clicked', () => {
        render(<DeleteProductModal {...mockProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('shows loading state during deletion', async () => {
        vi.mocked(productApi.deleteProduct).mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<DeleteProductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Product/i });
        fireEvent.click(deleteButton);

        expect(screen.getByText('Deleting...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });
});