import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StarRating } from '@/components/Store/Review/ReviewComponent';

describe('StarRating', () => {
    const defaultProps = {
        rating: 3,
        onRatingChange: vi.fn(),
    };

    it('renders correct number of stars', () => {
        render(<StarRating {...defaultProps} />);
        const stars = screen.getAllByTestId('star-rating-star');
        expect(stars).toHaveLength(5);
    });

    it('fills correct number of stars based on rating', () => {
        render(<StarRating {...defaultProps} />);
        const stars = screen.getAllByTestId('star-rating-star');

        // First 3 stars should be filled
        stars.slice(0, 3).forEach(star => {
            expect(star).toHaveClass('text-yellow-400', 'fill-yellow-400');
        });

        // Last 2 stars should be empty
        stars.slice(3).forEach(star => {
            expect(star).not.toHaveClass('fill-yellow-400');
            expect(star).toHaveClass('text-gray-300');
        });
    });

    it('handles click events', () => {
        const onRatingChange = vi.fn();
        render(<StarRating {...defaultProps} onRatingChange={onRatingChange} />);

        const stars = screen.getAllByTestId('star-rating-star');
        fireEvent.click(stars[4]); // Click the 5th star

        expect(onRatingChange).toHaveBeenCalledWith(5);
    });

    it('disables interaction in readonly mode', () => {
        const onRatingChange = vi.fn();
        render(<StarRating {...defaultProps} onRatingChange={onRatingChange} readOnly />);

        const stars = screen.getAllByTestId('star-rating-star');
        fireEvent.click(stars[4]);

        expect(onRatingChange).not.toHaveBeenCalled();
        expect(stars[0]).toHaveClass('cursor-default');
        expect(stars[0]).not.toHaveClass('hover:scale-110');
    });

    it('applies different sizes correctly', () => {
        const { rerender } = render(<StarRating {...defaultProps} size="sm" />);
        let stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).toHaveClass('w-4', 'h-4');

        rerender(<StarRating {...defaultProps} size="md" />);
        stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).toHaveClass('w-5', 'h-5');

        rerender(<StarRating {...defaultProps} size="lg" />);
        stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).toHaveClass('w-6', 'h-6');
    });

    it('defaults to medium size', () => {
        render(<StarRating {...defaultProps} />);
        const stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).toHaveClass('w-5', 'h-5');
    });

    it('applies hover effects only in interactive mode', () => {
        const { rerender } = render(<StarRating {...defaultProps} />);
        let stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).toHaveClass('hover:scale-110');

        rerender(<StarRating {...defaultProps} readOnly />);
        stars = screen.getAllByTestId('star-rating-star');
        expect(stars[0]).not.toHaveClass('hover:scale-110');
    });

    it('maintains consistent star order', () => {
        render(<StarRating {...defaultProps} />);
        const stars = screen.getAllByTestId('star-rating-star');

        // Click each star and verify the rating
        stars.forEach((star, index) => {
            fireEvent.click(star);
            expect(defaultProps.onRatingChange).toHaveBeenCalledWith(index + 1);
        });
    });
}); 