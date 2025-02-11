import axios from 'axios';


export const profileApi = {
	updateAddress: async (data: any): Promise<string> => {
		const response = await axios.post("/profile/updateadress", data);
		if (response.status !== 200) {
			throw new Error('Failed to update address');
		}
		return response.headers['x-message'];
	},

	updatePassword: async (data: any): Promise<string> => {
		const response = await axios.post("/profile/password", data);
		if (response.status !== 200) {
			throw new Error('Failed to update password');
		}
		return response.headers['x-message'];
	},

};