import axios from 'axios';
import { Category } from '@/types';

export const cartApi = {
	removeItem: async (subproductId) => {
		const result = await axios.post("/cart/remove", { subproduct_id: subproductId });
		return result.data;
	},

	addItem: async (subproductId: number) => {
		const result = await axios.post("/cart/add", { subproduct_id: subproductId });
		return { data: result.data, result };
	},

	checkout: async (cartId, addressData) => {
		const response = await axios.post(`/checkout/${cartId}`, {
			addressData,
			cart_id: cartId
		});
		return response.data;
	}
};

