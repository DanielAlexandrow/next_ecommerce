import React, { useState } from 'react';
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { StarIcon, PlusIcon } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { AddReviewDialog } from './AddReviewDialog';
import { styles } from './Reviews.styles';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';

interface ReviewsProps {
    rating: number;
    reviews?: Review[];
    productId: number;
    onReviewAdded: () => void;
}

export const Reviews = ({ rating, reviews = [], productId, onReviewAdded }: ReviewsProps) => {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newReview, setNewReview] = useState({
        title: '',
        content: '',
        rating: 0
    });

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`/products/${productId}/reviews`, newReview);
            toast.success('Review submitted successfully');
            setIsDialogOpen(false);
            setNewReview({ title: '', content: '', rating: 0 });
            onReviewAdded();
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error('You must purchase this product before reviewing it');
            } else {
                toast.error('Failed to submit review');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.ratingContainer}>
                    <h2 className={styles.title}>Reviews</h2>
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                    <span className={styles.rating}>{rating.toFixed(1)}</span>
                    <span className={styles.reviewCount}>({reviews.length} reviews)</span>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className={styles.addReviewButton}>
                    <PlusIcon className="h-4 w-4" />
                    Add Review
                </Button>
            </div>

            <div className={styles.reviewList}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
                )}
            </div>

            <AddReviewDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                productId={productId}
                onReviewAdded={onReviewAdded}
            />
        </div>
    );
};