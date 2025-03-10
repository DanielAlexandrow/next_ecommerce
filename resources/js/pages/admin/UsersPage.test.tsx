import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import UsersPage from './UsersPage';
import { useUserStore } from '@/stores/useUserStore';
import { userApi } from '@/api/userApi';
import userEvent from '@testing-library/user-event';

// Mock modules
vi.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      users: {
        data: mockUsers,
        links: [
          { url: null, label: '&laquo; Previous', active: false },
          { url: '?page=1', label: '1', active: true },
          { url: '?page=2', label: '2', active: false },
          { url: '?page=2', label: 'Next &raquo;', active: false },
        ],
        current_page: 1,
        from: 1,
        to: 10,
        total: 15,
        per_page: 10,
      },
      sortkey: 'name',
      sortdirection: 'asc'
    }
  }),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  router: {
    get: vi.fn(),
    visit: vi.fn()
  }
}));

vi.mock('@/stores/useUserStore', () => ({
  useUserStore: vi.fn().mockImplementation(() => ({
    users: mockUsers,
    openDeleteModal: false,
    openEditModal: false,
    modalUser: null,
    modalMode: null,
    setUsers: vi.fn(),
    setOpenDeleteModal: vi.fn(),
    setOpenEditModal: vi.fn(),
    setModalUser: vi.fn(),
    setModalMode: vi.fn(),
  }))
}));

vi.mock('@/api/userApi', () => ({
  userApi: {
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  }
}));

// Mock components
vi.mock('@/components/Admin/DeleteUserModal/DeleteUserModal', () => ({
  default: () => <div data-testid="delete-user-dialog">Delete User Dialog</div>
}));

vi.mock('@/components/Admin/EditUserModal/EditUserModal', () => ({
  default: () => <div data-testid="edit-user-dialog">Edit User Dialog</div>
}));

vi.mock('@/layouts/app-layout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>
}));

vi.mock('@/components/pagination', () => ({
  default: () => <div data-testid="pagination">Pagination Component</div>
}));

// Mock data
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: '2023-05-15T10:00:00Z' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'customer', created_at: '2023-06-20T11:30:00Z' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'driver', created_at: '2023-07-10T09:15:00Z' },
];

describe('UsersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the users page with correct title', () => {
    render(<UsersPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders the table with correct headers', () => {
    render(<UsersPage />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Joined')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders user rows with correct data', () => {
    render(<UsersPage />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('driver')).toBeInTheDocument();
  });

  it('displays the dropdown menu when clicking on Open', async () => {
    const user = userEvent.setup();
    render(<UsersPage />);
    
    const dropdownTriggers = screen.getAllByText('Open');
    await user.click(dropdownTriggers[0]);
    
    // Check if dropdown items are present
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('opens delete modal when clicking Delete', async () => {
    const mockSetOpenDeleteModal = vi.fn();
    const mockSetModalUser = vi.fn();
    
    // Override the mock implementation for this test
    (useUserStore as any).mockImplementation(() => ({
      users: mockUsers,
      openDeleteModal: false,
      openEditModal: false,
      modalUser: null,
      modalMode: null,
      setUsers: vi.fn(),
      setOpenDeleteModal: mockSetOpenDeleteModal,
      setOpenEditModal: vi.fn(),
      setModalUser: mockSetModalUser,
      setModalMode: vi.fn(),
    }));
    
    const user = userEvent.setup();
    render(<UsersPage />);
    
    const dropdownTriggers = screen.getAllByText('Open');
    await user.click(dropdownTriggers[0]);
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(mockSetModalUser).toHaveBeenCalledWith(mockUsers[0]);
    expect(mockSetOpenDeleteModal).toHaveBeenCalledWith(true);
  });

  it('opens edit modal when clicking Edit', async () => {
    const mockSetOpenEditModal = vi.fn();
    const mockSetModalUser = vi.fn();
    const mockSetModalMode = vi.fn();
    
    // Override the mock implementation for this test
    (useUserStore as any).mockImplementation(() => ({
      users: mockUsers,
      openDeleteModal: false,
      openEditModal: false,
      modalUser: null,
      modalMode: null,
      setUsers: vi.fn(),
      setOpenDeleteModal: vi.fn(),
      setOpenEditModal: mockSetOpenEditModal,
      setModalUser: mockSetModalUser,
      setModalMode: mockSetModalMode,
    }));
    
    const user = userEvent.setup();
    render(<UsersPage />);
    
    const dropdownTriggers = screen.getAllByText('Open');
    await user.click(dropdownTriggers[0]);
    
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    expect(mockSetModalUser).toHaveBeenCalledWith(mockUsers[0]);
    expect(mockSetModalMode).toHaveBeenCalledWith('update');
    expect(mockSetOpenEditModal).toHaveBeenCalledWith(true);
  });

  it('renders delete modal when openDeleteModal is true', () => {
    // Override the mock implementation for this test
    (useUserStore as any).mockImplementation(() => ({
      users: mockUsers,
      openDeleteModal: true,
      openEditModal: false,
      modalUser: mockUsers[0],
      modalMode: null,
      setUsers: vi.fn(),
      setOpenDeleteModal: vi.fn(),
      setOpenEditModal: vi.fn(),
      setModalUser: vi.fn(),
      setModalMode: vi.fn(),
    }));
    
    render(<UsersPage />);
    
    expect(screen.getByTestId('delete-user-dialog')).toBeInTheDocument();
  });

  it('renders edit modal when openEditModal is true', () => {
    // Override the mock implementation for this test
    (useUserStore as any).mockImplementation(() => ({
      users: mockUsers,
      openDeleteModal: false,
      openEditModal: true,
      modalUser: mockUsers[0],
      modalMode: 'update',
      setUsers: vi.fn(),
      setOpenDeleteModal: vi.fn(),
      setOpenEditModal: vi.fn(),
      setModalUser: vi.fn(),
      setModalMode: vi.fn(),
    }));
    
    render(<UsersPage />);
    
    expect(screen.getByTestId('edit-user-dialog')).toBeInTheDocument();
  });
});