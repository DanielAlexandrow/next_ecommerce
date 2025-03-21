import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Category, ProductCategory } from '@/types';
import { categoryApi } from '@/api/categoryApi';
import { toast } from 'react-toastify';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { styles } from './CategorySelect.styles';

interface CategorySelectProps {
    selectedCategories: ProductCategory[];
    setSelectedCategories: (categories: ProductCategory[]) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ selectedCategories, setSelectedCategories }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await categoryApi.fetchCategories();
                setCategories(data || []);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to load categories. Please try again.');
                toast.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = (category: Category) => {
        const isSelected = selectedCategories.some(sc => sc.id === category.id);
        if (isSelected) {
            setSelectedCategories(selectedCategories.filter(sc => sc.id !== category.id));
        } else {
            const productCategory: ProductCategory = {
                ...category,
                pivot: {
                    category_id: category.id
                }
            };
            setSelectedCategories([...selectedCategories, productCategory]);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="text-sm font-medium mb-2">Select Categories</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-sm text-gray-500 py-2">
                No categories available. Please create a category first.
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className="text-sm font-medium mb-2">Select Categories</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.some(sc => sc.id === category.id)}
                            onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                            {category.name}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelect;
