import axios from 'axios';

export const userOrdersApi = {
    getOrders: async () => {
        const response = await axios.get('/profile/orders');
        return response.data.orders;
    },

    getOrderDetails: async (orderId: number) => {
        const response = await axios.get(`/profile/orders/getitems/${orderId}`);
        return response.data;
    }
}; 