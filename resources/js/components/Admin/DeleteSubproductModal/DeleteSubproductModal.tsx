import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '../../ui/button';
import { toast } from 'react-toastify';
import { productsStore } from '@/stores/productlist/productstore';
import axios from 'axios';
import { subproductApi } from '@/api/subproductApi';

const DeleteSubproductModal: React.FC = () => {
	const [selectedSubproduct, open, setOpen, setSubproductsModal, subproducts, setSubproducts] = productsStore(
		(state) => [
			state.selectedSubproduct,
			state.openDeleteSubproductModal,
			state.setOpenDeleteSubproductModal,
			state.setSubproductsModal,
			state.subproducts,
			state.setSubproducts,
		]
	);

	if (!selectedSubproduct) return null;

	const deleteSubproduct = async () => {
		if (!selectedSubproduct) return;

		try {
			await subproductApi.deleteSubproduct(selectedSubproduct.id);

			setOpen(false);
			const updatedSubproducts = subproducts.filter((subproduct) => subproduct.id !== selectedSubproduct.id);
			setSubproducts(updatedSubproducts);
			toast.success('Option deleted successfully');
			setSubproductsModal(true);
		} catch (error) {
			toast.error('Error deleting product');
			console.error('Delete error:', error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild></DialogTrigger>
			<DialogContent>
				<DialogTitle>Delete Subproduct {selectedSubproduct.name}?</DialogTitle>
				<DialogContent>This action is irreversable</DialogContent>
				<DialogFooter className='mt-10'>
					<Button onClick={deleteSubproduct}>Delete</Button>{' '}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteSubproductModal;
