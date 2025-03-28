import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pact, Matchers } from '@pact-foundation/pact';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { productsStore } from '../../stores/productlist/productstore';
import ProductsList from './ProductList';
import type { Product } from '@/types';
import userEvent from '@testing-library/user-event';  
import axios from 'axios';

const { like, eachLike } = Matchers;

const PACT_PORT = 8989;
const provider = new Pact({
    consumer: 'ProductListFrontend',
    provider: 'ProductAPI',
    port: PACT_PORT,
    log: process.env.CI ? undefined : './pact/logs/pact.log'
});

describe('ProductList Component', () => {
    let queryClient: QueryClient;

    beforeAll(async () => {
        console.log('🚀 Starting test suite setup');
        await provider.setup();
        console.log('✅ Provider setup complete');
    });

    afterAll(async () => {
        console.log('🔚 Finalizing test suite');
        await provider.finalize();
        console.log('✅ Provider finalized');
    });

    beforeEach(async () => {
        console.log('📝 Starting new test case setup');
        await provider.verify();
        console.log('✅ Provider verified');
        
        console.log('🔄 Initializing QueryClient');
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false }
            }
        });
        console.log('✅ QueryClient initialized');

        console.log('🏪 Resetting products store state');
        productsStore.setState({
            products: [],
            openEditProductModal: false,
            openDeleteProductModal: false,
            openNewSubproductModal: false,
            openSubproductsModal: false,
            selectedProduct: null,
            error: null
        });
        console.log('✅ Store state reset complete');
        console.log('Current store state:', productsStore.getState());
    });

    const mockProductTemplate = {
        id: like(1),
        name: like('Test Product 1'),
        description: like('Test Description 1'),
        available: like(true),
        created_at: like('2024-03-28'),
        images: like([]),
        brand: like({ id: 1, name: 'Test Brand' }),
        subproducts: like([]),
        categories: like([])
    };
    console.log('📋 Mock product template defined:', mockProductTemplate);

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ProductsList />
            </QueryClientProvider>
        );
    };

    it('loads and displays products from API', async () => {
        // Define the expected interaction
        await provider.addInteraction({
            state: 'products exist',
            uponReceiving: 'a request for all products',
            withRequest: {
                method: 'GET',
                path: '/api/products',
                headers: {
                    Accept: 'application/json'
                }
            },
            willRespondWith: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    data: eachLike(mockProductTemplate),
                    links: like([]),
                    current_page: like(1)
                }
            }
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Products List' })).toBeInTheDocument();
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getAllByTestId('product-row')).toHaveLength(2);
        });
    });

    it('handles product search', async () => {
        const searchTerm = 'Test Product 1';
        
        await provider.addInteraction({
            state: 'products can be searched',
            uponReceiving: 'a search request for products',
            withRequest: {
                method: 'GET',
                path: '/api/products/search',
                query: {
                    query: searchTerm
                },
                headers: {
                    Accept: 'application/json'
                }
            },
            willRespondWith: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    data: eachLike(mockProductTemplate),
                    links: like([]),
                    current_page: like(1)
                }
            }
        });

        const user = userEvent.setup();
        renderComponent();

        const searchInput = screen.getByTestId('product-search-input');
        await user.type(searchInput, searchTerm);

        await waitFor(() => {
            expect(screen.getAllByTestId('product-row')).toHaveLength(1);
            expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
        });
    });

    it('handles product deletion', async () => {
        const productId = 1;

        await provider.addInteraction({
            state: 'a product can be deleted',
            uponReceiving: 'a delete product request',
            withRequest: {
                method: 'DELETE',
                path: `/api/products/${productId}`,
                headers: {
                    Accept: 'application/json'
                }
            },
            willRespondWith: {
                status: 204
            }
        });

        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
        });

        const actionButtons = screen.getAllByText('Actions');
        await user.click(actionButtons[0]);
        await user.click(screen.getByText('Delete'));

        await user.click(screen.getByTestId('confirm-delete-button'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-success-message')).toBeInTheDocument();
        });
    });
});