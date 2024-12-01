import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { StoreLayout } from "@/layouts/store-layout";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { Product, StoreProduct } from "@/types";
import axios from "axios";
import { toast } from "react-toastify";
import { cartApi } from "@/api/cartApi";

export default function ProductPage() {
	const pageProps: any = usePage().props;
	const [product, setProduct] = useState<StoreProduct>(pageProps.product);
	const [selectedOption, setSelectedOption] = useState(pageProps.product.subproducts[0]);

	console.log(product);

	const handleAddToCart = async () => {
		try {
			const response = await cartApi.addItem(selectedOption.id);
			toast.success(response.result.headers['x-message']);
		} catch (error) {
			toast.error('Failed to add item to cart');
			console.error('Add to cart error:', error);
		}
	}

	return (
		<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
			<div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
				<div className="space-y-4">
					<div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
						<img
							alt="Product Image"
							className="object-cover w-full h-full transition-all hover:scale-105"
							src={'/storage/' + product.images[0]?.path}
						/>
					</div>
				</div>
				<div className="space-y-8">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tighter">{product.name}</h1>
						<p className="text-gray-500 dark:text-gray-400">{product.description}</p>
					</div>
					<div className="space-y-6">
						<div className="space-y-2">
							<Label className="text-lg font-semibold">Price</Label>
							<p className="text-3xl font-bold">$ {selectedOption.price}</p>
						</div>
						<div className="space-y-2">
							<Label className="text-lg font-semibold">Size</Label>
							<Select
								defaultValue={selectedOption.id.toString()}
								onValueChange={(value) => setSelectedOption(product.subproducts.find(sp => sp.id.toString() === value))}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select size" />
								</SelectTrigger>
								<SelectContent>
									{product.subproducts.map((subproduct) => (
										<SelectItem key={subproduct.id} value={subproduct.id.toString()}>
											{subproduct.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button
							size="lg"
							className="w-full bg-primary hover:bg-primary/90 text-white"
							onClick={handleAddToCart}
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
