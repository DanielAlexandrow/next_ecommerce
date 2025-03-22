import { useState } from 'react';
import { Category } from '@/types';

export const useCategorySelect = () => {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    
    return {
        categories,
        open,
        setOpen
    };
};