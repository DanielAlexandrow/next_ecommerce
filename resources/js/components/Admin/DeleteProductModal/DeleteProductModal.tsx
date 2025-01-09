import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { productApi } from '@/api/productApi';

interface DeleteProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId: number;
	productName: string;
	onDelete: () => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
	isOpen,
	onClose,
	productId,
	productName,
	onDelete
}) => {
	const [isDeleting, setIsDeleting] = React.useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await productApi.deleteProduct(productId);
			toast.success('Product deleted successfully');
			onDelete();
			onClose();
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Failed to delete product');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogTitle>Delete Product</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete "{productName}"? This action cannot be undone.
				</DialogDescription>
				<div className="mt-4 space-y-4">
					<div className="text-sm text-gray-500">
						This will permanently remove the product and all associated data:
						<ul className="list-disc list-inside mt-2">
							<li>Product information and details</li>
							<li>Associated images</li>
							<li>Inventory records</li>
							<li>Category associations</li>
						</ul>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete Product'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteProductModal;
