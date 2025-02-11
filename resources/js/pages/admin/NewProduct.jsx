import React from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';

export default function NewProductMenu() {
    return <ProductForm mode={'new'} product={null} />;
}

NewProductMenu.layout = (page: any) => <AdminLayout children={page} />;
