import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditUserDialog from './EditUserModal';
import { useUserStore } from '@/stores/useUserStore';
import { FormProvider, useForm } from 'react-hook-form';
import { userApi } from '@/api/userApi';

// Mock the stores and API
vi.mock('@/stores/useUserStore');
vi.mock('@/api/userApi');
vi.mock('react-hook-form', () => ({
    ...vi.importActual('react-hook-form'),
    FormProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer'
};

describe('EditUserDialog', () => {
    beforeEach(() => {
        vi.mocked(useUserStore).mockReturnValue({
            modalUser: mockUser,
            setModalUser: vi.fn(),
            setOpenEditModal: vi.fn(),
            users: [mockUser],
            setUsers: vi.fn()
        } as any);

        vi.mocked(userApi.updateUser).mockResolvedValue(mockUser);
    });

    it('renders correctly', async () => {
        render(<EditUserDialog />);
        
        expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
        expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
        expect(screen.getByRole('combobox')).toHaveValue(mockUser.role);
    });

    it('handles successful user update', async () => {
        const { setUsers, setOpenEditModal } = useUserStore();
        render(<EditUserDialog />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated Name' } });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(userApi.updateUser).toHaveBeenCalledWith(mockUser.id, expect.any(Object));
            expect(setUsers).toHaveBeenCalled();
            expect(setOpenEditModal).toHaveBeenCalledWith(false);
        });
    });

    it('handles API errors', async () => {
        const error = new Error('Update failed');
        vi.mocked(userApi.updateUser).mockRejectedValueOnce(error);
        
        render(<EditUserDialog />);
        
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/failed to update user/i)).toBeInTheDocument();
        });
    });

    it('shows loading state during submission', async () => {
        render(<EditUserDialog />);
        
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('closes modal on cancel', () => {
        const { setOpenEditModal } = useUserStore();
        render(<EditUserDialog />);
        
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        
        expect(setOpenEditModal).toHaveBeenCalledWith(false);
    });

    it('disables form controls during submission', async () => {
        render(<EditUserDialog />);
        
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        
        expect(screen.getByLabelText(/name/i)).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByRole('combobox')).toBeDisabled();
    });
});