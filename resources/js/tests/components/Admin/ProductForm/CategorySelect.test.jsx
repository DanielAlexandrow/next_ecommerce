import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CategorySelect from '@/components/Admin/ProductForm/CategorySelect';
import { categoryApi } from '@/api/categoryApi';
import { toast } from 'react-toastify';

// Mock the categoryApi
vi.mock('@/api/categoryApi', () => ({
    categoryApi: {
        fetchCategories: vi.fn().mockResolvedValue([
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' }
        ]),
        createCategory: vi.fn().mockImplementation((name) =>
            Promise.resolve({ id: 3, name })
        )
    }
}));

// Mock toast notifications
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

describe('CategorySelect', () => {
    it('displays available categories', async () => {
        await act(async () => {
            render(
                <CategorySelect
                    selectedCategories={[]}
                    setSelectedCategories={vi.fn()}
                />
            );
        });

        // Wait for categories to load
        const input = screen.getByTestId('category-select-trigger');
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Category' } });
        });

        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('allows selecting categories', async () => {
        const setSelectedCategories = vi.fn();
        await act(async () => {
            render(
                <CategorySelect
                    selectedCategories={[]}
                    setSelectedCategories={setSelectedCategories}
                />
            );
        });

        // Type to show categories
        const input = screen.getByTestId('category-select-trigger');
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Category' } });
        });

        // Select a category
        const category = screen.getByTestId('category-option-1');
        await act(async () => {
            fireEvent.click(category);
        });

        expect(setSelectedCategories).toHaveBeenCalledWith([
            expect.objectContaining({
                id: 1,
                name: 'Category 1',
                pivot: expect.objectContaining({
                    category_id: 1
                })
            })
        ]);
    });

    it('allows creating new categories', async () => {
        const setSelectedCategories = vi.fn();
        await act(async () => {
            render(
                <CategorySelect
                    selectedCategories={[]}
                    setSelectedCategories={setSelectedCategories}
                />
            );
        });

        // Type a new category name
        const input = screen.getByTestId('category-select-trigger');
        await act(async () => {
            fireEvent.change(input, { target: { value: 'New Category' } });
        });

        // Click create button
        const createButton = screen.getByTestId('create-category-button');
        await act(async () => {
            fireEvent.click(createButton);
        });

        expect(categoryApi.createCategory).toHaveBeenCalledWith('New Category');
        expect(setSelectedCategories).toHaveBeenCalledWith([
            expect.objectContaining({
                id: 3,
                name: 'New Category'
            })
        ]);
    });

    it('shows selected categories', async () => {
        const selectedCategories = [
            { id: 1, name: 'Category 1', pivot: { category_id: 1 } }
        ];

        await act(async () => {
            render(
                <CategorySelect
                    selectedCategories={selectedCategories}
                    setSelectedCategories={vi.fn()}
                />
            );
        });

        expect(screen.getByTestId('selected-category-1')).toHaveTextContent('Category 1');
    });
}); 