import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Reviews } from '../Reviews';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('axios');

describe('Reviews Component', () => {
    const mockReviews = [
        {
            id: 1,
            user_id: 1,
            title: 'Great Product',
            content: 'Really enjoyed this',
            rating: 5,
            user: { 
                id: 1,
                name: 'John Doe',
                avatar: '/path/to/avatar1'
            },
            created_at: '2024-01-20T12:00:00Z'
        },
        {
            id: 2,
            user_id: 2,
            title: 'Good Value',
            content: 'Worth the price',
            rating: 4,
            user: {
                id: 2,
                name: 'Jane Smith',
                avatar: '/path/to/avatar2'
            },
            created_at: '2024-01-21T12:00:00Z'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: { id: 1 } });
    });

    it('renders reviews list correctly', () => {
        render(
            <Reviews
                rating={4.5}
                reviews={mockReviews}
                productId={1}
                onReviewAdded={vi.fn()}
            />
        );

        expect(screen.getByText('Reviews')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument();
        expect(screen.getByText('(2 reviews)')).toBeInTheDocument();
        expect(screen.getByText('Great Product')).toBeInTheDocument();
        expect(screen.getByText('Good Value')).toBeInTheDocument();
    });

    it('shows empty state when no reviews', () => {
        render(
            <Reviews
                rating={0}
                reviews={[]}
                productId={1}
                onReviewAdded={vi.fn()}
            />
        );

        expect(screen.getByText('No reviews yet. Be the first to review!')).toBeInTheDocument();
    });

    it('opens review dialog when add review button is clicked', () => {
        render(
            <Reviews
                rating={4.5}
                reviews={mockReviews}
                productId={1}
                onReviewAdded={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Add Review'));
        expect(screen.getByText('Add Your Review')).toBeInTheDocument();
    });

    it('handles review submission successfully', async () => {
        const mockOnReviewAdded = vi.fn();
        (axios.post as any).mockResolvedValueOnce({ data: {} });

        render(
            <Reviews
                rating={4.5}
                reviews={mockReviews}
                productId={1}
                onReviewAdded={mockOnReviewAdded}
            />
        );

        // Open dialog
        fireEvent.click(screen.getByText('Add Review'));

        // Fill form
        fireEvent.change(screen.getByLabelText('Title'), {
            target: { value: 'Test Review' }
        });
        fireEvent.change(screen.getByLabelText('Review'), {
            target: { value: 'Test Content' }
        });
        // Select rating
        const stars = screen.getAllByTestId('star-rating');
        fireEvent.click(stars[4]); // 5 star rating

        // Submit
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/products/1/reviews', {
                title: 'Test Review',
                content: 'Test Content',
                rating: 5
            });
            expect(mockOnReviewAdded).toHaveBeenCalled();
        });
    });

    it('handles unauthorized review submission', async () => {
        (axios.post as any).mockRejectedValueOnce({
            response: { status: 403 }
        });

        render(
            <Reviews
                rating={4.5}
                reviews={mockReviews}
                productId={1}
                onReviewAdded={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Add Review'));
        fireEvent.change(screen.getByLabelText('Title'), {
            target: { value: 'Test Review' }
        });
        fireEvent.click(screen.getAllByTestId('star-rating')[4]);
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(screen.getByText('You must purchase this product before reviewing it')).toBeInTheDocument();
        });
    });
});