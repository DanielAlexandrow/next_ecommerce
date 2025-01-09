import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import Paginate from '@/components/pagination';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';
import { reviewApi } from '@/api/reviewApi';
import { updateLinks } from '@/lib/utils';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface Review {
    id: number;
    title: string;
    content: string;
    rating: number;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface ReviewsResponse {
    data: Review[];
    current_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface ReviewFormData {
    title: string;
    content: string;
    rating: number;
}

interface ReviewProps {
    productId: number;
    reviews: ReviewsResponse;
    setReviews: React.Dispatch<React.SetStateAction<ReviewsResponse>>;
    averageRating: number;
    setAverageRating: React.Dispatch<React.SetStateAction<number>>;
}

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    readOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    readOnly = false,
    size = 'md'
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    data-testid="star-rating-star"
                    className={cn(
                        sizes[size],
                        star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
                        readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
                    )}
                    onClick={() => !readOnly && onRatingChange(star)}
                />
            ))}
        </div>
    );
};

const ReviewForm: React.FC<{
    onSubmit: (data: ReviewFormData) => Promise<void>;
    onClose: () => void;
}> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState<ReviewFormData>({
        title: '',
        content: '',
        rating: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.rating) {
            toast.error('Please select a rating');
            return;
        }
        if (!formData.content.trim()) {
            toast.error('Please write a review');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                    id="title"
                    placeholder="Review title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={100}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Review</label>
                <Textarea
                    id="content"
                    placeholder="Write your review here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    maxLength={1000}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <StarRating
                    rating={formData.rating}
                    onRatingChange={(rating) => setFormData({ ...formData, rating })}
                    size="lg"
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
};

const ReviewComponent: React.FC<ReviewProps> = ({
    productId,
    reviews,
    setReviews,
    averageRating,
    setAverageRating
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortKey, setSortKey] = useState<'created_at' | 'rating'>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(false);
    const { auth } = usePage().props as any;

    const [links, setLinks] = useState(updateLinks(reviews.links, sortKey, sortDirection));

    useEffect(() => {
        setLinks(updateLinks(reviews.links, sortKey, sortDirection));
    }, [reviews, sortKey, sortDirection]);

    const handleSubmitReview = async (formData: ReviewFormData) => {
        try {
            await reviewApi.createReview(productId, formData);
            // Refresh reviews
            const response = await reviewApi.getReviews(productId);
            setReviews(response.reviews);
            setAverageRating(response.average);
            toast.success('Review submitted successfully');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
            throw error;
        }
    };

    const handleSort = async (key: 'created_at' | 'rating') => {
        const newDirection = sortDirection === 'asc' || sortKey !== key ? 'desc' : 'asc';
        setSortKey(key);
        setSortDirection(newDirection);

        setIsLoading(true);
        try {
            const response = await reviewApi.getReviews(productId, reviews.current_page, key, newDirection);
            setReviews(response.reviews);
        } catch (error) {
            console.error('Error sorting reviews:', error);
            toast.error('Failed to sort reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
        if (!active) return null;
        return direction === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Product Reviews</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-medium">{averageRating.toFixed(1)}</span>
                        <StarRating rating={Math.round(averageRating)} onRatingChange={() => { }} readOnly size="sm" />
                        <span className="text-sm text-gray-500">
                            ({reviews.data.length} {reviews.data.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>

                {auth.user && (
                    <Button onClick={() => setIsModalOpen(true)}>Write a Review</Button>
                )}
            </div>

            {reviews.data.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-3 px-4 text-left">
                                        <button
                                            onClick={() => handleSort('created_at')}
                                            className="flex items-center font-medium hover:text-primary"
                                        >
                                            Date
                                            <SortIcon
                                                active={sortKey === 'created_at'}
                                                direction={sortDirection}
                                            />
                                        </button>
                                    </th>
                                    <th className="py-3 px-4 text-left">
                                        <button
                                            onClick={() => handleSort('rating')}
                                            className="flex items-center font-medium hover:text-primary"
                                        >
                                            Rating
                                            <SortIcon
                                                active={sortKey === 'rating'}
                                                direction={sortDirection}
                                            />
                                        </button>
                                    </th>
                                    <th className="py-3 px-4 text-left">Review</th>
                                    <th className="py-3 px-4 text-left">By</th>
                                </tr>
                            </thead>
                            <tbody className={cn(isLoading && 'opacity-50')}>
                                {reviews.data.map((review) => (
                                    <tr key={review.id} className="border-b">
                                        <td className="py-4 px-4">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <StarRating
                                                rating={review.rating}
                                                onRatingChange={() => { }}
                                                readOnly
                                                size="sm"
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            {review.title && (
                                                <div className="font-medium">{review.title}</div>
                                            )}
                                            <div className="text-gray-600">{review.content}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-600">
                                                {review.user.name}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        {Paginate(links)}
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this product!
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your thoughts about this product with other customers
                    </DialogDescription>
                    <ReviewForm
                        onSubmit={handleSubmitReview}
                        onClose={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewComponent;