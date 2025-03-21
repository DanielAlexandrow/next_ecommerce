import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteUserDialog from './DeleteUserModal';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('@/stores/useUserStore', () => ({
    useUserStore: vi.fn()
}));

vi.mock('@/api/userApi', () => ({
    userApi: {
        deleteUser: vi.fn()
    }
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('DeleteUserDialog', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
    };

    const mockSetUsers = vi.fn();
    const mockSetOpenDeleteModal = vi.fn();
    const mockSetModalUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useUserStore as any).mockImplementation(() => ({
            modalUser: mockUser,
            users: [mockUser],
            setUsers: mockSetUsers,
            setOpenDeleteModal: mockSetOpenDeleteModal,
            setModalUser: mockSetModalUser
        }));
    });

    it('renders correctly with user information', () => {
        render(<DeleteUserDialog />);
        
        expect(screen.getByText('Delete User')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete Test User/)).toBeInTheDocument();
        expect(screen.getByText('User account and profile')).toBeInTheDocument();
        expect(screen.getByText('Order history')).toBeInTheDocument();
        expect(screen.getByText('Address information')).toBeInTheDocument();
        expect(screen.getByText('Reviews and ratings')).toBeInTheDocument();
    });

    it('handles successful user deletion', async () => {
        (userApi.deleteUser as any).mockResolvedValueOnce({ status: 204 });

        render(<DeleteUserDialog />);

        const deleteButton = screen.getByText('Delete User');
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(userApi.deleteUser).toHaveBeenCalledWith(mockUser.id);
            expect(mockSetUsers).toHaveBeenCalledWith([]);
            expect(toast.success).toHaveBeenCalledWith('User deleted successfully');
            expect(mockSetOpenDeleteModal).toHaveBeenCalledWith(false);
            expect(mockSetModalUser).toHaveBeenCalledWith(null);
        });
    });

    it('handles deletion error', async () => {
        const mockError = {
            response: {
                data: {
                    message: 'Failed to delete user'
                }
            }
        };
        (userApi.deleteUser as any).mockRejectedValueOnce(mockError);

        render(<DeleteUserDialog />);

        const deleteButton = screen.getByText('Delete User');
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to delete user');
        });
    });

    it('shows loading state during deletion', async () => {
        let resolveDelete: any;
        (userApi.deleteUser as any).mockImplementationOnce(
            () => new Promise(resolve => { resolveDelete = resolve; })
        );

        render(<DeleteUserDialog />);

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deleting...')).toBeInTheDocument();
            expect(screen.getByText('Delete User')).toBeDisabled();
            expect(screen.getByText('Cancel')).toBeDisabled();
        });

        await act(async () => {
            resolveDelete({ status: 204 });
        });
    });

    it('closes modal on cancel', async () => {
        render(<DeleteUserDialog />);

        const cancelButton = screen.getByText('Cancel');
        await act(async () => {
            fireEvent.click(cancelButton);
        });

        expect(mockSetOpenDeleteModal).toHaveBeenCalledWith(false);
    });

    it('returns null when no user is selected', () => {
        (useUserStore as any).mockImplementation(() => ({
            modalUser: null,
            users: [],
            setUsers: mockSetUsers,
            setOpenDeleteModal: mockSetOpenDeleteModal,
            setModalUser: mockSetModalUser
        }));

        const { container } = render(<DeleteUserDialog />);
        expect(container.firstChild).toBeNull();
    });

    it('disables buttons during deletion process', async () => {
        (userApi.deleteUser as any).mockImplementationOnce(
            () => new Promise(() => {}) // Never resolves to keep loading state
        );

        render(<DeleteUserDialog />);

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Delete User')).toBeDisabled();
            expect(screen.getByText('Cancel')).toBeDisabled();
        });
    });
});