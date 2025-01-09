import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewComponent from '@/components/Store/Review/ReviewComponent';
import { reviewApi } from '@/api/reviewApi';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';

// Mock modules
vi.mock('@/api/reviewApi', () => ({
    reviewApi: {
        getReviews: vi.fn(),
        createReview: vi.fn()
    }
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn()
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

describe('ReviewComponent', () => {
    const mockReviews = {
        data: [
            {
                id: 1,
                title: 'Great Product',
                content: 'Really enjoyed this',
                rating: 5,
                created_at: '2024-01-01T00:00:00.000Z',
                user: {
                    id: 1,
                    name: 'John Doe'
                }
            },
            {
                id: 2,
                title: 'Good Value',
                content: 'Worth the price',
                rating: 4,
                created_at: '2024-01-02T00:00:00.000Z',
                user: {
                    id: 2,
                    name: 'Jane Smith'
                }
            }
        ],
        current_page: 1,
        links: [
            { url: null, label: 'Previous', active: false },
            { url: '?page=1', label: '1', active: true },
            { url: null, label: 'Next', active: false }
        ]
    };

    const defaultProps = {
        productId: 1,
        reviews: mockReviews,
        setReviews: vi.fn(),
        averageRating: 4.5,
        setAverageRating: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (usePage as any).mockReturnValue({
            props: {
                auth: {
                    user: { id: 1, name: 'Test User' }
                }
            }
        });
    });

    it('renders review list correctly', () => {
        render(<ReviewComponent {...defaultProps} />);

        expect(screen.getByText('Product Reviews')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument();
        expect(screen.getByText('Great Product')).toBeInTheDocument();
        expect(screen.getByText('Good Value')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('handles review submission', async () => {
        (reviewApi.createReview as any).mockResolvedValueOnce({});
        (reviewApi.getReviews as any).mockResolvedValueOnce({
            reviews: mockReviews,
            average: 4.5
        });

        render(<ReviewComponent {...defaultProps} />);

        // Open review modal
        fireEvent.click(screen.getByText('Write a Review'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('Review title'), {
            target: { value: 'Test Review' }
        });
        fireEvent.change(screen.getByPlaceholderText('Write your review here...'), {
            target: { value: 'Test Content' }
        });

        // Select rating
        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]); // 5-star rating

        // Submit form
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(reviewApi.createReview).toHaveBeenCalledWith(1, {
                title: 'Test Review',
                content: 'Test Content',
                rating: 5
            });
            expect(toast.success).toHaveBeenCalledWith('Review submitted successfully');
        });
    });

    it('validates form inputs', async () => {
        render(<ReviewComponent {...defaultProps} />);

        // Open review modal
        fireEvent.click(screen.getByText('Write a Review'));

        // Try to submit without required fields
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Please select a rating');
        });

        // Fill rating but no content
        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]);
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Please write a review');
        });
    });

    it('sorts reviews', async () => {
        (reviewApi.getReviews as any).mockResolvedValueOnce({
            reviews: {
                ...mockReviews,
                data: [...mockReviews.data].reverse()
            },
            average: 4.5
        });

        render(<ReviewComponent {...defaultProps} />);

        // Click rating sort button
        fireEvent.click(screen.getByText('Rating'));

        await waitFor(() => {
            expect(reviewApi.getReviews).toHaveBeenCalledWith(1, 1, 'rating', 'desc');
        });
    });

    it('handles API errors gracefully', async () => {
        (reviewApi.createReview as any).mockRejectedValueOnce(new Error('API Error'));

        render(<ReviewComponent {...defaultProps} />);

        // Open review modal
        fireEvent.click(screen.getByText('Write a Review'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('Review title'), {
            target: { value: 'Test Review' }
        });
        fireEvent.change(screen.getByPlaceholderText('Write your review here...'), {
            target: { value: 'Test Content' }
        });
        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]);

        // Submit form
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to submit review');
        });
    });

    it('shows empty state when no reviews', () => {
        render(<ReviewComponent {...defaultProps} reviews={{ ...mockReviews, data: [] }} />);
        expect(screen.getByText('No reviews yet. Be the first to review this product!')).toBeInTheDocument();
    });

    it('handles loading state during sort', async () => {
        (reviewApi.getReviews as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(<ReviewComponent {...defaultProps} />);

        await act(async () => {
            fireEvent.click(screen.getByText('Rating'));
        });

        const table = screen.getByRole('table');
        expect(table.className).toContain('opacity-50');

        await waitFor(() => {
            expect(reviewApi.getReviews).toHaveBeenCalled();
        });
    });
}); 