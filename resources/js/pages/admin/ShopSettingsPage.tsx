import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { AdminLayout } from '@/layouts/app-layout';
import { shopSettingsApi } from '@/api/shopSettingsApi';
import ImageSelect from '@/components/Admin/ProductForm/ImageSelect';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomImage } from '@/types';

const formSchema = z.object({
    currency: z.string().length(3),
    mapbox_api_key: z.string().optional(),
    sendgrid_api_key: z.string().optional(),
    shop_name: z.string().min(1).max(255),
});

const ShopSettingsPage = ({ settings }) => {
    const [shopLogo, setShopLogo] = useState<CustomImage[]>([]);

    useEffect(() => {
        if (settings?.shop_logo) {
            setShopLogo([{ id: 0, name: 'Shop Logo', path: settings.shop_logo, full_path: settings.shop_logo }]);
        }
    }, [settings]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currency: settings?.currency || '',
            mapbox_api_key: settings?.mapbox_api_key || '',
            sendgrid_api_key: settings?.sendgrid_api_key || '',
            shop_name: settings?.shop_name || '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));

            if (shopLogo.length > 0 && shopLogo[0]) {
                formData.append('shop_logo', shopLogo[0].full_path);
            }

            const response = await shopSettingsApi.updateSettings(formData);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
            console.error(error);
        }
    };

    if (!settings) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className='max-w-4xl mx-auto'>
            <h1 className='text-2xl font-bold mb-6'>Shop Settings</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='shop_name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shop Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='currency'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency (3-letter code)</FormLabel>
                                <FormControl>
                                    <Input {...field} maxLength={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='mapbox_api_key'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mapbox API Key</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='sendgrid_api_key'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SendGrid API Key</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div>
                        <FormLabel>Shop Logo</FormLabel>
                        <LogoSelectModal shopLogo={shopLogo} setShopLogo={setShopLogo} />
                        {shopLogo.length > 0 && shopLogo[0].path && (
                            <div className="mt-2">
                                <img src={shopLogo[0].full_path} alt="Shop Logo" className="max-w-xs" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => setShopLogo([])}
                                >
                                    Remove Logo
                                </Button>
                            </div>
                        )}
                    </div>
                    <Button type='submit'>Save Settings</Button>
                </form>
            </Form>
        </div>
    );
};

interface LogoSelectModalProps {
    shopLogo: CustomImage[];
    setShopLogo: React.Dispatch<React.SetStateAction<CustomImage[]>>;
}

const LogoSelectModal: React.FC<LogoSelectModalProps> = ({ shopLogo, setShopLogo }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    {shopLogo.length > 0 ? 'Change Shop Logo' : 'Select Shop Logo'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Select Shop Logo</DialogTitle>
                <ImageSelect productImages={shopLogo} setProductImages={setShopLogo} maxSelected={1} />
            </DialogContent>
        </Dialog>
    );
};

ShopSettingsPage.layout = (page) => <AdminLayout children={page} />;

export default ShopSettingsPage;  