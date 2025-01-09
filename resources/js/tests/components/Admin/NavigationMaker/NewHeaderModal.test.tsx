import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewHeaderModal from '@/components/Admin/NavigationMaker/NewHeaderModal';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
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
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('NewHeaderModal', () => {
    const mockHeaders = [
        { id: 1, name: 'Header 1', order_num: 1, navigation_items: [] },
        { id: 2, name: 'Header 2', order_num: 2, navigation_items: [] },
    ];

    beforeEach(() => {
        // Reset store to initial state
        navigationStore.setState({
            headers: mockHeaders,
            openNewHeaderModal: true,
        });
        // Clear mock calls
        vi.clearAllMocks();
    });

    it('renders new header modal correctly', () => {
        render(<NewHeaderModal />);

        expect(screen.getByText('Add new header')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('validates header name length', async () => {
        render(<NewHeaderModal />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'ab' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/String must contain at least 3 character/)).toBeInTheDocument();
        });
    });

    it('adds new header successfully', async () => {
        render(<NewHeaderModal />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Header' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            const state = navigationStore.getState();
            expect(state.headers).toHaveLength(3);
            expect(state.headers[2]).toEqual({
                id: 0,
                name: 'New Header',
                order_num: 3,
                navigation_items: [],
            });
            expect(state.openNewHeaderModal).toBe(false);
            expect(toast.success).toHaveBeenCalledWith('Header added successfully');
        });
    });

    it('closes modal when cancel is clicked', () => {
        render(<NewHeaderModal />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(navigationStore.getState().openNewHeaderModal).toBe(false);
    });

    it('assigns correct order number to new header', async () => {
        navigationStore.setState({
            headers: [
                { id: 1, name: 'Header 1', order_num: 5, navigation_items: [] },
            ],
            openNewHeaderModal: true,
        });

        render(<NewHeaderModal />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Header' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            const state = navigationStore.getState();
            expect(state.headers[1].order_num).toBe(6);
        });
    });
}); 