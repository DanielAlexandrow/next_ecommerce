import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import UsersPage from './UsersPage';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('UsersPage Component', () => {
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
                <UsersPage />
            </QueryClientProvider>
        );
    };

    it('renders users list with correct data', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
            expect(screen.getByRole('table')).toBeInTheDocument();
        });

        // Verify table headers
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Verify at least one user row exists
        await waitFor(() => {
            expect(screen.getAllByTestId('user-row').length).toBeGreaterThan(0);
        });
    });

    it('opens and closes user actions dropdown', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByTestId('user-row').length).toBeGreaterThan(0);
        });

        const actionButton = screen.getAllByTestId('user-actions-trigger')[0];
        await user.click(actionButton);

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();

        // Click outside to close
        await user.click(document.body);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('handles user deletion', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByTestId('user-row').length).toBeGreaterThan(0);
        });

        // Open actions menu and click delete
        const actionButton = screen.getAllByTestId('user-actions-trigger')[0];
        await user.click(actionButton);
        const deleteButton = screen.getByText('Delete');
        await user.click(deleteButton);

        // Verify delete confirmation dialog
        expect(screen.getByTestId('delete-user-dialog')).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = screen.getByTestId('confirm-delete-button');
        await user.click(confirmButton);

        // Verify user is removed
        await waitFor(() => {
            expect(screen.getByTestId('delete-success-message')).toBeInTheDocument();
        });
    });

    it('handles user editing', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByTestId('user-row').length).toBeGreaterThan(0);
        });

        // Open actions menu and click edit
        const actionButton = screen.getAllByTestId('user-actions-trigger')[0];
        await user.click(actionButton);
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        // Verify edit form appears
        expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();

        // Fill in form and submit
        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Name');
        
        const submitButton = screen.getByTestId('submit-edit-button');
        await user.click(submitButton);

        // Verify success message
        await waitFor(() => {
            expect(screen.getByTestId('edit-success-message')).toBeInTheDocument();
        });
    });
});