import axios from 'axios';
import { z } from 'zod';

const API_URL = '/users';

const userSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    role: z.enum(['admin', 'driver', 'customer']),
    password: z.string().min(8).optional(),
});

export type UserData = z.infer<typeof userSchema>;

export const userApi = {
    updateUser: async (id: number, data: Partial<UserData>) => {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        if (response.status !== 204) {
            throw new Error('Failed to delete user');
        }
        return response;
    },
};