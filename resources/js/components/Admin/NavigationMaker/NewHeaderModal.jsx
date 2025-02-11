import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { BaseModal, DefaultModalFooter } from '@/components/ui/modal/BaseModal';
import { useFormModal } from '@/hooks/useFormModal';

const formSchema = z.object({
    name: z.string().min(3).max(20),
});

type FormValues = z.infer<typeof formSchema>;

const NewHeaderModal = () => {
    const [headers, setHeaders, open, setOpen] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.openNewHeaderModal,
        state.setOpenNewHeaderModal,
    ]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const { handleSubmit } = useFormModal({
        form,
        onSubmit: async (values) => {
            const maxOrdernum = headers.reduce((max, header) => (header.order_num > max ? header.order_num : max), 0);
            const newHeader = {
                id: 0,
                name: values.name,
                order_num: maxOrdernum + 1,
                navigation_items: [],
            };

            setHeaders([...headers, newHeader]);
            setOpen(false);
            return newHeader;
        },
        successMessage: 'Header added successfully'
    });

    return (
        <BaseModal
            open={open}
            onOpenChange={setOpen}
            title="Add new header"
            testId="new-header-modal"
            footer={
                <DefaultModalFooter
                    onCancel={() => setOpen(false)}
                    onConfirm={form.handleSubmit(handleSubmit)}
                    confirmText="Save"
                />
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} style={{ maxWidth: '200px', margin: 'auto' }}>
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage />
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input type='text' {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </BaseModal>
    );
};

export default NewHeaderModal;
