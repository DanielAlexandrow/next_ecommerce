import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
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
    const roundedRating = Math.round(rating);
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
                        star <= roundedRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
                        readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
                    )}
                    onClick={() => !readOnly && onRatingChange(star)}
                />
            ))}
        </div>
    );
};

const formatDate = (date: string) => {
    return new Date(date).toISOString().split('T')[0];
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        maxLength: number
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.slice(0, maxLength)
        }));
    };

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
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="review-form">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Review title"
                    value={formData.title}
                    onChange={(e) => handleInputChange(e, 100)}
                    maxLength={100}
                    disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 text-right">
                    {formData.title.length}/100
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Review</label>
                <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your review here..."
                    value={formData.content}
                    onChange={(e) => handleInputChange(e, 1000)}
                    maxLength={1000}
                    required
                    disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 text-right">
                    {formData.content.length}/1000
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <StarRating
                    rating={formData.rating}
                    onRatingChange={(rating) => !isSubmitting && setFormData(prev => ({ ...prev, rating }))}
                    size="lg"
                    readOnly={isSubmitting}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="submit-review-button"
                    aria-disabled={isSubmitting}
                    aria-label={isSubmitting ? 'Submitting review...' : 'Submit review'}
                >
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

    // Store sort state in session storage
    useEffect(() => {
        const savedSort = sessionStorage.getItem(`review-sort-${productId}`);
        if (savedSort) {
            const { key, direction } = JSON.parse(savedSort);
            setSortKey(key);
            setSortDirection(direction);
        }
    }, [productId]);

    useEffect(() => {
        sessionStorage.setItem(`review-sort-${productId}`, JSON.stringify({
            key: sortKey,
            direction: sortDirection
        }));
    }, [sortKey, sortDirection, productId]);

    const [links, setLinks] = useState(updateLinks(reviews.links, sortKey, sortDirection));

    useEffect(() => {
        setLinks(updateLinks(reviews.links, sortKey, sortDirection));
    }, [reviews, sortKey, sortDirection]);

    const handleSubmitReview = async (formData: ReviewFormData) => {
        try {
            await reviewApi.createReview(productId, formData);
            // Refresh reviews with current sort settings
            const response = await reviewApi.getReviews(productId, 1, sortKey, sortDirection);
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
        setIsLoading(true);
        const newDirection = sortDirection === 'asc' || sortKey !== key ? 'desc' : 'asc';
        setSortKey(key);
        setSortDirection(newDirection);

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

    const handlePageChange = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await reviewApi.getReviews(productId, page, 'created_at', 'desc');
            setReviews(response.reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Product Reviews</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-medium">{averageRating}</span>
                        <StarRating rating={averageRating} onRatingChange={() => { }} readOnly />
                        <span className="text-sm text-gray-500">
                            ({reviews.data.length} {reviews.data.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    Write a Review
                </Button>
            </div>

            <div className={cn("overflow-x-auto", isLoading && "opacity-50")}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-4">
                                <button
                                    onClick={() => handleSort('created_at')}
                                    className="flex items-center gap-2"
                                >
                                    Date
                                    {sortKey === 'created_at' && (
                                        sortDirection === 'desc' ? <FaArrowDown /> : <FaArrowUp />
                                    )}
                                </button>
                            </th>
                            <th className="text-left py-4">Review</th>
                            <th className="text-left py-4">
                                <button
                                    onClick={() => handleSort('rating')}
                                    className="flex items-center gap-2"
                                >
                                    Rating
                                    {sortKey === 'rating' && (
                                        sortDirection === 'desc' ? <FaArrowDown /> : <FaArrowUp />
                                    )}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">
                                    No reviews yet. Be the first to write one!
                                </td>
                            </tr>
                        ) : (
                            reviews.data.map((review) => (
                                <tr key={review.id} className="border-b">
                                    <td className="py-4 text-sm text-gray-500">
                                        {formatDate(review.created_at)}
                                    </td>
                                    <td className="py-4">
                                        <div className="space-y-2">
                                            <div className="font-medium">{review.title}</div>
                                            <div className="text-sm text-gray-600">{review.content}</div>
                                            <div className="text-sm text-gray-500">By {review.user.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <StarRating rating={review.rating} onRatingChange={() => { }} readOnly size="sm" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {reviews.data.length > 0 && (
                <Paginate links={links} onPageChange={handlePageChange} />
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your thoughts about this product with other customers
                    </DialogDescription>
                    <ReviewForm onSubmit={handleSubmitReview} onClose={() => setIsModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewComponent;