import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { UserData } from '@/api/userApi';
import { toast } from 'react-toastify';
import { handleFormError } from '@/lib/utils';

const userFormSchema = z.object({
    name: z.string().min(2, 'Name is required').max(50),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'driver', 'customer']),
    password: z.string().min(8).optional().or(z.literal('')),
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
    });

    const handleError = (error: any) => {
        setIsSubmitting(false);
        handleFormError(error, form);
    };

    return {
        form,
        isSubmitting,
        setIsSubmitting,
        handleError
    };
};