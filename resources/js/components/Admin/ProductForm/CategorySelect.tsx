import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { styles } from './CategorySelect.styles';
import { ProductCategory } from '@/types';
import { categoryApi } from '@/api/categoryApi';
import { toast } from 'react-toastify';

interface CategorySelectProps {
    selectedCategories: ProductCategory[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<ProductCategory[]>>;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
    selectedCategories,
    setSelectedCategories,
}) => {
    const [categories, setCategories] = useState<ProductCategory[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await categoryApi.fetchCategories();
                setCategories(categoriesData.map((cat: any) => ({
                    ...cat,
                    pivot: { category_id: cat.id }
                })));
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (category: ProductCategory) => {
        const isSelected = selectedCategories.some((c) => c.id === category.id);
        if (isSelected) {
            setSelectedCategories(selectedCategories.filter((c) => c.id !== category.id));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    return (
        <div className={styles.container}>
            <Label className={styles.label}>Categories</Label>
            <div className={styles.categories.list}>
                {categories.map((category) => (
                    <div key={category.id} className={styles.categories.item}>
                        <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.some((c) => c.id === category.id)}
                            onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelect;
