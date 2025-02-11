import { useState } from 'react';
import { toast } from 'react-toastify';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { handleFormError } from '@/lib/utils';

interface UseFormModalProps<T extends FieldValues, R> {
    onSubmit: (values: T) => Promise<R>;
    onSuccess?: (result: R) => void;
    successMessage?: string;
    form: UseFormReturn<T>;
    resetOnClose?: boolean;
}

export function useFormModal<T extends FieldValues, R>({
    onSubmit,
    onSuccess,
    successMessage = 'Operation completed successfully',
    form,
    resetOnClose = true
}: UseFormModalProps<T, R>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: T) => {
        setIsLoading(true);
        try {
            const result = await onSubmit(values);
            if (onSuccess) {
                onSuccess(result);
            }
            toast.success(successMessage);
            setIsOpen(false);
            if (resetOnClose) {
                form.reset();
            }
        } catch (error) {
            handleFormError(error, form);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open && resetOnClose) {
            form.reset();
        }
    };

    return {
        isOpen,
        isLoading,
        setIsOpen,
        handleSubmit,
        handleOpenChange
    };
} 