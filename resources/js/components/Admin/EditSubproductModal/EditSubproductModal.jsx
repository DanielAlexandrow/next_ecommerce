import { Dialog, DialogContent } from '@/components/ui/dialog';
import SubproductForm from '../SubproductForm/SubproductForm';
import { useEffect } from 'react';
import { productsStore } from '@/stores/productlist/productstore';

const EditSubproductModal: React.FC<{}> = () => {
	const [openSubproductFormModal, setOpenSubproductFormModal, setSelectedSubproduct] = productsStore((state) => [
		state.openSubproductFormModal,
		state.setOpenSubproductFormModal,
		state.setSelectedSubproduct,
	]);

	useEffect(() => {
		if (!openSubproductFormModal) {
			setSelectedSubproduct(null);
		}
	}, [openSubproductFormModal]);

	return (
		<Dialog open={openSubproductFormModal} onOpenChange={setOpenSubproductFormModal}>
			<DialogContent style={{ maxWidth: '30%', maxHeight: '40%', overflow: 'auto' }}>
				<SubproductForm mode={'edit'} />
			</DialogContent>
		</Dialog>
	);
};

export default EditSubproductModal;
