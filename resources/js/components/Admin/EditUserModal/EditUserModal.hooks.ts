import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { UserData } from '@/api/userApi';
import { toast } from 'react-toastify';
import { handleFormError } from '@/lib/utils';

const userFormSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    role: z.enum(['admin', 'driver', 'customer']),
    password: z.union([
        z.string().min(8, 'Password must be at least 8 characters'),
        z.string().length(0)
    ]),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const useUserForm = (mode: 'edit' | 'new', user: UserData | null) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || 'customer',
            password: '',
        },
        mode: 'onBlur',
    });

    const handleError = (error: any) => {
        setIsSubmitting(false);
        if (error.response?.data?.errors) {
            Object.entries(error.response.data.errors).forEach(([key, value]) => {
                form.setError(key as keyof UserFormData, {
                    message: Array.isArray(value) ? value[0] : value as string
                });
            });
        } else {
            handleFormError(error, form);
        }
    };

    return {
        form,
        isSubmitting,
        setIsSubmitting,
        handleError
    };
};