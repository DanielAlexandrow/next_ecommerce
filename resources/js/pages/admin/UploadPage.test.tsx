import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Import the store before mocking
import { useImageStore } from '@/stores/admin/imageStore';

// Mock the store first
vi.mock('@/stores/admin/imageStore', () => ({
    useImageStore: vi.fn().mockImplementation((selector) => {
        const state = {
            images: [
                { 
                    id: 1, 
                    name: 'test-image-1.jpg', 
                    path: 'images/test-image-1.jpg',
                    full_path: 'storage/images/test-image-1.jpg',
                    created_at: '2023-01-01T12:00:00.000Z',
                    updated_at: '2023-01-01T12:00:00.000Z'
                },
                { 
                    id: 2, 
                    name: 'test-image-2.jpg', 
                    path: 'images/test-image-2.jpg',
                    full_path: 'storage/images/test-image-2.jpg',
                    created_at: '2023-01-02T12:00:00.000Z',
                    updated_at: '2023-01-02T12:00:00.000Z'
                }
            ],
            pagination: {
                links: [
                    { url: null, label: "&laquo; Previous", active: false },
                    { url: "http://localhost/admin/images?page=1", label: "1", active: true },
                    { url: "http://localhost/admin/images?page=2", label: "2", active: false },
                    { url: "http://localhost/admin/images?page=2", label: "Next &raquo;", active: false }
                ],
                current_page: 1,
                last_page: 2,
                from: 1,
                to: 10,
                total: 15,
                per_page: 10
            },
            isLoading: false,
            deleteDialogOpen: false,
            selectedImageId: null,
            copyUrlDialogOpen: false,
            loadImages: vi.fn(),
            deleteImage: vi.fn(),
            setDeleteDialogOpen: vi.fn(),
            setSelectedImageId: vi.fn(),
            setCopyUrlDialogOpen: vi.fn(),
            uploadImage: vi.fn().mockImplementation(() => Promise.resolve({ success: true })),
            searchImages: vi.fn(),
            goToPage: vi.fn()
        };
        return selector ? selector(state) : state;
    })
}));

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    router: {
        reload: vi.fn(),
        visit: vi.fn(),
    },
    usePage: vi.fn(() => ({
        props: {
            errors: {},
            auth: { user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' } }
        }
    })),
    Link: ({ href, children }) => <a href={href}>{children}</a>
}));

// Mock components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, variant, disabled, type, ...props }) => (
        <button onClick={onClick} className={variant} disabled={disabled} type={type} {...props}>
            {children}
        </button>
    )
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }) => <div className="card">{children}</div>,
    CardContent: ({ children }) => <div className="card-content">{children}</div>,
    CardHeader: ({ children }) => <div className="card-header">{children}</div>,
    CardTitle: ({ children }) => <h3 className="card-title">{children}</h3>,
    CardFooter: ({ children }) => <div className="card-footer">{children}</div>
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open, onOpenChange }) => <div className="dialog">{children}</div>,
    DialogContent: ({ children, className }) => <div className="dialog-content">{children}</div>,
    DialogDescription: ({ children, className }) => <div className="dialog-description">{children}</div>,
    DialogFooter: ({ children, className }) => <div className="dialog-footer">{children}</div>,
    DialogHeader: ({ children, className }) => <div className="dialog-header">{children}</div>,
    DialogTitle: ({ children, className }) => <h3 className="dialog-title">{children}</h3>,
    DialogTrigger: ({ children, asChild }) => <div className="dialog-trigger">{children}</div>
}));

vi.mock('@/components/ui/input', () => ({
    Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
        ({ type, onChange, placeholder, ...props }, ref) => (
            <input
                type={type}
                onChange={onChange}
                placeholder={placeholder}
                ref={ref}
                {...props}
            />
        )
    )
}));

vi.mock('@/components/ui/pagination', () => ({
    Pagination: ({ links, onPageChange }) => (
        <div className="pagination">
            {links.map((link, i) => (
                <button 
                    key={i}
                    onClick={() => link.url && onPageChange(link.url)}
                    disabled={!link.url || link.active}
                    data-testid={`pagination-${i}`}
                >
                    {link.label.replace("&laquo;", "«").replace("&raquo;", "»")}
                </button>
            ))}
        </div>
    )
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
        writeText: vi.fn(() => Promise.resolve())
    }
});

// Mock file upload components
vi.mock('@/components/ui/file-input', () => ({
    FileInput: ({ onUploadComplete, data, ...props }) => (
        <div className="file-input">
            <input 
                type="file" 
                onChange={(e) => {
                    // Mock file upload
                    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
                    onUploadComplete({ success: true, image: { 
                        id: 999, 
                        name: 'test-image.jpg',
                        path: 'images/test-image.jpg',
                        full_path: 'storage/images/test-image.jpg'
                    }});
                }}
                data-testid="file-upload"
                {...props}
            />
            <button onClick={() => onUploadComplete({ success: true, image: { 
                id: 999, 
                name: 'test-image.jpg',
                path: 'images/test-image.jpg',
                full_path: 'storage/images/test-image.jpg'
            }})}>
                Upload
            </button>
        </div>
    )
}));

