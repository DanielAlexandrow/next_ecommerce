import axios from '@/lib/axios';
import { Deal } from '@/types';

const dealsApi = {
    getDeals: async (params?: any) => {
        const response = await axios.get('/api/deals', { params });
        return response.data;
    },

    getActiveDeal: async () => {
        const response = await axios.get('/api/deals/active');
        return response.data;
    },

    createDeal: async (dealData: Partial<Deal>) => {
        const response = await axios.post('/api/deals', dealData);
        return response.data;
    },

    updateDeal: async (id: number, dealData: Partial<Deal>) => {
        const response = await axios.put(`/api/deals/${id}`, dealData);
        return response.data;
    },

    deleteDeal: async (id: number) => {
        const response = await axios.delete(`/api/deals/${id}`);
        return response.data;
    }
};

export default dealsApi;