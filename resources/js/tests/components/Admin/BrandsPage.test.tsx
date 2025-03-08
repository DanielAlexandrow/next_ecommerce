import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BrandPage from '@/pages/admin/BrandsPage';
import { usePage } from '@inertiajs/react';
import { useBrandStore } from '@/stores/useBrandStore';
import type { Brand } from '@/types';

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
    Link: ({ children, href }: any) => <a href={href}>{children}</a>
}));

// Mock brand store
const mockUseBrandStore = vi.fn(() => ({
    brands: [] as Brand[],
    openDeleteModal: false,
    openAddBrandModal: false,
    modalBrand: null,
    modalMode: 'add' as const,
    setBrands: vi.fn(),
    setOpenDeleteModal: vi.fn(),
    setOpenAddBrandModal: vi.fn(),
    setModalBrand: vi.fn(),
    setModalMode: vi.fn()
}));

vi.mock('@/stores/useBrandStore', () => ({
    useBrandStore: () => mockUseBrandStore()
}));

// Mock modals
vi.mock('@/components/Admin/DeleteBrandModal/DeleteBrandModal', () => ({
    default: () => <div data-testid="delete-brand-modal">Delete Brand Modal</div>
}));

vi.mock('@/components/Admin/AddNewBrandModal/AddNewBrandModal', () => ({
    default: () => <div data-testid="add-brand-modal">Add/Edit Brand Modal</div>
}));

describe('BrandPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Inertia page props
        (usePage as any).mockReturnValue({
            props: {
                brands: {
                    data: [
                        { id: 1, name: 'Brand 1', products_count: 5 },
                        { id: 2, name: 'Brand 2', products_count: 3 }
                    ],
                    current_page: 1,
                    links: [
                        { url: null, label: '&laquo; Previous', active: false },
                        { url: '?page=1', label: '1', active: true },
                        { url: null, label: 'Next &raquo;', active: false }
                    ]
                },
                sortkey: 'name',
                sortdirection: 'asc'
            }
        });

        // Set up brand store with initial data
        mockUseBrandStore.mockReturnValue({
            brands: [
                { id: 1, name: 'Brand 1', products_count: 5 },
                { id: 2, name: 'Brand 2', products_count: 3 }
            ],
            openDeleteModal: false,
            openAddBrandModal: false,
            modalBrand: null,
            modalMode: 'add',
            setBrands: vi.fn(),
            setOpenDeleteModal: vi.fn(),
            setOpenAddBrandModal: vi.fn(),
            setModalBrand: vi.fn(),
            setModalMode: vi.fn()
        });
    });

    it('renders brand list correctly', () => {
        render(<BrandPage />);

        expect(screen.getByText('Brands')).toBeInTheDocument();
        expect(screen.getByText('Brand 1')).toBeInTheDocument();
        expect(screen.getByText('Brand 2')).toBeInTheDocument();
    });

    it('opens add brand modal when clicking add button', async () => {
        const setOpenAddBrandModal = vi.fn();
        const setModalMode = vi.fn();
        const setModalBrand = vi.fn();

        mockUseBrandStore.mockReturnValue({
            brands: [
                { id: 1, name: 'Brand 1', products_count: 5 },
                { id: 2, name: 'Brand 2', products_count: 3 }
            ],
            openDeleteModal: false,
            openAddBrandModal: false,
            modalBrand: null,
            modalMode: 'add',
            setBrands: vi.fn(),
            setOpenDeleteModal: vi.fn(),
            setOpenAddBrandModal,
            setModalBrand,
            setModalMode
        });

        render(<BrandPage />);

        const addButton = screen.getByText('Add new brand');
        await act(async () => {
            fireEvent.click(addButton);
        });

        expect(setModalMode).toHaveBeenCalledWith('add');
        expect(setModalBrand).toHaveBeenCalledWith(null);
        expect(setOpenAddBrandModal).toHaveBeenCalledWith(true);
    });

    it('shows modals when their state is true', () => {
        mockUseBrandStore.mockReturnValue({
            brands: [
                { id: 1, name: 'Brand 1', products_count: 5 },
                { id: 2, name: 'Brand 2', products_count: 3 }
            ],
            openDeleteModal: true,
            openAddBrandModal: true,
            modalBrand: null,
            modalMode: 'add',
            setBrands: vi.fn(),
            setOpenDeleteModal: vi.fn(),
            setOpenAddBrandModal: vi.fn(),
            setModalBrand: vi.fn(),
            setModalMode: vi.fn()
        });

        render(<BrandPage />);

        expect(screen.getByTestId('delete-brand-modal')).toBeInTheDocument();
        expect(screen.getByTestId('add-brand-modal')).toBeInTheDocument();
    });

    it('fails to open add brand modal when clicking add button', async () => {
        const setOpenAddBrandModal = vi.fn();
        const setModalMode = vi.fn();
        const setModalBrand = vi.fn();

        mockUseBrandStore.mockReturnValue({
            brands: [
                { id: 1, name: 'Brand 1', products_count: 5 },
                { id: 2, name: 'Brand 2', products_count: 3 }
            ],
            openDeleteModal: false,
            openAddBrandModal: false,
            modalBrand: null,
            modalMode: 'add',
            setBrands: vi.fn(),
            setOpenDeleteModal: vi.fn(),
            setOpenAddBrandModal,
            setModalBrand,
            setModalMode
        });

        render(<BrandPage />);

        const addButton = screen.getByText('Add new brand');
        await act(async () => {
            fireEvent.click(addButton);
        });

        expect(setModalMode).not.toHaveBeenCalled();
        expect(setModalBrand).not.toHaveBeenCalled();
        expect(setOpenAddBrandModal).not.toHaveBeenCalled();
    });
});