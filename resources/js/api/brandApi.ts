import axios from 'axios';
import { z } from 'zod';

const API_URL = '/brands';

const brandSchema = z.object({
	name: z.string().min(4).max(50),
});

export type BrandData = z.infer<typeof brandSchema>;

export const brandApi = {
	addBrand: async (data: BrandData) => {
		const response = await axios.post(API_URL, data);
		return response.data;
	},

	updateBrand: async (id: number, data: BrandData) => {
		const response = await axios.put(`${API_URL}/${id}`, data);
		return response.data;
	},

	deleteBrand: async (id: number) => {
		const response = await axios.delete(`/brands/${id}`);
		if (response.status !== 204) {
			throw new Error('Failed to delete brand');
		}
		return response;
	},

	getAllBrands: async () => {
		const response = await axios.get(`${API_URL}/getallbrands`);
		return response.data;
	},
};