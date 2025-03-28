import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number | null;
    className?: string;
}

export function StarRating({ rating = null, className = '' }: StarRatingProps) {
    if (rating === null) {
        console.warn('StarRating: No rating provided');
        return (
            <div className={`flex items-center gap-0.5 ${className}`}>
                <span className="text-sm text-muted-foreground">No rating available</span>
            </div>
        );
    }

    if (isNaN(rating) || rating < 0 || rating > 5) {
        console.error(`StarRating: Invalid rating value: ${rating}. Rating must be between 0 and 5.`);
        return (
            <div className={`flex items-center gap-0.5 ${className}`}>
                <span className="text-sm text-muted-foreground">Invalid rating</span>
            </div>
        );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />
            ))}
            {hasHalfStar && (
                <StarHalf className="h-4 w-4 text-primary" />
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">
                {rating.toFixed(1)}
            </span>
        </div>
    );
}