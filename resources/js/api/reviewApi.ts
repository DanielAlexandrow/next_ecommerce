import axios from 'axios';

const API_URL = '/products';

export const reviewApi = {
    getReviews: async (productId: number, page: number = 1, sortBy: string = 'created_at', sortOrder: string = 'desc') => {
        const response = await axios.get(`${API_URL}/${productId}/reviews`, {
            params: { page, sortBy, sortOrder }
        });
        return response.data;
    },

    createReview: async (productId: number, reviewData: any) => {
        const response = await axios.post(`${API_URL}/${productId}/reviews`, reviewData);
        return response.data;
    },

    updateReview: async (reviewId: number, reviewData: any) => {
        const response = await axios.put(`/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId: number) => {
        const response = await axios.delete(`/reviews/${reviewId}`);
        return response.data;
    },
};