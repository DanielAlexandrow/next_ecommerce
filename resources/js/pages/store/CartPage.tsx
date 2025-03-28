import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react';
import AddressInfo from '@/components/Store/AdressInfos/AdressInfos';
import { StoreLayout } from '@/layouts/store-layout';
import { styles } from './CartPage.styles';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleFormError } from '@/lib/utils';
import { addressSchema } from '@/lib/adressInfosSchema';
import cartApi from '@/api/cartApi';
import EmptyCart from './EmptyCart';
import { CartItem } from '@/types/cart';

export default function CartPage() {
    const pageProps: any = usePage().props;
    const [cartItems, setCartItems] = useState<CartItem[]>(pageProps.cartitems || []);

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
            const { data: updatedCart } = await cartApi.addItem(item.subproduct_id);
            setCartItems(updatedCart);
        } catch (error) {
            toast.error('Failed to add item to cart.');
        }
    };

    const handleCheckout = async () => {
        if (!pageProps.auth.user) {
            try {
                const addressData = await form.trigger();
                if (!addressData) {
                    toast.error('Please fill in your address information');
                    return;
                }
                const formValues = form.getValues();
                
                // Guest checkout with address
                await cartApi.checkout(cartItems[0].cart_id, formValues);
                toast.success('Checkout successful!');
                setCartItems([]);
            } catch (error) {
                toast.error('An error occurred during checkout.');
                handleFormError(error, form);
            }
        } else {
            try {
                await cartApi.checkout(cartItems[0].cart_id);
                toast.success('Checkout successful!');
                setCartItems([]);
            } catch (error) {
                toast.error('An error occurred during checkout.');
            }
        }
    };

    const getTotalPrice = (cartItems: CartItem[]) => {
        return cartItems.reduce((total, item) => {
            return total + item.subproduct.price * item.quantity;
        }, 0);
    };

    const triggerValidationAndGetValues = async () => {
        const isValid = await form.trigger();
        return isValid ? form.getValues() : null;
    };

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            name: '',
            email: '',
            postcode: '',
            city: '',
            country: '',
            street: '',
        },
    });

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    const totalPrice = getTotalPrice(cartItems);

    return (
        <div className={styles.container}>
            <div className={styles.header.wrapper}>
                <div className={styles.header.flex}>
                    <h2 className={styles.header.title}>Shopping Cart</h2>
                    <div className={styles.header.cartInfo}>
                        <ShoppingCartIcon className="w-5 h-5" />
                        <span>{cartItems.length} items</span>
                    </div>
                </div>
                <div className={styles.itemList}>
                    {cartItems.map(item => (
                        <div key={item.id} className={styles.item.container}>
                            <div className={styles.item.info}>
                                <img
                                    alt={item.subproduct.product.name}
                                    className={styles.item.image}
                                    height={64}
                                    src={item.subproduct.product.images[0]?.full_path || ''}
                                    style={{ aspectRatio: '64/64', objectFit: 'cover' }}
                                    width={64}
                                />
                                <div>
                                    <h3 className={styles.item.details.title}>
                                        {item.subproduct.product.name}
                                    </h3>
                                    <p className={styles.item.details.variant}>
                                        {item.subproduct.name}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.item.controls.wrapper}>
                                <div className={styles.item.controls.quantity}>
                                    <Button
                                        className={styles.item.controls.button}
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDecrementItem(item)}
                                        aria-label="decrease quantity"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </Button>
                                    <span data-testid="item-quantity">{item.quantity}</span>
                                    <Button
                                        className={styles.item.controls.button}
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleIncrementItem(item)}
                                        aria-label="increase quantity"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                <span className={styles.item.controls.price}>
                                    ${(item.subproduct.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {pageProps.auth.user === null && (
                    <>
                        <h2 className={styles.guestCheckout.title}>
                            Order as a guest or login
                        </h2>
                        <AddressInfo onSubmit={handleCheckout} form={form} checkOut={true} />
                    </>
                )}

                <div className={styles.summary.container}>
                    <span className={styles.summary.label}>Total:</span>
                    <span className={styles.summary.total} data-testid="cart-total">
                        ${totalPrice.toFixed(2)}
                    </span>
                </div>

                <div className={styles.actions.container}>
                    <Button 
                        onClick={handleCheckout} 
                        className={styles.actions.checkoutButton}
                    >
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}

CartPage.layout = (page: any) => <StoreLayout children={page} />;