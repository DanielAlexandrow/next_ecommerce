import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ProductOptionsForm from '../SubproductForm/SubproductForm';
import { productsStore } from '@/stores/productlist/productstore';

const NewSubproductModal: React.FC = () => {
	const [openNewSubproductModal, setOpenNewSubproductModal] = productsStore((state) => [
		state.openNewSubproductModal,
		state.setOpenNewSubproductModal,
	]);

	if (!openNewSubproductModal) {
		return null;
	}

	return (
		<Dialog open={openNewSubproductModal} onOpenChange={setOpenNewSubproductModal}>
			<DialogContent style={{ maxWidth: '30%', maxHeight: '40%', overflow: 'auto' }}>
				<ProductOptionsForm mode={'new'} />
			</DialogContent>
		</Dialog>
	);
};

export default NewSubproductModal;
