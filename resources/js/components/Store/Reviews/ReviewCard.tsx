import React from 'react';
import { Review } from '@/types';
import { StarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { styles } from './ReviewCard.styles';

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <img 
                        src={review.user.avatar} 
                        alt={review.user.name} 
                        className={styles.avatar}
                        data-testid="user-avatar"
                    />
                    <span className={styles.username} data-testid="user-name">{review.user.name}</span>
                </div>
                <div className={styles.rating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                            key={star}
                            data-testid="star-icon"
                            className={`${styles.starIcon} ${star <= review.rating ? 'fill-yellow-400' : ''}`}
                        />
                    ))}
                    <span data-testid="review-rating" className="sr-only">{review.rating}</span>
                </div>
            </div>
            <h3 className={styles.title} data-testid="review-title">{review.title}</h3>
            <p className={styles.content} data-testid="review-content">{review.content}</p>
            <time className={styles.date} data-testid="review-date">{formatDate(review.created_at)}</time>
        </div>
    );
};