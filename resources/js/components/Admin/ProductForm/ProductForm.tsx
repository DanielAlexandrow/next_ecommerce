import React from 'react';
import { useForm } from 'react-hook-form';
import { ProductFormProps } from '@/types/components';
import { Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export default function ProductForm({ mode, product, onSubmit, onCancel }: ProductFormProps) {
	const { register, handleSubmit, formState: { errors } } = useForm<Partial<Product>>({
		defaultValues: mode === 'edit' ? product : undefined
	});

	const onFormSubmit = (data: Partial<Product>) => {
		onSubmit?.(data);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
			<div>
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					aria-label="name"
					{...register('name', { required: 'Name is required' })}
				/>
				{errors.name && (
					<p className="text-red-500 text-sm">{errors.name.message}</p>
				)}
			</div>

			<div>
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					aria-label="description"
					{...register('description')}
				/>
			</div>

			<div>
				<Label htmlFor="price">Price</Label>
				<Input
					id="price"
					type="number"
					aria-label="price"
					{...register('price', {
						required: 'Price is required',
						min: { value: 0, message: 'Price must be positive' }
					})}
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
					{...register('category_id', { required: 'Category is required' })}
				/>
				{errors.category_id && (
					<p className="text-red-500 text-sm">{errors.category_id.message}</p>
				)}
			</div>

			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit">Save</Button>
			</div>
		</form>
	);
}