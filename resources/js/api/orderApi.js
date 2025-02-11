import axios from 'axios';
import type { Order } from '@/types/orders';

export const orderApi = {
	getUserOrders: async (): Promise<Order[]> => {
		const response = await axios.get<Order[]>('/profile/orders/get');
		return response.data;
	},

	getOrderDetails: async (orderId: number): Promise<Order> => {
		const response = await axios.get<Order>(`/profile/orders/getitems/${orderId}`);
		return response.data;
	},

	getOrderItems: async (orderId: number) => {
		const response = await axios.get(`/profile/orders/getitems/${orderId}`);
		return response.data;
	}
};