import axios from 'axios';

export const driverApi = {
    getDrivers: async () => {
        const response = await axios.get('/api/drivers');
        return response.data;
    },

    getCoordinates: async () => {
        const response = await axios.get('/driver/coordinates/current');
        return response.data;
    },

    updateCoordinates: async (latitude: number, longitude: number) => {
        const response = await axios.post('/driver/coordinates', {
            latitude,
            longitude
        });
        return response.data;
    }
}; 