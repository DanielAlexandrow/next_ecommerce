import axios from 'axios';
import { OrderDetails } from '@/types';

export const orderApi = {
	getOrderItems: async (orderId: number, isCustomer: boolean): Promise<OrderDetails> => {
		const url = isCustomer ? `/customers/getorders/${orderId}` : `/orders/getitems/${orderId}`;
		const response = await axios.get(url);
		if (response.status !== 200) {
			throw new Error('Failed to fetch order items');
		}
		return response.data;
	},

	generatePDF: async (orderId: number): Promise<Blob> => {
		const response = await axios.post(`/orders/generatepdf/${orderId}`, {}, { responseType: 'blob' });
		if (response.status !== 200) {
			throw new Error('Failed to generate PDF');
		}
		return response.data;
	}
};