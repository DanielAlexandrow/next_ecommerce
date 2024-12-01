import axios from 'axios';
import { Subproduct, SubproductImage } from '@/types';

interface SubproductPayload {
	name: string;
	price: number;
	product_id?: number;
	id?: number;
	images: SubproductImage[];
	available: boolean;
}

export const subproductApi = {
	createSubproduct: async (payload: SubproductPayload) => {
		const response = await axios.post('/subproducts', payload);
		if (response.status !== 200) {
			throw new Error('Failed to create subproduct');
		}
		return response;
	},

	updateSubproduct: async (id: number, payload: SubproductPayload) => {
		const response = await axios.put(`/subproducts/${id}`, payload);
		if (response.status !== 200) {
			throw new Error('Failed to update subproduct');
		}
		return response;
	},

	deleteSubproduct: async (id: number) => {
		const response = await axios.delete(`/subproducts/${id}`);
		if (response.status !== 200) {
			throw new Error('Failed to delete subproduct');
		}
		return response;
	},
	getSubproductsByProductId: async (productId: number): Promise<Subproduct[]> => {
		const response = await axios.get(`/subproducts/byproduct/${productId}`);
		if (response.status !== 200) {
			throw new Error('Failed to fetch subproducts');
		}
		return response.data;
	}
};