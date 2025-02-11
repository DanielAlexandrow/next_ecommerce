import { z } from 'zod';


export const addressSchema = z.object({
	name: z.string().nonempty('Name is required').max(55),
	email: z.string().email('Invalid email').nonempty('Email is required'),
	postcode: z.string().nonempty('Postcode is required'),
	city: z.string().nonempty('City is required'),
	country: z.string().nonempty('Country is required'),
	street: z.string().nonempty('Street is required'),
});