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
    }),
    Link: ({ href, children, preserveScroll, preserveState, ...props }) => (
        <a href={href} {...props}>{children}</a>
    )
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
            links: [
                { url: '?page=1', label: 'Previous', active: false },  // Previous
                { url: '?page=1', label: '1', active: true },   // Page 1
                { url: '?page=2', label: '2', active: false },  // Page 2
                { url: '?page=2', label: 'Next', active: false }   // Next
            ]
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

    it('handles pagination correctly', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        const paginatedReviews = {
            ...mockProps.reviews,
            current_page: 2,
            links: [
                { url: 'http://localhost/reviews?page=1', label: 'Previous', active: false },
                { url: 'http://localhost/reviews?page=1', label: '1', active: false },
                { url: 'http://localhost/reviews?page=2', label: '2', active: true },
                { url: null, label: 'Next', active: false }
            ]
        };

        vi.mocked(reviewApi.getReviews).mockResolvedValueOnce({
            reviews: paginatedReviews,
            average: 4.5
        });

        render(<ReviewComponent {...mockProps} reviews={paginatedReviews} />);

        // Click on page 1
        const page1Link = screen.getByText('1');
        await act(async () => {
            fireEvent.click(page1Link);
        });

        expect(reviewApi.getReviews).toHaveBeenCalledWith(
            mockProps.productId,
            1,
            'created_at',
            'desc'
        );
    });

    it('handles multiple sort directions', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.getReviews).mockResolvedValue({
            reviews: mockProps.reviews,
            average: 4.5
        });

        render(<ReviewComponent {...mockProps} />);

        // Click rating sort button twice to toggle direction
        const ratingSort = screen.getByText('Rating');
        await act(async () => {
            fireEvent.click(ratingSort); // First click - desc
            fireEvent.click(ratingSort); // Second click - asc
        });

        expect(reviewApi.getReviews).toHaveBeenCalledWith(
            mockProps.productId,
            mockProps.reviews.current_page,
            'rating',
            'asc'
        );
    });

    it('displays review dates in correct format', () => {
        render(<ReviewComponent {...mockProps} />);

        const reviewDates = screen.getAllByText(/202\d-\d{2}-\d{2}/);
        expect(reviewDates).toHaveLength(2);
        expect(reviewDates[0]).toHaveTextContent('2024-01-01');
        expect(reviewDates[1]).toHaveTextContent('2024-01-02');
    });

    it('shows correct average rating display', () => {
        render(<ReviewComponent {...mockProps} />);

        expect(screen.getByText('4.5')).toBeInTheDocument();
        const stars = screen.getAllByTestId('star-rating-star');
        const filledStars = stars.filter(star => star.classList.contains('fill-yellow-400'));
        expect(filledStars).toHaveLength(5); // Should round up to 5 stars
    });

    it('handles review form character limits', async () => {
        render(<ReviewComponent {...mockProps} />);

        fireEvent.click(screen.getByText('Write a Review'));

        const titleInput = screen.getByPlaceholderText('Review title');
        const contentInput = screen.getByPlaceholderText('Write your review here...');

        await act(async () => {
            fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } }); // Over 100 char limit
            fireEvent.change(contentInput, { target: { value: 'a'.repeat(1001) } }); // Over 1000 char limit
        });

        expect(titleInput).toHaveValue('a'.repeat(100)); // Should be truncated
        expect(contentInput).toHaveValue('a'.repeat(1000)); // Should be truncated
    });

    it('handles review submission with minimum required fields', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.createReview).mockResolvedValueOnce({});
        vi.mocked(reviewApi.getReviews).mockResolvedValueOnce({
            reviews: mockProps.reviews,
            average: 4.5
        });

        render(<ReviewComponent {...mockProps} />);

        fireEvent.click(screen.getByText('Write a Review'));

        // Only fill required fields (rating and content)
        const stars = screen.getAllByTestId('star-rating-star');
        const contentInput = screen.getByPlaceholderText('Write your review here...');

        await act(async () => {
            fireEvent.click(stars[4]); // 5-star rating
            fireEvent.change(contentInput, { target: { value: 'Minimum review' } });
            fireEvent.submit(contentInput.closest('form')!);
        });

        await waitFor(() => {
            expect(reviewApi.createReview).toHaveBeenCalledWith(mockProps.productId, {
                rating: 5,
                content: 'Minimum review',
                title: '' // Optional field
            });
        });
    });

    it('handles network errors during review submission', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.createReview).mockRejectedValueOnce(new Error('Network Error'));

        render(<ReviewComponent {...mockProps} />);

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

    it('maintains sort state between page navigations', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        vi.mocked(reviewApi.getReviews).mockResolvedValue({
            reviews: {
                ...mockProps.reviews,
                current_page: 2
            },
            average: 4.5
        });

        render(<ReviewComponent {...mockProps} />);

        // Change sort to rating desc
        const ratingSort = screen.getByText('Rating');
        await act(async () => {
            fireEvent.click(ratingSort);
        });

        // Navigate to next page
        const nextPage = screen.getByText('2');
        await act(async () => {
            fireEvent.click(nextPage);
        });

        // Should maintain sort settings
        expect(reviewApi.getReviews).toHaveBeenLastCalledWith(
            mockProps.productId,
            2,
            'rating',
            'desc'
        );
    });

    it('disables submit button during review submission', async () => {
        const { reviewApi } = await import('@/api/reviewApi');
        let resolveSubmission: (value: unknown) => void;
        const submissionPromise = new Promise(resolve => {
            resolveSubmission = resolve;
        });

        vi.mocked(reviewApi.createReview).mockImplementationOnce(() => submissionPromise as Promise<any>);

        render(<ReviewComponent {...mockProps} />);

        // Open modal
        await act(async () => {
            fireEvent.click(screen.getByText('Write a Review'));
        });

        const stars = screen.getAllByTestId('star-rating-star');
        const contentInput = screen.getByPlaceholderText('Write your review here...');
        const submitButton = screen.getByTestId('submit-review-button');

        // Fill form
        await act(async () => {
            fireEvent.click(stars[4]);
            fireEvent.change(contentInput, { target: { value: 'Test review' } });
        });

        // Submit form
        await act(async () => {
            fireEvent.submit(contentInput.closest('form')!);
        });

        // Check disabled state immediately after submission
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveTextContent('Submitting...');
        });

        // Resolve the submission
        await act(async () => {
            resolveSubmission!({});
        });

        // Check enabled state after submission completes
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent('Submit Review');
        });
    });
}); 