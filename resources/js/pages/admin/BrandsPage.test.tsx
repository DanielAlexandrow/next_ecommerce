import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import BrandPage from './BrandsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('BrandPage Component', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false }
            }
        });
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrandPage />
            </QueryClientProvider>
        );
    };

    it('renders brands list with correct data', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Brands' })).toBeInTheDocument();
            expect(screen.getByRole('table')).toBeInTheDocument();
        });

        // Verify table headers
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Verify brand rows exist
        await waitFor(() => {
            expect(screen.getAllByTestId('brand-row').length).toBeGreaterThan(0);
        });
    });

    it('opens add brand modal and creates new brand', async () => {
        const user = userEvent.setup();
        renderComponent();

        // Click add brand button
        const addButton = screen.getByRole('button', { name: 'Add new brand' });
        await user.click(addButton);

        // Verify modal appears
        expect(screen.getByTestId('add-brand-modal')).toBeInTheDocument();

        // Fill in form
        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'New Test Brand');

        // Submit form
        const submitButton = screen.getByTestId('submit-brand-button');
        await user.click(submitButton);

        // Verify success message and new brand appears
        await waitFor(() => {
            expect(screen.getByTestId('create-success-message')).toBeInTheDocument();
            expect(screen.getByText('New Test Brand')).toBeInTheDocument();
        });
    });

    it('edits existing brand', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByTestId('brand-row').length).toBeGreaterThan(0);
        });

        // Click edit button on first brand
        const editButtons = screen.getAllByTestId('edit-brand-button');
        await user.click(editButtons[0]);

        // Verify edit modal appears
        expect(screen.getByTestId('edit-brand-modal')).toBeInTheDocument();

        // Update brand name
        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Brand Name');

        // Submit changes
        const submitButton = screen.getByTestId('submit-brand-button');
        await user.click(submitButton);

        // Verify success message and updated name appears
        await waitFor(() => {
            expect(screen.getByTestId('update-success-message')).toBeInTheDocument();
            expect(screen.getByText('Updated Brand Name')).toBeInTheDocument();
        });
    });

    it('deletes brand', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByTestId('brand-row').length).toBeGreaterThan(0);
        });

        // Get initial brand count
        const initialBrands = screen.getAllByTestId('brand-row');

        // Click delete button on first brand
        const deleteButtons = screen.getAllByTestId('delete-brand-button');
        await user.click(deleteButtons[0]);

        // Verify confirmation dialog appears
        expect(screen.getByTestId('delete-brand-dialog')).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = screen.getByTestId('confirm-delete-button');
        await user.click(confirmButton);

        // Verify success message and brand is removed
        await waitFor(() => {
            expect(screen.getByTestId('delete-success-message')).toBeInTheDocument();
            const remainingBrands = screen.getAllByTestId('brand-row');
            expect(remainingBrands.length).toBe(initialBrands.length - 1);
        });
    });
});