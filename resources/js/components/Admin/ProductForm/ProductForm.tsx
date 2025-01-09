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
import type { Product, ProductImage, ProductCategory, Brand, CustomImage } from '@/types';

// Define strict types for form values
interface FormValues {
	name: string;
	description: string;
	available: boolean;
}

// Define strict types for component props
interface ProductFormProps {
	mode: 'edit' | 'new';
	product: Product | null;
}

// Define strict types for API payload
interface ProductPayload {
	name: string;
	description: string;
	available: boolean;
	images: NonNullable<ProductImage['pivot']>[];
	categories: NonNullable<ProductCategory['pivot']>[];
	brand_id: number | undefined;
}

const formSchema = z.object({
	name: z.string()
		.min(4, 'String must contain at least 4 character(s)')
		.max(60, 'Name cannot exceed 60 characters'),
	description: z.string()
		.max(500, 'Description cannot exceed 500 characters'),
	available: z.boolean()
		.default(true)
});

const ProductForm: React.FC<ProductFormProps> = ({ mode, product }) => {
	// State management with strict types
	const [productImages, setProductImages] = useState<CustomImage[]>([]);
	const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
	const [productBrand, setProductBrand] = useState<Brand | null>(null);
	const [products, setProducts] = productsStore((state) => [state.products, state.setProducts]);

	// Initialize form with strict types
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: product?.name ?? '',
			description: product?.description ?? '',
			available: product?.available ?? true,
		}
	});

	// Effect to handle product data initialization
	useEffect(() => {
		if (!product) return;

		const mappedImages: CustomImage[] = (product.images ?? [])
			.filter((img): img is NonNullable<typeof img> => img != null)
			.map(img => ({
				id: img.id ?? 0,
				name: img.name,
				path: img.path,
				full_path: `/storage/${img.path}`,
				pivot: img.pivot
			}));

		setProductImages(mappedImages);
		setProductCategories(product.categories?.filter((cat): cat is NonNullable<typeof cat> => cat != null) ?? []);
		setProductBrand(product.brand ?? null);
	}, [product]);

	// Form submission handler with strict types
	const onSubmit = async (values: FormValues): Promise<void> => {
		try {
			const payload: ProductPayload = {
				name: values.name.trim(),
				description: values.description.trim(),
				available: values.available,
				images: productImages
					.map(image => image.pivot)
					.filter((pivot): pivot is NonNullable<typeof pivot> => pivot != null),
				categories: productCategories
					.map(category => category.pivot)
					.filter((pivot): pivot is NonNullable<typeof pivot> => pivot != null),
				brand_id: productBrand?.id
			};

			let updatedProduct: Product;
			if (mode === 'edit' && product?.id) {
				updatedProduct = await productApi.updateProduct(product.id, payload);
				setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
			} else {
				updatedProduct = await productApi.createProduct(payload);
				setProducts([...products, updatedProduct]);
			}

			toast.success(`Product ${mode === 'edit' ? 'updated' : 'created'} successfully`);

			if (mode === 'new') {
				form.reset({
					name: '',
					description: '',
					available: true
				});
				setProductImages([]);
				setProductCategories([]);
				setProductBrand(null);
			} else {
				form.reset({
					name: updatedProduct.name,
					description: updatedProduct.description,
					available: updatedProduct.available
				});
			}
		} catch (error) {
			handleFormError(error, form);
			form.setError('root', {
				type: 'manual',
				message: 'Failed to submit form'
			});
			throw error;
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			<h1 className="text-center text-2xl font-bold mb-6">
				{mode === 'edit' ? 'Edit product' : 'Add new product'}
			</h1>

			{form.formState.errors.root && (
				<div
					data-testid="form-error"
					className="text-red-500 text-center mb-4 p-2 border border-red-300 rounded"
				>
					{form.formState.errors.root.message}
				</div>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col md:flex-row gap-6"
					noValidate
				>
					<div className="flex-1 space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											{...field}
											data-testid="product-name-input"
											placeholder="Enter product name"
											maxLength={55}
											aria-invalid={!!form.formState.errors.name}
										/>
									</FormControl>
									<FormMessage data-testid="name-error" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input
											{...field}
											data-testid="product-description-input"
											placeholder="Enter product description"
											aria-invalid={!!form.formState.errors.description}
										/>
									</FormControl>
									<FormMessage data-testid="description-error" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="available"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 pl-0">
									<FormLabel>Available</FormLabel>
									<FormControl>
										<Checkbox
											data-testid="product-available-checkbox"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormMessage data-testid="available-error" />
								</FormItem>
							)}
						/>

						<div data-testid="category-select-section">
							<CategorySelect
								selectedCategories={productCategories}
								setSelectedCategories={setProductCategories}
							/>
						</div>

						<Button
							type="submit"
							data-testid="submit-button"
							className="w-full mt-4"
							disabled={form.formState.isSubmitting}
							aria-disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</div>

					<div className="flex-1 space-y-6">
						<div data-testid="image-select-section">
							<ImageSelect
								productImages={productImages}
								setProductImages={setProductImages}
							/>
						</div>

						<div data-testid="brand-select-section">
							<div className="text-center text-sm font-medium mb-4">
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
		</div>
	);
};	

export default ProductForm;