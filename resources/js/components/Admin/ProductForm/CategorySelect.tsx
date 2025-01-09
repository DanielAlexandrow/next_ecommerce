import { Category } from '@/types';
import { Badge } from '../../ui/badge';
import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { categoryApi } from '@/api/categoryApi';
import { toast } from 'react-toastify';

interface CategorySelectProps {
	selectedCategories: any[];
	setSelectedCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

const CategorySelect = ({ selectedCategories, setSelectedCategories }: CategorySelectProps) => {
	const [allCategories, setAllCategories] = useState<Category[]>([]);
	const [filterText, setFilterText] = useState('');

	useEffect(() => {
		const loadCategories = async () => {
			const categories = await categoryApi.fetchCategories();
			setAllCategories(categories);
		};
		loadCategories();
	}, []);

	const handleSelectCategory = (category: Category) => {
		if (!selectedCategories.find((selectedCat) => selectedCat.id === category.id)) {
			setSelectedCategories([
				...selectedCategories,
				{ id: category.id, name: category.name, pivot: { category_id: category.id } },
			]);
		}
	};

	const handleCreateCategory = async (categoryName: string) => {
		try {
			const newCategory = await categoryApi.createCategory(categoryName);
			setAllCategories([...allCategories, newCategory]);
			setSelectedCategories([
				...selectedCategories,
				{
					id: newCategory.id,
					name: newCategory.name,
					pivot: { category_id: newCategory.id },
				},
			]);
			setFilterText('');
		} catch (error) {
			console.error('Failed to create category:', error);
			toast.error('Failed to create category');
		}
	};

	const filteredCategories = filterText
		? allCategories.filter((category) => category.name.toLowerCase().includes(filterText.toLowerCase()))
		: [];

	return (
		<>
			<div className='text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5 '>
				Selected Categories
			</div>
			<div>
				<ul>
					{selectedCategories?.map((category) => (
						<li className='mt-2' key={category.id}>
							<Badge>
								<div
									data-testid={`selected-category-${category.id}`}
									onClick={() =>
										setSelectedCategories(
											selectedCategories.filter((cat) => cat.id !== category.id)
										)
									}>
									{category.name}
								</div>
							</Badge>
						</li>
					))}
				</ul>
			</div>

			<div className='text-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-5 mt-5'>
				All Categories
			</div>
			<Input
				data-testid="category-select-trigger"
				placeholder='Type in a category'
				type='text'
				onChange={(e) => setFilterText(e.target.value)}
				title='If category not already available, press ENTER to create it and add to the list'
				maxLength={30}
			/>
			<div className='mt-5'>
				<ul>
					{filterText.length > 2 && allCategories.every((category) => category.name !== filterText) ? (
						<li className='mt-2'>
							<Badge>
								<div data-testid="create-category-button" onClick={() => handleCreateCategory(filterText)}>
									"{filterText}" not available. Press to create and add to list
								</div>
							</Badge>
						</li>
					) : null}
					{filteredCategories.map((category) => (
						<li className='mt-2' key={category.id}>
							<Badge>
								<div
									data-testid={`category-option-${category.id}`}
									onClick={() => handleSelectCategory(category)}
								>
									{category.name}
								</div>
							</Badge>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default CategorySelect;
