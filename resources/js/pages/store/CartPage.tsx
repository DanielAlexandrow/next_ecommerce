// CartPage.jsx
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react';
import AddressInfo from '@/components/Store/AdressInfos/AdressInfos';
import { StoreLayout } from '@/layouts/store-layout';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleFormError } from '@/lib/utils';
import { addressSchema } from '@/lib/adressInfosSchema';
import { cartApi } from '@/api/cartApi';

export default function CartPage() {
	const pageProps: any = usePage().props;
	const [cartItems, setCartItems] = useState<CartItem[]>(pageProps.cartitems);

	const handleDecrementItem = async (item: CartItem) => {
		try {
			const updatedCart = await cartApi.removeItem(item.subproduct_id);
			setCartItems(updatedCart);
		} catch (error) {
			toast.error('Failed to remove item from cart.');
		}
	};

	const handleIncrementItem = async (item: CartItem) => {
		try {
			const updatedCart = await cartApi.addItem(item.subproduct_id);
			setCartItems(updatedCart.data);
		} catch (error) {
			toast.error('Failed to add item to cart.');
		}
	};

	const handleCheckout = async () => {
		let addressData = await triggerValidationAndGetValues();
		if (!addressData && pageProps.auth.user === null) {
			toast.error('Missing customer adress information please visit ' + window.location.href + '/profile/adressinfo');
			return;
		}

		try {
			await cartApi.checkout(cartItems[0].cart_id, addressData);
			toast.success('Checkout successful!');
			setCartItems([]);
		} catch (error) {
			toast.error('An error occurred during checkout.');
			handleFormError(error, form);
		}
	}

	const getTotalPrice = (cartItems: CartItem[]) => {
		return cartItems.reduce((total, item) => total + item.subproduct.price * item.quantity, 0);
	};

	const triggerValidationAndGetValues = async () => {
		const isValid = await form.trigger();
		return isValid ? form.getValues() : null;
	};

	const defaultValues = {
		name: '',
		email: '',
		postcode: '',
		city: '',
		country: '',
		street: '',
	};

	const form = useForm({
		resolver: zodResolver(addressSchema),
		defaultValues,
	});

	if (cartItems.length === 0) {
		return (
			<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
				<div className="max-w-md mx-auto text-center space-y-6">
					<ShoppingCartIcon className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" />
					<h2 className="text-3xl font-bold tracking-tighter">Your cart is empty</h2>
					<p className="text-gray-500 dark:text-gray-400">Looks like you haven't added any items to your cart yet.</p>
					<Button
						onClick={() => window.location.href = '/productsearch'}
						className="bg-primary hover:bg-primary/90 text-white"
					>
						Continue Shopping
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="rounded-xl border bg-card text-card-foreground shadow">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Shopping Cart</h2>
						<div className="flex items-center gap-2">
							<ShoppingCartIcon className="w-5 h-5" />
							<span>{cartItems.length} items</span>
						</div>
					</div>
					<div className="space-y-4">
						{cartItems.map(item => (
							<div key={item.id} className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<img
										alt="Product Image"
										className="rounded-md"
										height={64}
										src={`storage/${item.subproduct.product.images[0]?.path}`}
										style={{ aspectRatio: '64/64', objectFit: 'cover' }}
										width={64}
									/>
									<div>
										<h3 className="font-medium">{item.subproduct.product.name}</h3>
										<p className="text-gray-400 text-sm">{item.subproduct.name}</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Button
											className="text-gray-400 hover:text-gray-50"
											size="icon"
											variant="ghost"
											onClick={() => handleDecrementItem(item)}
											aria-label="Decrement quantity"
										>
											<MinusIcon className="w-4 h-4" />
										</Button>
										<span>{item.quantity}</span>
										<Button
											className="text-gray-400 hover:text-gray-50"
											size="icon"
											variant="ghost"
											onClick={() => handleIncrementItem(item)}
											aria-label="Increment quantity"
										>
											<PlusIcon className="w-4 h-4" />
										</Button>
									</div>
									<span className="font-medium">{item.subproduct.price}</span>
								</div>
							</div>
						))}
						{pageProps.auth.user === null && (
							<>
								<h2 className="text-2xl font-bold">Order as a guest or login</h2>
								<AddressInfo onSubmit={handleCheckout} form={form} checkOut={true} />
							</>
						)}
					</div>

					<div className="border-t border-gray-800 pt-4 mt-4 flex items-center justify-between">
						<span className="text-gray-400">Total</span>
						<span className="font-bold text-2xl">$ {getTotalPrice(cartItems)}</span>
					</div>

					<div className="mt-4 flex justify-end">
						<Button onClick={handleCheckout} className="bg-white text-black">
							Checkout
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

CartPage.layout = (page: any) => <StoreLayout children={page} />;