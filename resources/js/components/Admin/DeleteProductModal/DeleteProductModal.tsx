import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../../ui/button';
import { toast } from 'react-toastify';
import { productsStore } from '@/stores/productlist/productstore';
import axois from 'axios';

const DeleteProductModal = () => {
	const [selectedProduct, open, setOpen] = productsStore((state) => [
		state.selectedProduct,
		state.openDeleteProductModal,
		state.setOpenDeleteProductModal,
	]);

	if (!selectedProduct) {
		return null;
	}

	const deleteProduct = async () => {
		try {
			const response = await axois.delete(`/products/${selectedProduct.id}`);
			if (response.status === 204) {
				setOpen(false);
				toast.success(response.headers['x-message']);
			} else {
				toast.error('Something went wrong, check your console.');
				throw new Error('Product not deleted');
			}
		} catch (error) {
			toast.error('Something went wrong, check your console.');
			console.error('something went wrong, check your console.');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogTitle>Delete Product {selectedProduct.name}?</DialogTitle>
				<DialogContent>This action is irreversable</DialogContent>
				<DialogFooter className='mt-10'>
					<Button onClick={deleteProduct}>Delete</Button>{' '}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteProductModal;
