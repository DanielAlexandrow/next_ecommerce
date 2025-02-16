import React from 'react';
import { StoreProduct } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductSearchStore } from '@/stores/store/productSearchStore';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
    product: StoreProduct;
    isLoading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isLoading = false
}) => {
    const {
        handleAddToCart,
        getLowestPrice,
        getProductRating,
        handleProductClick
    } = useProductSearchStore();

    const rating = getProductRating(product);

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card data-testid="product-skeleton" className="h-full">
                    <CardContent className="p-0">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                data-testid="product-card"
                className="group h-full overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                onClick={() => handleProductClick(product.id)}
            >
                <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                        <img
                            src={product.images?.[0]?.path ? `/storage/${product.images[0].path}` : '/storage/images/placeholder.jpg'}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.subproducts.some(sp => sp.available) && (
                            <Badge className="absolute top-2 right-2 bg-green-500">
                                In Stock
                            </Badge>
                        )}
                    </div>
                    <div className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                            {rating > 0 && (
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        <div className="mt-3 text-lg font-bold">
                            ${getLowestPrice(product).toFixed(2)}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        disabled={!product.subproducts.some(sp => sp.available) || isLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, e);
                        }}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}; 