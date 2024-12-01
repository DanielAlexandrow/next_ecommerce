import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'react-toastify';
import { productsStore } from '@/stores/productlist/productstore';
import { SubproductImage } from '@/types';
import axios from 'axios';
import { Checkbox } from '../../ui/checkbox';
import { handleFormError } from '@/lib/utils';
import { subproductApi } from '@/api/subproductApi';

interface SubproductFormFormProps {
	mode: 'edit' | 'new';
}

const SubproductForm = ({ mode }: SubproductFormFormProps): React.ReactNode => {
	const [
		selectedProduct,
		selectedSubproduct,
		setOpenNewSubproductModal,
		subproducts,
		setSubproducts,
		setSelectedSubproduct,
	] = productsStore((state) => [
		state.selectedProduct,
		state.selectedSubproduct,
		state.setOpenNewSubproductModal,
		state.subproducts,
		state.setSubproducts,
		state.setSelectedSubproduct,
	]);

	const [productImages, setProductImages] = useState<SubproductImage[]>([]);

	useEffect(() => {
		if (selectedSubproduct) {
			setProductImages(selectedSubproduct.images);
		}
	}, [selectedSubproduct]);

	const formSchema = z.object({
		name: z.string().min(1).max(60),
		price: z.coerce.number().min(0.01),
		available: z.boolean(),
	});

	let defaultValues = {
		name: '',
		price: 0,
		available: true,
	};

	let title = 'Add new product option';
	let submitUrl = '/subproducts';
	let method = 'POST';
	let expectedResponse = 200;
	if (mode === 'edit' && selectedSubproduct) {
		defaultValues = {
			name: selectedSubproduct.name,
			price: Number(selectedSubproduct.price),
			available: selectedSubproduct.available,
		};
		submitUrl = `/subproducts/${selectedSubproduct.id}`;
		method = 'PUT';
		title = 'Edit product option';
	}
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues,
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const payload = {
				name: values.name,
				price: values.price,
				product_id: selectedProduct?.id,
				images: productImages,
				available: values.available,
			};

			let response;
			if (mode === 'new') {
				response = await subproductApi.createSubproduct(payload);
			} else if (mode === 'edit' && selectedSubproduct) {
				response = await subproductApi.updateSubproduct(selectedSubproduct.id, payload);
			}

			if (response) {
				if (mode === 'new') {
					setOpenNewSubproductModal(false);
				}
				if (mode === 'edit') {
					const updatedSubproduct = response.data;
					const newSubproducts = subproducts.map((subproduct) =>
						subproduct.id === updatedSubproduct.id ? updatedSubproduct : subproduct
					);
					form.reset({
						...updatedSubproduct,
						price: Number(updatedSubproduct.price),
					});
					setSelectedSubproduct(updatedSubproduct);
					setSubproducts(newSubproducts);
				}
				toast.success(response.headers['x-message']);
				form.reset();
			}
		} catch (error) {
			handleFormError(error, form);
		}
	}
	return (
		<div>
			<h1 className='text-center'>{title}</h1>
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
										<Input placeholder='' {...field} maxLength={60} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='price'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<Input type='number' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='available'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 pl-0'>
									<FormLabel>Available</FormLabel>
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
		</div>
	);
};

export default SubproductForm;
