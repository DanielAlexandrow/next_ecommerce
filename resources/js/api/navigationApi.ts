import axios from 'axios';

export const navigationApi = {
	fetchNavData: async (): Promise<any> => {
		const response = await axios.get("/navigation/getnavdata");
		if (response.status !== 200) {
			throw new Error('Failed to fetch navigation data');
		}
		return response.data;
	},

	saveNavigation: async (headers: any): Promise<void> => {
		const response = await axios.put(`/navigation/0`, headers);
		if (response.status !== 200) {
			throw new Error('Failed to update navigation');
		}
	}
};