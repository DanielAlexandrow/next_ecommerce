import axios from 'axios';
import { Header } from '@/types';

const navigationApi = {
    fetchNavData: async () => {
        const response = await axios.get('/navigation/getnavdata');
        return response.data;
    },

    saveNavigation: async (headers: Header[]) => {
        const response = await axios.post('/navigation', { headers });
        return response.data;
    },

    updateHeader: async (header: Header) => {
        const response = await axios.put(`/navigation/${header.id}`, header);
        return response.data;
    },

    updateHeaderOrder: async (headers: Header[]) => {
        const response = await axios.put('/navigation', { headers });
        return response.data;
    },

    logout: async () => {
        const response = await axios.post('/logout');
        return response.data;
    }
};

export default navigationApi;