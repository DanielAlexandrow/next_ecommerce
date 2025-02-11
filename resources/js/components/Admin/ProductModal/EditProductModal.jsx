import { Dialog, DialogContent } from '@/components/ui/dialog';
import { productsStore } from '@/stores/productlist/productstore';
import ProductForm from '../ProductForm/ProductForm';

const EditProductModal: React.FC = () => {
	const [openEditProductModal, setOpenEditProductModal, selectedProduct] = productsStore((state) => [
		state.openEditProductModal,
		state.setOpenEditProductModal,
		state.selectedProduct,
	]);

	return (
		<Dialog open={openEditProductModal} onOpenChange={setOpenEditProductModal}>
			<DialogContent style={{ maxWidth: '80%', maxHeight: '80%', overflow: 'auto' }}>
				<ProductForm mode={'edit'} product={selectedProduct} />
			</DialogContent>
		</Dialog>
	);
};

export default EditProductModal;
