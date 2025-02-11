import axios from 'axios';
import { Category } from '@/types';

interface CreateCategoryData {
	name: string;
	description?: string;
	parent_id?: number | null;
}

interface UpdateCategoryData {
	name?: string;
	description?: string;
	parent_id?: number | null;
}

export const categoryApi = {
	fetchCategories: async (): Promise<Category[]> => {
		const response = await axios.get('/categories');
		return response.data.categories;
	},

	createCategory: async (data: CreateCategoryData): Promise<Category> => {
		const response = await axios.post('/categories', data);
		if (response.status !== 201) {
			throw new Error('Failed to create category');
		}
		return response.data.category;
	},

	updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
		const response = await axios.put(`/categories/${id}`, data);
		if (response.status !== 200) {
			throw new Error('Failed to update category');
		}
		return response.data.category;
	},

	deleteCategory: async (categoryId: number): Promise<void> => {
		const response = await axios.delete(`/categories/${categoryId}`);
		if (response.status !== 200) {
			throw new Error('Failed to delete category');
		}
	},

	searchCategories: async (query: string): Promise<Category[]> => {
		const response = await axios.get('/categories/search', {
			params: { query }
		});
		return response.data.categories;
	},

	bulkDeleteCategories: async (categoryIds: number[]): Promise<void> => {
		const response = await axios.post('/categories/bulk-delete', {
			ids: categoryIds
		});
		if (response.status !== 200) {
			throw new Error('Failed to delete categories');
		}
	},

	getHierarchy: async (): Promise<Category[]> => {
		const response = await axios.get('/categories/hierarchy');
		return response.data.categories;
	}
};