import { FC } from 'react';

interface AddReviewDialogProps {
    open: boolean;
    onClose: () => void;
    productId: number;
    onReviewAdded: () => void;
}

export const AddReviewDialog: FC<AddReviewDialogProps>;