import React from 'react';
import { useProductSearchStore } from '@/stores/store/productSearchStore';
import { StoreLayout } from '@/layouts/store-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/ui/star-rating';
import { Slider } from '@/components/ui/slider';
import { StoreProduct } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ProductGrid = () => {
    const {
        products,
        filters,
        isLoading,
        isSidebarOpen,
        loadProducts,
        setFilters,
        resetFilters,
        setIsSidebarOpen,
        handleProductClick,
        handleAddToCart,
        getLowestPrice,
        getProductRating
    } = useProductSearchStore();

    React.useEffect(() => {
        loadProducts?.();
    }, [loadProducts, filters]);

    if (isLoading) {
        return <div data-testid="loading-state">Loading products...</div>;
    }

    if (!Array.isArray(products)) {
        return <div>Error: Invalid products data</div>;
    }

    if (products.length === 0) {
        return <div data-testid="no-products">No products found</div>;
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters?.({ ...filters, name: e.target.value });
    };

    const handlePriceRangeChange = (values: number[]) => {
        if (!setFilters) return;
        setFilters({
            ...filters,
            minPrice: values[0],
            maxPrice: values[1] ?? values[0]
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Button onClick={() => setIsSidebarOpen?.(true)}>Filters</Button>
            </div>
            <div className="flex justify-between items-start gap-6">
                <div className={`w-64 shrink-0 ${isSidebarOpen ? '' : 'hidden sm:block'}`}>
                    <div className="space-y-4">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            value={filters?.name ?? ''}
                            onChange={handleSearch}
                        />
                        
                        <div>
                            <h3 className="mb-2 font-medium">Price Range</h3>
                            <Slider
                                min={0}
                                max={1000}
                                value={[filters?.minPrice ?? 0, filters?.maxPrice ?? 1000]}
                                onValueChange={handlePriceRangeChange}
                            />
                            <div className="flex justify-between mt-2">
                                <span>${filters?.minPrice ?? 0}</span>
                                <span>${filters?.maxPrice ?? 1000}</span>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => resetFilters?.()}>Reset Filters</Button>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Card 
                                key={product.id} 
                                onClick={() => handleProductClick?.(product.id)}
                                className="cursor-pointer"
                            >
                                <CardHeader>
                                    {product.images?.[0] && (
                                        <img 
                                            src={product.images[0].full_path}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <CardTitle>{product.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                    <StarRating rating={getProductRating?.(product) ?? 0} />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <span className="font-bold">${getLowestPrice?.(product) ?? 0}</span>
                                    <Button 
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart?.(product, e);
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductsPage() {
    return (
        <ErrorBoundary>
            <ProductGrid />
        </ErrorBoundary>
    );
}

ProductsPage.layout = (page: React.ReactNode) => <StoreLayout children={page} />;
