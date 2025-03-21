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
import { cartApi } from '@/api/cartApi';
import { styles } from './ProductSearch.styles';

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

	// Improved navigation handler that ensures the navigation actually happens
	const handleProductClick = (productId: number) => {
		const url = `/product/${productId}`;
		console.log(`Navigating to ${url}`);
		// Use router.get instead of visit to ensure proper navigation
		router.get(url);
	};

	const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
		// Stop event propagation to prevent card click
		e.stopPropagation();
		e.preventDefault();
		
		try {
			const response = await cartApi.addItem(productId);
			toast.success(response.result.headers['x-message']);
		} catch (error) {
			toast.error('Failed to add item to cart');
			console.error('Add to cart error:', error);
		}
	}

	return (
		<div className="container mx-auto px-4 py-8" data-testid="product-search-page">
			<div className="flex flex-col md:flex-row gap-6">
				{/* Filters Sidebar */}
				<div className="w-full md:w-64 shrink-0" data-testid="filters-sidebar">
					<div className="sticky top-4 bg-card rounded-lg shadow-sm p-4">
						<h2 className="text-lg font-semibold mb-4" data-testid="filters-heading">Filters</h2>
						<ProductFilters />
					</div>
				</div>

				{/* Products Grid */}
				<div className="flex-1" data-testid="products-grid-container">
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" data-testid="loading-skeletons-container">
							{[...Array(6)].map((_, i) => (
								<div key={i} data-testid="product-skeleton" className="h-[380px] bg-muted rounded-lg"></div>
							))}
						</div>
					) : products ? (
						products.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="products-grid">
								{products.map((product) => (
									<Card
										key={product.id}
										data-testid={`product-card-${product.id}`}
										data-product-id={product.id}
										className={styles.card}
										onClick={() => handleProductClick(product.id)}
									>
										<CardContent className={styles.content.container}>
											<div className={styles.content.imageContainer} data-testid="product-image-container">
												<img
													src={getProductImage(product)}
													alt={product.name}
													className={styles.content.image}
													data-testid="product-image"
												/>
												{product.subproducts.some(sp => sp.available) && (
													<Badge className={styles.content.badge} data-testid="in-stock-badge">
														In Stock
													</Badge>
												)}
											</div>
											<div className={styles.content.details.container} data-testid="product-details">
												<h3 className={styles.content.details.title} data-testid="product-name">
													{product.name}
												</h3>
												<div className={styles.content.details.priceContainer} data-testid="product-price-container">
													<span className={styles.content.details.price} data-testid="product-price">
														${getLowestPrice(product)}
													</span>
												</div>
											</div>
										</CardContent>
										<CardFooter className="p-4 pt-0">
											<Button
												className="w-full group-hover:bg-primary/90 text-black"
												disabled={!product.subproducts.some(sp => sp.available)}
												onClick={(e) => handleAddToCart(e, product.id)}
												data-testid="add-to-cart-button"
											>
												<ShoppingCart className="w-4 h-4 mr-2" />
												Add to Cart
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-12" data-testid="no-products-message">
								<h3 className="text-lg font-semibold">No products found</h3>
								<p className="text-muted-foreground mt-2">
									Try adjusting your search or filter criteria
								</p>
							</div>
						)
					) : (
						<div className="text-center py-12" data-testid="loading-error">
							<h3 className="text-lg font-semibold">Error loading products</h3>
							<p className="text-muted-foreground mt-2">
								Please try refreshing the page
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