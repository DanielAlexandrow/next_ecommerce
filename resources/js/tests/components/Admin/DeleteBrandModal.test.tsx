import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DeleteBrandModal from '@/components/Admin/DeleteBrandModal/DeleteBrandModal';
import { brandApi } from '@/api/brandApi';
import { toast } from 'react-toastify';
import { useBrandStore } from '@/stores/useBrandStore';
import type { Brand } from '@/types';

// Mock brandApi
vi.mock('@/api/brandApi', () => ({
    brandApi: {
        deleteBrand: vi.fn()
    }
}));

// Mock toast
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

// Mock brand store
const mockUseBrandStore = vi.fn(() => ({
    openDeleteModal: true,
    setOpenDeleteModal: vi.fn(),
    brands: [] as Brand[],
    setBrands: vi.fn(),
    modalBrand: { id: 1, name: 'Test Brand' } as Brand
}));

vi.mock('@/stores/useBrandStore', () => ({
    useBrandStore: () => mockUseBrandStore()
}));

// Mock Dialog components
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open, onOpenChange }: any) => (
        <div role="dialog" data-state={open ? 'open' : 'closed'} onClick={() => onOpenChange?.(false)}>
            {children}
        </div>
    ),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <h2>{children}</h2>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>
}));

describe('DeleteBrandModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders delete confirmation dialog correctly', () => {
        render(<DeleteBrandModal />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText(/Do you really want to delete/)).toBeInTheDocument();
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('handles brand deletion successfully', async () => {
        const setOpenDeleteModal = vi.fn();
        const setBrands = vi.fn();
        mockUseBrandStore.mockReturnValue({
            openDeleteModal: true,
            setOpenDeleteModal,
            brands: [{ id: 1, name: 'Test Brand' }],
            setBrands,
            modalBrand: { id: 1, name: 'Test Brand' }
        });

        (brandApi.deleteBrand as any).mockResolvedValueOnce({});

        render(<DeleteBrandModal />);

        const deleteButton = screen.getByRole('button', { name: 'Delete' });

        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(brandApi.deleteBrand).toHaveBeenCalledWith(1);
        expect(toast.success).toHaveBeenCalledWith('Brand deleted successfully');
        expect(setOpenDeleteModal).toHaveBeenCalledWith(false);
        expect(setBrands).toHaveBeenCalledWith([]);
    });

    it('handles API errors gracefully', async () => {
        const mockError = new Error('API Error');
        (brandApi.deleteBrand as any).mockRejectedValueOnce(mockError);

        render(<DeleteBrandModal />);

        const deleteButton = screen.getByRole('button', { name: 'Delete' });

        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(brandApi.deleteBrand).toHaveBeenCalledWith(1);
        expect(toast.error).toHaveBeenCalledWith('Error deleting brand');
    });

    it('closes modal when clicking cancel', async () => {
        const setOpenDeleteModal = vi.fn();
        mockUseBrandStore.mockReturnValue({
            openDeleteModal: true,
            setOpenDeleteModal,
            brands: [],
            setBrands: vi.fn(),
            modalBrand: { id: 1, name: 'Test Brand' }
        });

        render(<DeleteBrandModal />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });

        await act(async () => {
            fireEvent.click(cancelButton);
        });

        expect(setOpenDeleteModal).toHaveBeenCalledWith(false);
        expect(brandApi.deleteBrand).not.toHaveBeenCalled();
    });
});