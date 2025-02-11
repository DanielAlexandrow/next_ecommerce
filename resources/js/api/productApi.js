import axios from 'axios';
import { FilterValues } from '@/stores/store/productSearchStore';

const API_URL = '/api/products';

export const productApi = {
	createProduct: async (payload: any) => {
		const response = await axios.post(`${API_URL}`, payload);
		return response.data;
	},

	updateProduct: async (id: number, payload: any) => {
		const response = await axios.put(`${API_URL}/${id}`, payload);
		return response.data;
	},

	searchProducts: async (filters: FilterValues) => {
		const response = await axios.get(`${API_URL}/search`, {
			params: {
				name: filters.name,
				minPrice: filters.minPrice,
				maxPrice: filters.maxPrice,
				sortBy: filters.sortBy,
				category: filters.category,
				rating: filters.rating,
				inStock: filters.inStock
			}
		});
		return response.data;
	},

	async deleteProduct(id: number) {
		const response = await axios.delete(`/products/${id}`);
		return response.data;
	},
};