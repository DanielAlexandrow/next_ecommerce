import { useState, useEffect } from 'react';
import { CustomImage } from '@/types';

export const useImageSelect = () => {
    const [images, setImages] = useState<CustomImage[]>([]);
    
    useEffect(() => {
        // TODO: Load images from API
        setImages([]);
    }, []);
    
    return {
        images
    };
};