import { useState } from 'react';
import { Brand } from '@/types';
import { useBrandStore } from '@/stores/useBrandStore';

export const useBrandSelect = () => {
    const [open, setOpen] = useState(false);
    const { brands } = useBrandStore();
    
    return {
        brands,
        open,
        setOpen
    };
};