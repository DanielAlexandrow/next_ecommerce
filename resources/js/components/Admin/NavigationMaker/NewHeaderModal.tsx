import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Form, FormControl, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { navigationStore } from '@/stores/productlist/navigation/navigationstore';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const NewHeaderModal = () => {
    const [headers, setHeaders, open, setOpen] = navigationStore((state) => [
        state.headers,
        state.setHeaders,
        state.openNewHeaderModal,
        state.setOpenNewHeaderModal,
    ]);

    const formSchema = z.object({
        name: z.string().min(3).max(20),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const maxOrdernum = headers.reduce((max, header) => (header.order_num > max ? header.order_num : max), 0);
        const newHeader = {
            id: 0,
            name: values.name,
            order_num: maxOrdernum + 1,
            navigation_items: [],
        };

        setHeaders([...headers, newHeader]);
        form.reset();
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent>
                <DialogTitle>Add new header</DialogTitle>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} style={{ maxWidth: '200px', margin: 'auto' }}>
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
                        <Button className='mt-5' type='submit'>
                            Save
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default NewHeaderModal;
