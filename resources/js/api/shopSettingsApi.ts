import axios from 'axios';

export const shopSettingsApi = {
    getSettings: async () => {
        const response = await axios.get('/api/shop-settings');
        return response.data;
    },

    updateSettings: async (data) => {
        const response = await axios.post('/api/shop-settings', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};