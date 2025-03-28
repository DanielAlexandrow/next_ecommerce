import axios from '@/lib/axios';

const cartApi = {
    addItem: async (subproductId: number, quantity: number = 1) => {
        const response = await axios.post('/cart/add', { 
            subproduct_id: subproductId,
            quantity
        });
        return response.data;
    },

    removeItem: async (subproductId: number) => {
        const response = await axios.post('/cart/remove', { 
            subproduct_id: subproductId 
        });
        return response.data;
    },

    getItems: async () => {
        const response = await axios.get('/getcartitems');
        return response.data;
    },

    getCartWithDeals: async () => {
        const response = await axios.get('/cart/withdeals');
        return response.data;
    },

    checkout: async (cartId: number, addressData?: any) => {
        const response = await axios.post(`/checkout/${cartId}`, { addressData });
        return response.data;
    }
};

export default cartApi;

