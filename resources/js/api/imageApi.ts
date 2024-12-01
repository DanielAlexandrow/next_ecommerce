// api/imageApi.ts

import { CustomImage } from '@/types';
import axios from 'axios';

const API_URL = '/images';

export const imageApi = {
	fetchImages: async (params: { search?: string; sortkey?: string; sortdirection?: string }) => {
		const response = await axios.get(API_URL, { params });
		return response.data;
	},

	uploadImage: async (formData: FormData) => {
		const response = await axios.post(API_URL, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	deleteImage: async (id: number) => {
		const response = await axios.delete(`${API_URL}/${id}`);
		return response;
	},
	getImagesPaginated: async (params: { page: number; per_page: number; search: string }) => {
		const response = await axios.get('/getImagesPaginated', { params });
		return response.data;
	},

	getAllImages: async (): Promise<CustomImage[]> => {
		const response = await axios.get(`/getallimages`);
		if (response.data.success) {
			return response.data.images;
		} else {
			throw new Error('Failed to fetch images');
		}
	},
};