import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { StoreLayout } from "@/layouts/store-layout";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { Product, StoreProduct, Subproduct } from "@/types";
import axios from "axios";
import { toast } from "react-toastify";
import cartApi from "@/api/cartApi";
import { styles } from './ProductPage.styles';

export default function ProductPage() {
	const pageProps: any = usePage().props;
	const product = pageProps.product as StoreProduct;
	const [selectedOption, setSelectedOption] = useState(product.subproducts[0]);

	const handleAddToCart = async () => {
		try {
			await cartApi.addItem(selectedOption.id);
			toast.success('Item added to cart!');
		} catch (error) {
			toast.error('Failed to add item to cart');
		}
	};

	return (
		<div className={styles.container} data-testid="product-page">
			<div className={styles.grid}>
				<div className="aspect-square relative h-full w-full" data-testid="product-image-container">
					<img
						alt={product.name}
						className="object-cover"
						src={`/storage/${product.images[0]?.path}`}
						style={{
							position: 'absolute',
							height: '100%',
							width: '100%',
							inset: '0px',
							}}
						data-testid="product-image"
					/>
				</div>
				<div className={styles.content.wrapper} data-testid="product-details">
					<div className={styles.content.header.container}>
						<h1 className={styles.content.header.title} data-testid="product-name">{product.name}</h1>
						<p className={styles.content.header.description} data-testid="product-description">{product.description}</p>
					</div>
					<div className={styles.content.details.container}>
						<div className={styles.content.details.section}>
							<Label className={styles.content.details.label}>Price</Label>
							<p className={styles.content.price.amount} data-testid="product-price">$ {selectedOption.price}</p>
						</div>
						<div className={styles.content.details.section}>
							<Label className={styles.content.details.label}>Size</Label>
							<Select
								defaultValue={selectedOption.id.toString()}
								onValueChange={(value) => {
									const option = product.subproducts.find(sp => sp.id.toString() === value);
									if (option) {
										setSelectedOption(option);
									}
								}}
								data-testid="product-variant-select"
							>
								<SelectTrigger className="w-full" data-testid="product-variant-trigger">
									<SelectValue placeholder="Select size" />
								</SelectTrigger>
								<SelectContent data-testid="product-variant-options">
									{product.subproducts.map((subproduct) => (
										<SelectItem 
											key={subproduct.id} 
											value={subproduct.id.toString()}
											data-testid={`variant-option-${subproduct.id}`}
										>
											{subproduct.name}
									</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button
							size="lg"
							className={styles.content.addToCart.button}
							onClick={handleAddToCart}
							data-testid="add-to-cart-button"
						>
							Add to cart
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

ProductPage.layout = (page: any) => <StoreLayout children={page} />;
