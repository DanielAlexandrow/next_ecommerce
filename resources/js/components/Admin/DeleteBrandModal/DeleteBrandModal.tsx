import { useBrandStore } from "@/stores/useBrandStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { brandApi } from "@/api/brandApi";



const DeleteConfirmationDialog = () => {
	const {
		openDeleteModal, setOpenDeleteModal, modalBrand, brands, setBrands
	} = useBrandStore();

	const deleteBrand = async (id: number) => {
		try {
			const response = await brandApi.deleteBrand(id);
			setBrands(brands.filter((brand) => brand.id !== id));
			toast.success(response.headers['x-message']);
		} catch (error) {
			toast.error('Something went wrong, check your console.');
			console.error(error);
		}
		setOpenDeleteModal(false);
	};

	return (
		<Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
			<DialogContent>
				<DialogTitle>Delete Confirmation</DialogTitle>
				<DialogDescription>Are you sure you want to delete this brand?</DialogDescription>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Button onClick={() => deleteBrand(modalBrand?.id ?? 0)}>Confirm</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
};

export default DeleteConfirmationDialog