import React from 'react';
import { AdminLayout } from '@/layouts/app-layout';
import ProductForm from '@/components/Admin/ProductForm/ProductForm';
import { styles } from './NewProduct.styles';

export default function NewProductMenu() {
    return (
        <div className={styles.container}>
            <div className={styles.header.wrapper}>
                <h1 className={styles.header.title}>Create New Product</h1>
                <p className={styles.header.description}>Add a new product to your store</p>
            </div>
            <div className={styles.content.wrapper}>
                <div className={styles.content.form}>
                    <ProductForm mode={'new'} product={null} />
                </div>
            </div>
        </div>
    );
}

NewProductMenu.layout = (page: any) => <AdminLayout children={page} />;
