import axios from 'axios';
import { Category } from '@/types';

export const cartApi = {
	removeItem: async (subproductId) => {
		const result = await axios.post("/cart/remove", { subproduct_id: subproductId });
		return result.data;
	},

	addItem: async (subproductId: number) => {
		try {
			const result = await axios.post("/cart/add", {
				subproduct_id: subproductId,
				quantity: 1
			});
			return { data: result.data, result };
		} catch (error) {
			console.error('Error adding item to cart:', error);
			throw error;
		}
	},

	checkout: async (cartId, addressData) => {
		const response = await axios.post(`/checkout/${cartId}`, {
			addressData,
			cart_id: cartId
		});
		return response.data;
	},

	getItems: async () => {
		const result = await axios.get("/getcartitems");
		return result.data;
	}
};

