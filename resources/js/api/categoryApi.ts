import axios from 'axios';
import { Category } from '@/types';

export const categoryApi = {
	fetchCategories: async (): Promise<Category[]> => {
		const response = await axios.get('/categories');
		return response.data.categories;
	},

	createCategory: async (categoryName: string): Promise<Category> => {
		const response = await axios.post('/categories', { name: categoryName });
		if (response.status !== 201) {
			throw new Error('Failed to create category');
		}
		return response.data.category;
	}
};