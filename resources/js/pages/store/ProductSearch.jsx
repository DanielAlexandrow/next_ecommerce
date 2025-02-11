import React, { useEffect } from 'react';
import { StoreLayout } from '@/layouts/store-layout';
import { ProductFilters } from '@/components/Store/ProductFilters/ProductFilters';
import { useProductSearchStore } from '@/stores/store/productSearchStore';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreProduct } from '@/types';
import { productApi } from '@/api/productApi';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

const ProductSearch = () => {
	const {
		products,
		filters,
		isLoading,
		setProducts,
		setIsLoading
	} = useProductSearchStore();

	// Load products when filters change
	useEffect(() => {
		const loadProducts = async () => {
			setIsLoading(true);
			try {
				console.log('Loading products...');
				const data = await productApi.searchProducts(filters);
				console.log('Products loaded:', data.products);
				setProducts(data.products);
			} catch (error) {
				console.error('Failed to load products:', error);
				toast.error('Failed to load products');
			} finally {
				setIsLoading(false);
			}
		};

		loadProducts();
	}, [filters]);

	const getProductImage = (product: StoreProduct) => {
		return product.images[0]?.path || '/images/placeholder.jpg';
	};

	const getLowestPrice = (product: StoreProduct) => {
		return Math.min(...product.subproducts.map(sp => sp.price));
	};

	const handleProductClick = (productId: number) => {
		router.visit(`/product/${productId}`);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row gap-6">
				{/* Filters Sidebar */}
				<div className="w-full md:w-64 shrink-0">
					<div className="sticky top-4 bg-card rounded-lg shadow-sm p-4">
						<h2 className="text-lg font-semibold mb-4">Filters</h2>
						<ProductFilters />
					</div>
				</div>

				{/* Products Grid */}
				<div className="flex-1">
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
							{[...Array(6)].map((_, i) => (
								<div key={i} data-testid="product-skeleton" className="h-[380px] bg-muted rounded-lg"></div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{products.map((product) => (
								<Card
									key={product.id}
									data-testid="product-card"
									className="group hover:shadow-lg transition-shadow cursor-pointer"
									onClick={() => handleProductClick(product.id)}
								>
									<CardContent className="p-0">
										<div className="relative aspect-square">
											<img
												src={getProductImage(product)}
												alt={product.name}
												className="object-cover w-full h-full rounded-t-lg"
											/>
											{product.subproducts.some(sp => sp.available) && (
												<Badge className="absolute top-2 right-2 bg-green-500">
													In Stock
												</Badge>
											)}
										</div>
										<div className="p-4">
											<h3 className="font-semibold text-lg truncate">
												{product.name}
											</h3>

											<div className="flex items-center gap-2 mt-2">
												<span className="text-lg font-bold">
													${getLowestPrice(product)}
												</span>
											</div>
										</div>
									</CardContent>
									<CardFooter className="p-4 pt-0">
										<Button
											className="w-full group-hover:bg-primary/90"
											disabled={!product.subproducts.some(sp => sp.available)}
											onClick={(e) => {
												e.stopPropagation(); // Prevent card click when clicking button
												// Add to cart logic here
											}}
										>
											<ShoppingCart className="w-4 h-4 mr-2" />
											Add to Cart
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}

					{!isLoading && products.length === 0 && (
						<div className="text-center py-12">
							<h3 className="text-lg font-semibold">No products found</h3>
							<p className="text-muted-foreground mt-2">
								Try adjusting your search or filter criteria
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

ProductSearch.layout = (page: React.ReactNode) => <StoreLayout>{page}</StoreLayout>;

export default ProductSearch;