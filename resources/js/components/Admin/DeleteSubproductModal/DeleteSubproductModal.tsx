import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { subproductApi } from '@/api/subproductApi';

interface DeleteSubproductModalProps {
	isOpen: boolean;
	onClose: () => void;
	subproductId: number;
	subproductName: string;
	onDelete: () => void;
}

const DeleteSubproductModal: React.FC<DeleteSubproductModalProps> = ({
	isOpen,
	onClose,
	subproductId,
	subproductName,
	onDelete
}) => {
	const [isDeleting, setIsDeleting] = React.useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await subproductApi.deleteSubproduct(subproductId);
			toast.success('Variant deleted successfully');
			onDelete();
			onClose();
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Failed to delete variant');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogTitle>Delete Product Variant</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete "{subproductName}"? This action cannot be undone.
				</DialogDescription>
				<div className="mt-4 space-y-4">
					<div className="text-sm text-gray-500">
						This will permanently remove:
						<ul className="list-disc list-inside mt-2">
							<li>Variant information</li>
							<li>Stock records</li>
							<li>Price history</li>
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
							{isDeleting ? 'Deleting...' : 'Delete Variant'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteSubproductModal;
