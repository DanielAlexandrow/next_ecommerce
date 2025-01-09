import { BaseModal, DefaultModalFooter } from '@/components/ui/modal/BaseModal';
import { brandApi } from '@/api/brandApi';
import { toast } from 'react-toastify';
import { useBrandStore } from '@/stores/useBrandStore';
import { useState } from 'react';

export default function DeleteConfirmationDialog() {
	const {
		openDeleteModal, setOpenDeleteModal, modalBrand, brands, setBrands
	} = useBrandStore();

	const [isLoading, setIsLoading] = useState(false);

	const handleDelete = async () => {
		if (!modalBrand) return;

		setIsLoading(true);
		try {
			await brandApi.deleteBrand(modalBrand.id);
			setBrands(brands.filter(brand => brand.id !== modalBrand.id));
			toast.success('Brand deleted successfully');
			setOpenDeleteModal(false);
		} catch (error) {
			toast.error('Failed to delete brand');
		} finally {
			setIsLoading(false);
		}
	};

	const description = (
		<>
			<p className="text-red-600 mb-2">This action cannot be undone.</p>
			<p>
				Are you sure you want to delete the brand "{modalBrand?.name}"?
				{modalBrand?.products_count && modalBrand.products_count > 0 && (
					<span className="text-red-600">
						{' '}This brand has {modalBrand.products_count} products associated with it.
					</span>
				)}
			</p>
		</>
	);

	return (
		<BaseModal
			open={openDeleteModal}
			onOpenChange={setOpenDeleteModal}
			title="Delete Brand"
			description={description}
			variant="destructive"
			testId="delete-brand-modal"
			footer={
				<DefaultModalFooter
					onCancel={() => setOpenDeleteModal(false)}
					onConfirm={handleDelete}
					confirmText="Delete"
					confirmVariant="destructive"
				/>
			}
		>
			<></>
		</BaseModal>
	);
}