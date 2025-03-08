import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteSubproductModal from '@/components/Admin/DeleteSubproductModal/DeleteSubproductModal';
import { subproductApi } from '@/api/subproductApi';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('@/api/subproductApi', () => ({
    subproductApi: {
        deleteSubproduct: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('DeleteSubproductModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        subproductId: 1,
        subproductName: 'Test Variant',
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders delete subproduct modal correctly', () => {
        render(<DeleteSubproductModal {...mockProps} />);

        expect(screen.getByText('Delete Product Variant')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete "Test Variant"/)).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('handles subproduct deletion successfully', async () => {
        vi.mocked(subproductApi.deleteSubproduct).mockResolvedValueOnce({});

        render(<DeleteSubproductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Variant/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(subproductApi.deleteSubproduct).toHaveBeenCalledWith(mockProps.subproductId);
            expect(toast.success).toHaveBeenCalledWith('Variant deleted successfully');
            expect(mockProps.onDelete).toHaveBeenCalled();
            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles deletion error gracefully', async () => {
        vi.mocked(subproductApi.deleteSubproduct).mockRejectedValueOnce(new Error('API Error'));

        render(<DeleteSubproductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Variant/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(subproductApi.deleteSubproduct).toHaveBeenCalledWith(mockProps.subproductId);
            expect(toast.error).toHaveBeenCalledWith('Failed to delete variant');
        });
    });

    it('closes modal when cancel is clicked', () => {
        render(<DeleteSubproductModal {...mockProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('shows loading state during deletion', async () => {
        vi.mocked(subproductApi.deleteSubproduct).mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<DeleteSubproductModal {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /Delete Variant/i });
        fireEvent.click(deleteButton);

        expect(screen.getByText('Deleting...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });
});