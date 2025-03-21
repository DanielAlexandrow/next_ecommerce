import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AddReviewDialogProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  onReviewAdded: () => void;
}

export const AddReviewDialog: React.FC<AddReviewDialogProps> = ({ 
  open, 
  onClose, 
  productId, 
  onReviewAdded 
}) => {
  const [review, setReview] = useState({
    title: '',
    content: '',
    rating: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setReview(prev => ({ ...prev, rating: newRating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReview(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (review.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!review.title.trim()) {
      toast.error('Please enter a title for your review');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/products/${productId}/reviews`, review);
      toast.success('Review submitted successfully');
      onClose();
      setReview({ title: '', content: '', rating: 0 });
      onReviewAdded();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You must purchase this product before reviewing it');
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Your Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitReview}>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  data-testid="star-rating"
                  className={`h-8 w-8 cursor-pointer ${
                    star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                name="title"
                value={review.title}
                onChange={handleInputChange}
                placeholder="Sum up your experience"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Review</label>
              <Textarea
                id="content"
                name="content"
                value={review.content}
                onChange={handleInputChange}
                placeholder="Share your thoughts about the product"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};