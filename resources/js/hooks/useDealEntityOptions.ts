import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export interface EntityOption {
    value: number;
    label: string;
}

interface UseDealEntityOptionsResult {
    productOptions: EntityOption[];
    categoryOptions: EntityOption[];
    brandOptions: EntityOption[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDealEntityOptions = (): UseDealEntityOptionsResult => {
    const [productOptions, setProductOptions] = useState<EntityOption[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<EntityOption[]>([]);
    const [brandOptions, setBrandOptions] = useState<EntityOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [products, categories, brands] = await Promise.all([
                axios.get('/api/products?fields=id,name&available=true'),
                axios.get('/api/categories?fields=id,name'),
                axios.get('/api/brands/getallbrands')
            ]);

            setProductOptions(
                products.data.data.map((p: any) => ({
                    value: p.id,
                    label: p.name
                }))
            );

            setCategoryOptions(
                categories.data.map((c: any) => ({
                    value: c.id,
                    label: c.name
                }))
            );

            setBrandOptions(
                brands.data.map((b: any) => ({
                    value: b.id,
                    label: b.name
                }))
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch options');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        productOptions,
        categoryOptions,
        brandOptions,
        isLoading,
        error,
        refetch: fetchData
    };
};