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
                    />
                    <span className={styles.username}>{review.user.name}</span>
                </div>
                <div className={styles.rating}>
                    <StarIcon className={styles.starIcon} />
                    <span>{review.rating}</span>
                </div>
            </div>
            <h3 className={styles.title}>{review.title}</h3>
            <p className={styles.content}>{review.content}</p>
            <time className={styles.date}>{formatDate(review.created_at)}</time>
        </div>
    );
};