import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ImageSelect from './ImageSelect';
import { Checkbox } from '../../ui/checkbox';
import { productsStore } from '@/stores/productlist/productstore';
import { handleFormError } from '@/lib/utils';
import CategorySelect from './CategorySelect';
import BrandSelect from './BrandSelect';
import { productApi } from '@/api/productApi';
import { Product, ProductImage, ProductCategory, Brand, CustomImage } from '@/types';

interface ProductFormProps {
	mode: 'edit' | 'new';
	product: Product | null;
}

const ProductForm = ({ mode, product }: ProductFormProps): React.ReactNode => {
	const [productImages, setProductImages] = useState<CustomImage[]>([]);
	const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
	const [productBrand, setProductBrand] = useState<Brand | null>(null);
	const [products, setProducts] = productsStore((state) => [state.products, state.setProducts]);

	const formSchema = z.object({
		name: z.string().min(4).max(60),
		description: z.string().max(500),
		available: z.boolean(),
	});

	useEffect(() => {
		if (product) {
			const mappedImages: CustomImage[] = (product.images || []).map(img => ({
				id: img.id || 0,
				name: img.name,
				path: img.path,
				full_path: '/storage/' + img.path,
				pivot: img.pivot
			}));
			setProductImages(mappedImages);
			setProductCategories(product.categories || []);
			setProductBrand(product.brand || null);
		}
	}, [product]);

	const defaultValues = {
		name: product?.name || '',
		description: product?.description || '',
		available: product?.available ?? true,
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});


	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {

			let images = productImages.map((image) => {
				return image.pivot;
			});
			let categories = productCategories.map((category) => {
				return category.pivot;
			});

			const payload = {
				name: values.name,
				description: values.description,
				...(mode === 'edit' && { id: product?.id }),
				images: images,
				categories: categories,
				available: values.available,
				brand_id: productBrand?.id,
			};

			let updatedProduct: Product;
			if (mode === 'edit' && product) {
				updatedProduct = await productApi.updateProduct(product.id, payload);
				const newProducts = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
				setProducts(newProducts);
			} else {
				updatedProduct = await productApi.createProduct(payload);
				setProducts([...products, updatedProduct]);
			}

			toast.success(`Product ${mode === 'edit' ? 'updated' : 'created'} successfully`);

			if (mode === 'new') {
				form.reset();
				setProductImages([]);
				setProductCategories([]);
				setProductBrand(null);
			} else {
				form.reset(updatedProduct);
			}
		} catch (error: any) {
			handleFormError(error, form);
		}
	}

	const title = mode === 'edit' ? 'Edit product' : 'Add new product';

	return (
		<>
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
										<Input placeholder='' {...field} maxLength={55} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input placeholder='' {...field} />
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
						<CategorySelect
							selectedCategories={productCategories}
							setSelectedCategories={setProductCategories}
						/>

						<Button type='submit' className='mt-5'>
							Submit
						</Button>
					</div>
					<div className='flex-1 pl-4'>
						<ImageSelect productImages={productImages} setProductImages={setProductImages} />

						<div className="mt-10">
							<div className='text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5'>
								Brand
							</div>
							<BrandSelect
								productBrand={productBrand}
								setProductBrand={setProductBrand}
							/>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
};

export default ProductForm;