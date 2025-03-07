import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { productsStore } from '@/stores/productlist/productstore';
import { handleFormError } from '@/lib/utils';
import { toast } from 'react-toastify';
import { productApi } from '@/api/productApi';
import { Product, Brand, CustomImage, Category } from '@/types';

interface ProductCategory extends Category {
    pivot: {
        category_id: number;
    };
}

export const formSchema = z.object({
    name: z.string().min(4).max(60),
    description: z.string().max(500),
    available: z.boolean(),
});

export type FormSchema = z.infer<typeof formSchema>;

export const useProductForm = (mode: 'edit' | 'new', product: Product | null) => {
    const [productImages, setProductImages] = useState<CustomImage[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [productBrand, setProductBrand] = useState<Brand | null>(null);
    const [products, setProducts] = productsStore((state) => [state.products, state.setProducts]);

    useEffect(() => {
        if (product) {
            const mappedImages: CustomImage[] = (product.images || []).map((img, index) => ({
                id: img.id || 0,
                name: img.name || '',
                path: img.path,
                full_path: '/storage/' + img.path,
                pivot: {
                    image_id: img.id,
                    order_num: img.pivot?.order || index + 1
                }
            }));
            setProductImages(mappedImages);
            
            const mappedCategories: ProductCategory[] = (product.categories || []).map(cat => ({
                ...cat,
                pivot: {
                    category_id: cat.id
                }
            }));
            setProductCategories(mappedCategories);
            setProductBrand(product.brand || null);
        }
    }, [product]);

    const defaultValues = {
        name: product?.name || '',
        description: product?.description || '',
        available: product?.available ?? true,
    };

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (values: FormSchema) => {
        try {
            let images = productImages.map((image) => ({
                ...image.pivot,
                image_id: image.id
            }));
            
            let categories = productCategories.map((category) => ({
                category_id: category.id
            }));

            const payload = {
                name: values.name,
                description: values.description,
                ...(mode === 'edit' && { id: product?.id }),
                images,
                categories,
                available: values.available,
                brand_id: productBrand?.id,
            };

            let updatedProduct: Product;
            if (mode === 'edit' && product) {
                updatedProduct = await productApi.updateProduct(product.id, payload);
                const newProducts = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
                setProducts(newProducts);
            } else {
                updatedProduct = await productApi.createProduct(payload);
                setProducts([...products, updatedProduct]);
            }

            toast.success(mode === 'edit' ? 'Product updated!' : 'Product created!');
            window.location.href = '/products';
        } catch (error) {
            handleFormError(error, form);
        }
    };

    return {
        form,
        onSubmit,
        productImages,
        setProductImages,
        productCategories,
        setProductCategories,
        productBrand,
        setProductBrand
    };
};