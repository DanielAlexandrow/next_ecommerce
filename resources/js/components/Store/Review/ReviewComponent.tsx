import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import Paginate from '@/components/pagination';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';
import { reviewApi } from '@/api/reviewApi';
import { Link } from '@inertiajs/react';
import { updateLinks } from '@/lib/utils';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

interface ReviewProps {
    productId: number;
    reviews: any;
    setReviews: React.Dispatch<React.SetStateAction<any>>;
    averageRating: number;
    setAverageRating: React.Dispatch<React.SetStateAction<number>>;
}

const ReviewComponent: React.FC<ReviewProps> = ({ productId, reviews, setReviews, averageRating, setAverageRating }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ title: '', content: '', rating: 0 });
    const [sortKey, setSortKey] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [links, setLinks] = useState(updateLinks(reviews.links, sortKey, sortDirection));
    const { auth } = usePage().props as any;

    useEffect(() => {
        setLinks(updateLinks(reviews.links, sortKey, sortDirection));
    }, [reviews, sortKey, sortDirection]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reviewApi.createReview(productId, newReview);
            setIsModalOpen(false);
            setNewReview({ title: '', content: '', rating: 0 });
            // Refresh reviews after submitting - you might need to implement this in the parent component
            toast.success('Review submitted successfully');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        }
    };

    const handleSortChange = (key: string) => {
        let newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortDirection(newSortDirection);
        return `${window.location.pathname}?sortkey=${key}&sortdirection=${newSortDirection}&page=${reviews.current_page}`;
    };

    const StarRating = ({ rating, onRatingChange }) => (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => onRatingChange(star)}
                />
            ))}
        </div>
    );

    return (
        <div>
            <h2>Product Reviews</h2>
            <div>Average Rating: {averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} onRatingChange={() => { }} />

            <div className="flex justify-between items-center my-4">
                {auth.user && (
                    <Button onClick={() => setIsModalOpen(true)}>Write a Review</Button>
                )}
            </div>

            <div className='mt-10'>{Paginate(links)}</div>

            <table className="w-full">
                <thead>
                    <tr>
                        <th>
                            <Link href={handleSortChange('created_at')}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Date {sortKey === 'created_at' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </span>
                            </Link>
                        </th>
                        <th>
                            <Link href={handleSortChange('rating')}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Rating {sortKey === 'rating' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </span>
                            </Link>
                        </th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>User</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.data && reviews.data.map((review: any) => (
                        <tr key={review.id}>
                            <td>{new Date(review.created_at).toLocaleDateString()}</td>
                            <td><StarRating rating={review.rating} onRatingChange={() => { }} /></td>
                            <td>{review.title}</td>
                            <td>{review.content}</td>
                            <td>{review.user.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='mt-10'>{Paginate(links)}</div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogTitle>Write a Review</DialogTitle>
                    <form onSubmit={handleSubmitReview}>
                        <Input
                            placeholder="Title"
                            value={newReview.title}
                            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Your review"
                            value={newReview.content}
                            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                        />
                        <StarRating
                            rating={newReview.rating}
                            onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                        />
                        <Button type="submit">Submit Review</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewComponent;