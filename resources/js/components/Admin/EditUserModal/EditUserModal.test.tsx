import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditUserDialog from './EditUserModal';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import { toast } from 'react-toastify';
import { useUserForm } from './EditUserModal.hooks';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/stores/useUserStore', () => ({
    useUserStore: vi.fn()
}));

vi.mock('@/api/userApi', () => ({
    userApi: {
        updateUser: vi.fn()
    }
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

vi.mock('./EditUserModal.hooks', () => ({
    useUserForm: vi.fn()
}));

describe('EditUserDialog', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
    };

    const mockSetUsers = vi.fn();
    const mockSetOpenEditModal = vi.fn();
    const mockSetModalUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useUserStore as any).mockImplementation(() => ({
            modalUser: mockUser,
            users: [mockUser],
            setUsers: mockSetUsers,
            setOpenEditModal: mockSetOpenEditModal,
            setModalUser: mockSetModalUser
        }));

        (useUserForm as any).mockImplementation(() => ({
            form: {
                handleSubmit: vi.fn((cb) => cb),
                control: {},
                formState: { errors: {} }
            },
            isSubmitting: false,
            setIsSubmitting: vi.fn(),
            handleError: vi.fn()
        }));
    });

    it('renders correctly', () => {
        render(<EditUserDialog />);
        
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByTestId('user-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('user-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('user-role-select')).toBeInTheDocument();
        expect(screen.getByTestId('user-password-input')).toBeInTheDocument();
    });

    it('handles successful user update', async () => {
        const updatedUser = { ...mockUser, name: 'Updated Name' };
        (userApi.updateUser as any).mockResolvedValueOnce({ 
            data: updatedUser,
            message: 'User updated successfully' 
        });

        render(<EditUserDialog />);

        const submitButton = screen.getByTestId('submit-edit-user');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([updatedUser]);
            expect(toast.success).toHaveBeenCalledWith('User updated successfully');
            expect(mockSetOpenEditModal).toHaveBeenCalledWith(false);
            expect(mockSetModalUser).toHaveBeenCalledWith(null);
        });
    });

    it('handles API errors', async () => {
        const mockError = new Error('API Error');
        (userApi.updateUser as any).mockRejectedValueOnce(mockError);
        
        const mockHandleError = vi.fn();
        (useUserForm as any).mockImplementation(() => ({
            form: {
                handleSubmit: vi.fn((cb) => cb),
                control: {},
                formState: { errors: {} }
            },
            isSubmitting: false,
            setIsSubmitting: vi.fn(),
            handleError: mockHandleError
        }));

        render(<EditUserDialog />);

        const submitButton = screen.getByTestId('submit-edit-user');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(mockHandleError).toHaveBeenCalledWith(mockError);
        });
    });

    it('shows loading state during submission', async () => {
        (useUserForm as any).mockImplementation(() => ({
            form: {
                handleSubmit: vi.fn((cb) => cb),
                control: {},
                formState: { errors: {} }
            },
            isSubmitting: true,
            setIsSubmitting: vi.fn(),
            handleError: vi.fn()
        }));

        render(<EditUserDialog />);

        expect(screen.getByTestId('submit-edit-user')).toHaveTextContent('Saving...');
    });

    it('closes modal on cancel', async () => {
        render(<EditUserDialog />);

        const cancelButton = screen.getByText('Cancel');
        await act(async () => {
            fireEvent.click(cancelButton);
        });

        expect(mockSetOpenEditModal).toHaveBeenCalledWith(false);
    });

    it('disables form controls during submission', async () => {
        (useUserForm as any).mockImplementation(() => ({
            form: {
                handleSubmit: vi.fn((cb) => cb),
                control: {},
                formState: { errors: {} }
            },
            isSubmitting: true,
            setIsSubmitting: vi.fn(),
            handleError: vi.fn()
        }));

        render(<EditUserDialog />);

        expect(screen.getByTestId('submit-edit-user')).toBeDisabled();
        expect(screen.getByText('Cancel')).toBeDisabled();
    });
});