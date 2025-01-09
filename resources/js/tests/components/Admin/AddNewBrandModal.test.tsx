import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AddNewBrandDialog from '@/components/Admin/AddNewBrandModal/AddNewBrandModal';
import { brandApi } from '@/api/brandApi';
import { toast } from 'react-toastify';
import { useBrandStore } from '@/stores/useBrandStore';
import type { Brand } from '@/types';

// Mock brandApi
vi.mock('@/api/brandApi', () => ({
    brandApi: {
        addBrand: vi.fn(),
        updateBrand: vi.fn()
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
    openAddBrandModal: true,
    setOpenAddBrandModal: vi.fn(),
    brands: [] as Brand[],
    setBrands: vi.fn(),
    modalMode: 'add' as 'add' | 'update',
    modalBrand: null as Brand | null
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
}));

describe('AddNewBrandDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseBrandStore.mockReturnValue({
            openAddBrandModal: true,
            setOpenAddBrandModal: vi.fn(),
            brands: [],
            setBrands: vi.fn(),
            modalMode: 'add' as 'add' | 'update',
            modalBrand: null
        });
    });

    it('renders add brand form correctly', () => {
        render(<AddNewBrandDialog />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Add new brand')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('handles brand creation successfully', async () => {
        const mockNewBrand: Brand = { id: 1, name: 'Test Brand' };
        (brandApi.addBrand as any).mockResolvedValueOnce(mockNewBrand);

        render(<AddNewBrandDialog />);

        const input = screen.getByLabelText('Name');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'Test Brand' } });
            fireEvent.click(submitButton);
        });

        expect(brandApi.addBrand).toHaveBeenCalledWith({ name: 'Test Brand' });
        expect(toast.success).toHaveBeenCalledWith('Brand added successfully');
    });

    it('shows validation error for short brand name', async () => {
        render(<AddNewBrandDialog />);

        const input = screen.getByLabelText('Name');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'Te' } });
            fireEvent.click(submitButton);
        });

        expect(await screen.findByText('String must contain at least 4 character(s)')).toBeInTheDocument();
        expect(brandApi.addBrand).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
        const mockError = new Error('API Error');
        (brandApi.addBrand as any).mockRejectedValueOnce(mockError);

        render(<AddNewBrandDialog />);

        const input = screen.getByLabelText('Name');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'Test Brand' } });
            fireEvent.click(submitButton);
        });

        expect(brandApi.addBrand).toHaveBeenCalledWith({ name: 'Test Brand' });
        expect(toast.error).not.toHaveBeenCalled(); // handleFormError is mocked
    });

    it('handles brand update mode correctly', async () => {
        // Override the store mock for update mode
        const existingBrand: Brand = { id: 1, name: 'Existing Brand' };
        mockUseBrandStore.mockReturnValue({
            openAddBrandModal: true,
            setOpenAddBrandModal: vi.fn(),
            brands: [],
            setBrands: vi.fn(),
            modalMode: 'update' as 'add' | 'update',
            modalBrand: existingBrand
        });

        const mockUpdatedBrand: Brand = { id: 1, name: 'Updated Brand' };
        (brandApi.updateBrand as any).mockResolvedValueOnce(mockUpdatedBrand);

        render(<AddNewBrandDialog />);

        expect(screen.getByText('Update brand')).toBeInTheDocument();
        const input = screen.getByLabelText('Name') as HTMLInputElement;
        expect(input.value).toBe('Existing Brand');

        const submitButton = screen.getByRole('button', { name: 'Submit' });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'Updated Brand' } });
            fireEvent.click(submitButton);
        });

        expect(brandApi.updateBrand).toHaveBeenCalledWith(1, { name: 'Updated Brand' });
        expect(toast.success).toHaveBeenCalledWith('Brand updated successfully');
    });
}); 