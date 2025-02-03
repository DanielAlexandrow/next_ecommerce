import React from 'react';
import { useForm } from 'react-hook-form';
import { ProductFormProps } from '@/types/components';
import { Product } from '../../../types/index'; // Changed import path to correct relative path
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormValues {
    name: string;
    description?: string;
    price: number;
    category_id: number;
    available: boolean;
}

export default function ProductForm({ mode, product, onSubmit, onCancel }: ProductFormProps) {

export default function ProductForm({ mode, product, onSubmit, onCancel }: ProductFormProps) {
	const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({ // Changed useForm type to ProductFormValues
		defaultValues: mode === 'edit' ? product : undefined as Partial<Product> | undefined
	});

    const nameRegister = register("name", { required: 'Name is required' });
    const descriptionRegister = register("description");
    const priceRegister = register("price", {
        required: 'Price is required',
        min: { value: 0, message: 'Price must be positive' }
    });
    const categoryIdRegister = register("category_id", { required: 'Category is required' });
    const availableRegister = register("available");

	const onFormSubmit = (data: Partial<Product>) => {
		onSubmit?.(data);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
			<div>
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
                    data-testid="product-name-input"
					aria-label="name"
					{...nameRegister} // Use explicitly typed register
				/>
				{errors.name && (
					<p className="text-red-500 text-sm">{errors.name.message}</p>
				)}
			</div>

			<div>
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
                    data-testid="product-description-input"
					aria-label="description"
					{...descriptionRegister} // Use explicitly typed register
				/>
			</div>

			<div>
				<Label htmlFor="price">Price</Label>
				<Input
					id="price"
					type="number"
					aria-label="price"
					{...priceRegister} // Use explicitly typed register
				/>
				{errors.price && (
					<p className="text-red-500 text-sm">{errors.price.message}</p>
				)}
			</div>

			<div>
				<Label htmlFor="category">Category</Label>
				<Input
					id="category"
					type="number"
					aria-label="category"
					{...categoryIdRegister} // Use explicitly typed register
				/>
				{errors.category_id && (
					<p className="text-red-500 text-sm">{errors.category_id.message}</p>
				)}
			</div>

            <div>
				<Label htmlFor="available">Available</Label>
				<Input
					id="available"
					type="checkbox"
                    data-testid="product-available-checkbox"
					aria-label="available"
					{...availableRegister} // Use explicitly typed register
				/>
			</div>

			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button type="button" variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" data-testid="submit-button">Save</Button>
			</div>
		</form>
	);
}
