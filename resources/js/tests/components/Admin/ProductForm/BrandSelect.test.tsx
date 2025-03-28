import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BrandSelect from '@/components/Admin/ProductForm/BrandSelect';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
    default: {
        get: vi.fn().mockResolvedValue({
            data: [
                { id: 1, name: 'Brand 1' },
                { id: 2, name: 'Brand 2' }
            ]
        })
    }
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('BrandSelect', () => {
    it('displays brand selection trigger with placeholder', async () => {
        await act(async () => {
            render(
                <BrandSelect
                    productBrand={null}
                    setProductBrand={vi.fn()}
                />
            );
        });

        const trigger = screen.getByTestId('brand-select-trigger');
        expect(trigger).toHaveTextContent('Select brand...');
    });

    it('displays selected brand name when brand is selected', async () => {
        const selectedBrand = { id: 1, name: 'Brand 1' };

        await act(async () => {
            render(
                <BrandSelect
                    productBrand={selectedBrand}
                    setProductBrand={vi.fn()}
                />
            );
        });

        const selectedText = screen.getByTestId('selected-brand');
        expect(selectedText).toHaveTextContent('Brand 1');
    });

    it('loads and displays brands from API', async () => {
        await act(async () => {
            render(
                <BrandSelect
                    productBrand={null}
                    setProductBrand={vi.fn()}
                />
            );
        });

        // Verify API call
        expect(axios.get).toHaveBeenCalledWith('/brands/getallbrands');

        // Open dropdown
        const trigger = screen.getByTestId('brand-select-trigger');
        await act(async () => {
            fireEvent.click(trigger);
        });

        // Check if brands are displayed
        expect(screen.getByTestId('brand-option-1')).toBeInTheDocument();
        expect(screen.getByTestId('brand-option-2')).toBeInTheDocument();
    });

    it('allows selecting a brand', async () => {
        const setProductBrand = vi.fn();

        await act(async () => {
            render(
                <BrandSelect
                    productBrand={null}
                    setProductBrand={setProductBrand}
                />
            );
        });

        // Open dropdown
        const trigger = screen.getByTestId('brand-select-trigger');
        await act(async () => {
            fireEvent.click(trigger);
        });

        // Select a brand
        const brandOption = screen.getByTestId('brand-option-1');
        await act(async () => {
            fireEvent.click(brandOption);
        });

        expect(setProductBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                name: 'Brand 1'
            })
        );
    });
}); 