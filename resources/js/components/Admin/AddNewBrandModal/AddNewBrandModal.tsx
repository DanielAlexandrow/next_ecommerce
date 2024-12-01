import { handleFormError } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { z } from "zod";
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input";
import { useBrandStore } from "@/stores/useBrandStore";
import { brandApi, BrandData } from "@/api/brandApi";

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

	let defaultValues: BrandData = {
		name: '',
	};

	if (modalMode === 'update' && modalBrand) {
		defaultValues = {
			name: modalBrand.name,
		};
	}

	const form = useForm<BrandData>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues,
	});

	const addBrand = async (values: BrandData) => {
		try {
			const newBrand = await brandApi.addBrand(values);
			setOpenAddBrandModal(false);
			setBrands([...brands, newBrand]);
			toast.success('Brand added successfully');
		} catch (error) {
			handleFormError(error, form);
		}
	};

	const updateBrand = async (values: BrandData) => {
		try {
			if (modalBrand?.id) {
				const updatedBrand = await brandApi.updateBrand(modalBrand.id, values);
				setOpenAddBrandModal(false);
				setBrands(
					brands.map((brand) =>
						brand.id === updatedBrand.id ? updatedBrand : brand
					)
				);
				toast.success('Brand updated successfully');
			}
		} catch (error) {
			handleFormError(error, form);
		}
	};

	const onSubmit = async (values: BrandData) => {
		if (modalMode === 'add') {
			await addBrand(values);
		} else if (modalMode === 'update') {
			await updateBrand(values);
		}
	};

	const title = modalMode === 'update' ? 'Update brand' : 'Add new brand';

	return (
		<Dialog open={openAddBrandModal} onOpenChange={setOpenAddBrandModal}>
			<DialogContent>
				<DialogTitle>{title}</DialogTitle>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='flex'>
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
							<Button type='submit' className='mt-5'>
								Submit
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default AddNewBrandDialog;