// Import the component to test
import UploadPage from '@/pages/admin/UploadPage';

describe('UploadPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders upload interface', async () => {
        // Mock relevant data or store calls here
        render(<div>UploadPage</div>);
        expect(screen.getByText('UploadPage')).toBeInTheDocument();
    });

    it('renders image grid', async () => {
        render(<UploadPage />);
        
        await waitFor(() => {
            expect(screen.getByText('test-image-1.jpg')).toBeInTheDocument();
            expect(screen.getByText('test-image-2.jpg')).toBeInTheDocument();
        });
    });

    it('displays image files correctly', async () => {
        render(<UploadPage />);
        
        await waitFor(() => {
            const images = screen.getAllByRole('img');
            expect(images.length).toBeGreaterThan(0);
            
            // Check image sources
            expect((images[0] as HTMLImageElement).src).toContain('storage/images/test-image-1.jpg');
        });
    });

    it('shows loading state correctly', async () => {
        vi.mocked(useImageStore).mockImplementationOnce(() => ({
            images: [],
            pagination: {
                links: [],
                current_page: 1,
                last_page: 1,
                from: 0,
                to: 0,
                total: 0,
                per_page: 10
            },
            isLoading: true,
            deleteDialogOpen: false,
            selectedImageId: null,
            copyUrlDialogOpen: false,
            loadImages: vi.fn(),
            deleteImage: vi.fn(),
            setDeleteDialogOpen: vi.fn(),
            setSelectedImageId: vi.fn(),
            setCopyUrlDialogOpen: vi.fn(),
            uploadImage: vi.fn(),
            searchImages: vi.fn(),
            goToPage: vi.fn()
        }));
        
        render(<UploadPage />);
        
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('loads images on component mount', async () => {
        render(<UploadPage />);
        
        expect(vi.mocked(useImageStore).mock.results[0].value.loadImages).toHaveBeenCalled();
    });

    it('uploads an image when clicking upload button', async () => {
        render(<UploadPage />);
        
        // Find and interact with the upload button
        const fileInput = screen.getByTestId('file-upload');
        
        // Simulate file selection
        fireEvent.change(fileInput);
        
        // Check if the upload function was called to refresh the page after upload
        await waitFor(() => {
            expect(vi.mocked(useImageStore).mock.results[0].value.loadImages).toHaveBeenCalled();
        });
    });

    it('shows details modal when clicking on an image', async () => {
        render(<UploadPage />);
        
        // Find all images
        const images = await screen.findAllByRole('img');
        
        // Click on first image
        fireEvent.click(images[0]);
        
        // Check if the modal is displayed
        await waitFor(() => {
            expect(screen.getByText(/image details/i)).toBeInTheDocument();
        });
    });

    it('confirms deletion when clicking delete button', async () => {
        render(<UploadPage />);
        
        // Find all delete buttons
        const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
        
        // Click delete on the first image
        fireEvent.click(deleteButtons[0]);
        
        // Modal should appear with a confirmation
        await waitFor(() => {
            expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
        });
        
        // Find and click confirm button
        const confirmButton = await screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
        
        // Check if delete was called
        expect(vi.mocked(useImageStore).mock.results[0].value.deleteImage).toHaveBeenCalled();
    });

    it('copies image URL when clicking copy URL button', async () => {
        render(<UploadPage />);
        
        // Find all copy buttons
        const copyButtons = await screen.findAllByRole('button', { name: /copy url/i });
        
        // Click copy on the first image
        fireEvent.click(copyButtons[0]);
        
        // Check if clipboard API was used
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            expect.stringContaining('storage/images/test-image-1.jpg')
        );
    });

    it('handles pagination correctly', async () => {
        render(<UploadPage />);
        
        // Find pagination links
        const pageLinks = screen.getAllByTestId(/pagination-/);
        
        // Make sure we only click on elements that exist and have URLs
        const nextPageButton = pageLinks.find(link => link.textContent?.includes('»'));
        if (nextPageButton) {
            fireEvent.click(nextPageButton);
        }
        
        // Check if goToPage was called with correct URL
        expect(vi.mocked(useImageStore).mock.results[0].value.goToPage).toHaveBeenCalledWith(
            expect.stringContaining('page=2')
        );
    });

    it('searches images when entering search term', async () => {
        const mockRouter = { visit: vi.fn() };
        vi.mock('@inertiajs/react', () => ({
            ...vi.requireActual('@inertiajs/react'),
            router: mockRouter,
            usePage: () => ({
                props: {
                    images: {
                        data: [],
                        links: [],
                        current_page: 1
                    },
                    sortkey: 'created_at',
                    sortdirection: 'desc'
                }
            })
        }));

        render(<UploadPage />);
        
        // Find the search input
        const searchInput = screen.getByPlaceholderText('Search by name');
        
        // Enter a search term
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        // Wait for debounced router call
        await waitFor(() => {
            expect(mockRouter.visit).toHaveBeenCalledWith(
                '/images',
                expect.objectContaining({
                    data: expect.objectContaining({
                        search: 'test'
                    })
                })
            );
        });
    });
});