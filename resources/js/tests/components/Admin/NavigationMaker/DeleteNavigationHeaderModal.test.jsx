import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteHeaderNavigationModal from '@/components/Admin/NavigationMaker/DeleteNavigationHeaderModal';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';

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

describe('DeleteHeaderNavigationModal', () => {
    const mockHeaders = [
        { id: 1, name: 'Header 1', order_num: 1, navigation_items: [] },
        { id: 2, name: 'Header 2', order_num: 2, navigation_items: [] },
        { id: 3, name: 'Header 3', order_num: 3, navigation_items: [] },
    ];

    beforeEach(() => {
        // Reset store to initial state
        navigationStore.setState({
            headers: mockHeaders,
            selectedHeader: mockHeaders[1], // Select 'Header 2'
            openDeleteHeaderModal: true,
        });
        // Clear mock calls
        vi.clearAllMocks();
    });

    it('renders delete header modal correctly', () => {
        render(<DeleteHeaderNavigationModal />);

        expect(screen.getByText('Delete Header Header 2')).toBeInTheDocument();
    });

    it('deletes header and reorders remaining headers', async () => {
        render(<DeleteHeaderNavigationModal />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            const state = navigationStore.getState();
            expect(state.headers).toHaveLength(2);
            expect(state.headers[0]).toEqual({
                ...mockHeaders[0],
                order_num: 1,
            });
            expect(state.headers[1]).toEqual({
                ...mockHeaders[2],
                order_num: 2,
            });
            expect(state.openDeleteHeaderModal).toBe(false);
        });
    });

    it('closes modal when cancel is clicked', () => {
        render(<DeleteHeaderNavigationModal />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(navigationStore.getState().openDeleteHeaderModal).toBe(false);
    });

    it('returns null when no header is selected', () => {
        navigationStore.setState({
            headers: mockHeaders,
            selectedHeader: null,
            openDeleteHeaderModal: true,
        });

        const { container } = render(<DeleteHeaderNavigationModal />);
        expect(container.firstChild).toBeNull();
    });

    it('maintains header order after deletion', async () => {
        // Set up headers with non-sequential order numbers
        const nonSequentialHeaders = [
            { id: 1, name: 'Header 1', order_num: 2, navigation_items: [] },
            { id: 2, name: 'Header 2', order_num: 4, navigation_items: [] },
            { id: 3, name: 'Header 3', order_num: 7, navigation_items: [] },
        ];

        navigationStore.setState({
            headers: nonSequentialHeaders,
            selectedHeader: nonSequentialHeaders[1],
            openDeleteHeaderModal: true,
        });

        render(<DeleteHeaderNavigationModal />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            const state = navigationStore.getState();
            expect(state.headers).toHaveLength(2);
            expect(state.headers[0].order_num).toBe(1);
            expect(state.headers[1].order_num).toBe(2);
        });
    });
}); 