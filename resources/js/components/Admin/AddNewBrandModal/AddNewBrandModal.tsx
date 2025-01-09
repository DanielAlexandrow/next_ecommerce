import { handleFormError } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input";
import { useBrandStore } from "@/stores/useBrandStore";
import { brandApi, BrandData } from "@/api/brandApi";
import { z } from "zod";
import { BaseModal, DefaultModalFooter } from "@/components/ui/modal/BaseModal";
import { useFormModal } from "@/hooks/useFormModal";

const formSchema = z.object({
	name: z.string().min(4).max(50),
});

const AddNewBrandDialog = () => {
	const {
		openAddBrandModal,
		setOpenAddBrandModal,
		brands,
		setBrands,
		modalMode,
		modalBrand
	} = useBrandStore();

	const defaultValues: BrandData = {
		name: modalMode === 'update' && modalBrand ? modalBrand.name : '',
	};

	const form = useForm<BrandData>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const { handleSubmit, isLoading } = useFormModal({
		form,
		onSubmit: async (values) => {
			if (modalMode === 'update' && modalBrand?.id) {
				const updatedBrand = await brandApi.updateBrand(modalBrand.id, values);
				setBrands(
					brands.map((brand) =>
						brand.id === updatedBrand.id ? updatedBrand : brand
					)
				);
				return updatedBrand;
			} else {
				const newBrand = await brandApi.addBrand(values);
				setBrands([...brands, newBrand]);
				return newBrand;
			}
		},
		successMessage: modalMode === 'update' ? 'Brand updated successfully' : 'Brand added successfully'
	});

	const title = modalMode === 'update' ? 'Update brand' : 'Add new brand';

	return (
		<BaseModal
			open={openAddBrandModal}
			onOpenChange={setOpenAddBrandModal}
			title={title}
			testId="add-brand-modal"
			footer={
				<DefaultModalFooter
					onCancel={() => setOpenAddBrandModal(false)}
					onConfirm={form.handleSubmit(handleSubmit)}
					confirmText="Submit"
				/>
			}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='flex'>
					<div className='flex-1 pr-4'>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder='' {...field} maxLength={50} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</BaseModal>
	);
};

export default AddNewBrandDialog;