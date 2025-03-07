import React from 'react';
import { ProductDetails } from './ProductDetails';
import { ProductImage } from './ProductImage';
import { Reviews } from '../Reviews/Reviews';
import { StoreProduct, CustomImage } from '@/types';
import { useProductStore } from '@/stores/ProductStore';
import { styles } from './ProductPage.styles';

interface ProductPageProps {
    initialProduct: StoreProduct;
}

export const ProductPageComponent: React.FC<ProductPageProps> = React.memo(({ initialProduct }) => {
    const { product, selectedOption, reviews, setProduct, setSelectedOption, loadReviews } = useProductStore();

    // Initialize product on first render if not already set
    if (!product) {
        setProduct(initialProduct);
    }

    if (!product) return null;

    const mainImage: CustomImage | undefined = product.images?.[0] ? {
        id: product.images[0].id ?? 0,
        name: product.images[0].name,
        path: product.images[0].path,
        full_path: '/storage/' + product.images[0].path
    } : undefined;

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                <ProductImage image={mainImage} />
                <ProductDetails 
                    product={product}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                />
            </div>
            <Reviews productId={product.id} reviews={reviews} rating={product.average_rating || 0} onReviewAdded={loadReviews} />
        </div>
    );
});