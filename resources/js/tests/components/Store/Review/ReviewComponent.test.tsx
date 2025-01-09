import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewComponent from '@/components/Store/Review/ReviewComponent';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/api/reviewApi', () => ({
    reviewApi: {
        createReview: vi.fn(),
        getReviews: vi.fn(),
    },
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            auth: {
                user: { id: 1, name: 'Test User' }
            }
        }
    })
}));

describe('ReviewComponent', () => {
    const mockProps = {
        productId: 1,
        reviews: {
            data: [
                {
                    id: 1,
                    title: 'Great Product',
                    content: 'Really enjoyed it',
                    rating: 5,
                    created_at: '2024-01-01',
                    user: { id: 1, name: 'John Doe' }
                },
                {
                    id: 2,
                    title: 'Good Product',
                    content: 'Nice quality',
                    rating: 4,
                    created_at: '2024-01-02',
                    user: { id: 2, name: 'Jane Doe' }
                }
            ],
            current_page: 1,
            links: []
        },
        setReviews: vi.fn(),
        averageRating: 4.5,
        setAverageRating: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates form inputs', async () => {
        render(<ReviewComponent {...mockProps} />);

        // Open review modal
        const writeReviewButton = screen.getByText('Write a Review');
        fireEvent.click(writeReviewButton);

        // Try to submit without rating
        const submitButton = screen.getByText('Submit Review');
        await act(async () => {
            fireEvent.submit(submitButton.closest('form')!);
        });

        expect(toast.error).toHaveBeenCalledWith('Please select a rating');

        // Set rating but no content
        const stars = screen.getAllByTestId('star-rating-star');
        await act(async () => {
            fireEvent.click(stars[4]); // 5-star rating
            fireEvent.submit(submitButton.closest('form')!);
        });

        expect(toast.error).toHaveBeenCalledWith('Please write a review');
    });

    it('handles review submission', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.createReview).mockResolvedValueOnce({});
        vi.mocked(reviewApi.getReviews).mockResolvedValueOnce({
            reviews: mockProps.reviews,
            average: 4.5
        });

        render(<ReviewComponent {...mockProps} />);

        // Open review modal
        fireEvent.click(screen.getByText('Write a Review'));

        // Fill form
        const stars = screen.getAllByTestId('star-rating-star');
        const contentInput = screen.getByPlaceholderText('Write your review here...');

        await act(async () => {
            fireEvent.click(stars[4]); // 5-star rating
            fireEvent.change(contentInput, { target: { value: 'Great product!' } });
            fireEvent.submit(contentInput.closest('form')!);
        });

        await waitFor(() => {
            expect(reviewApi.createReview).toHaveBeenCalledWith(mockProps.productId, {
                rating: 5,
                content: 'Great product!',
                title: ''
            });
            expect(toast.success).toHaveBeenCalledWith('Review submitted successfully');
        });
    });

    it('handles API errors gracefully', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.createReview).mockRejectedValueOnce(new Error('API Error'));

        render(<ReviewComponent {...mockProps} />);

        // Open modal and fill form
        fireEvent.click(screen.getByText('Write a Review'));

        const stars = screen.getAllByTestId('star-rating-star');
        const contentInput = screen.getByPlaceholderText('Write your review here...');

        await act(async () => {
            fireEvent.click(stars[4]);
            fireEvent.change(contentInput, { target: { value: 'Test review' } });
            fireEvent.submit(contentInput.closest('form')!);
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to submit review');
        });
    });

    it('shows empty state when no reviews', () => {
        render(<ReviewComponent {...mockProps} reviews={{ ...mockProps.reviews, data: [] }} />);
        expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    });

    it('handles loading state during sort', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.getReviews).mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                reviews: mockProps.reviews,
                average: 4.5
            }), 100))
        );

        render(<ReviewComponent {...mockProps} />);

        const sortButton = screen.getByText('Rating');
        await act(async () => {
            fireEvent.click(sortButton);
        });

        // Check if loading class is applied to the table container
        const reviewsContainer = screen.getByRole('table').closest('div');
        expect(reviewsContainer?.parentElement).toHaveClass('opacity-50');

        // Wait for loading to complete
        await waitFor(() => {
            expect(reviewsContainer?.parentElement).not.toHaveClass('opacity-50');
        });
    });
}); 