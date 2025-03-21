import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewCard } from '../ReviewCard';

describe('ReviewCard Component', () => {
    const mockReview = {
        id: 1,
        title: 'Great Product',
        content: 'Really enjoyed using this product',
        rating: 5,
        user_id: 123,
        user: {
            name: 'John Doe',
            avatar: '/path/to/avatar',
            id: 123
        },
        created_at: '2024-01-20T12:00:00Z'
    };

    it('renders review details correctly', () => {
        render(<ReviewCard review={mockReview} />);

        expect(screen.getByText('Great Product')).toBeInTheDocument();
        expect(screen.getByText('Really enjoyed using this product')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        // Check for 5 filled stars
        const stars = screen.getAllByTestId('star-icon');
        expect(stars).toHaveLength(5);
        stars.forEach(star => {
            expect(star).toHaveClass('fill-yellow-400');
        });
    });

    it('formats the date correctly', () => {
        render(<ReviewCard review={mockReview} />);
        // This will show the relative time based on the date
        expect(screen.getByTestId('review-date')).toBeInTheDocument();
    });

    it('handles missing content gracefully', () => {
        const reviewWithoutContent = {
            ...mockReview,
            content: undefined
        };
        render(<ReviewCard review={reviewWithoutContent} />);
        expect(screen.getByText('Great Product')).toBeInTheDocument();
        // Should not throw error for missing content
    });
});