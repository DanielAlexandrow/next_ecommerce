import React from 'react';
import { CustomImage } from '@/types';
import { styles } from './ProductImage.styles';

interface ProductImageProps {
    image?: CustomImage;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image }) => {
    if (!image) {
        return (
            <div className={styles.container}>
                <div className={styles.noImage}>
                    <span className={styles.noImageText}>No image available</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <img 
                src={image.full_path} 
                alt={image.name} 
                className={styles.image}
            />
        </div>
    );
};