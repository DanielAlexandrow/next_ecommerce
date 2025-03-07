import React from 'react';
import { StoreProduct, Subproduct } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon } from 'lucide-react';
import { useCartStore } from '@/stores/CartStore';
import { styles } from './ProductDetails.styles';

interface ProductDetailsProps {
    product: StoreProduct;
    selectedOption: Subproduct | null;
    setSelectedOption: (option: Subproduct) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    product,
    selectedOption,
    setSelectedOption,
}) => {
    const { addToCart } = useCartStore();

    const discountedPrice = selectedOption
        ? selectedOption.price * (1 - (product.discount || 0))
        : 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{product.name}</h1>
                {product.brand && (
                    <span className={styles.brand}>By {product.brand.name}</span>
                )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {selectedOption && (
                <div className={styles.priceContainer}>
                    <span className={styles.price}>
                        ${discountedPrice.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                        <>
                            <span className={styles.originalPrice}>
                                ${selectedOption.price.toFixed(2)}
                            </span>
                            <span className={styles.discount}>
                                {(product.discount * 100).toFixed(0)}% OFF
                            </span>
                        </>
                    )}
                </div>
            )}

            <div className={styles.optionsContainer}>
                <h3 className={styles.optionsTitle}>Available Options</h3>
                <div className={styles.optionsGrid}>
                    {product.subproducts.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOption(option)}
                            className={styles.optionButton(selectedOption?.id === option.id)}
                            disabled={!option.available}
                        >
                            {option.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.addToCartContainer}>
                {product.available ? (
                    <Button
                        className={styles.addToCartButton}
                        onClick={() => selectedOption && addToCart(selectedOption)}
                        disabled={!selectedOption}
                    >
                        <ShoppingCartIcon className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                ) : (
                    <p className={styles.notAvailable}>This product is currently unavailable</p>
                )}
            </div>
        </div>
    );
};