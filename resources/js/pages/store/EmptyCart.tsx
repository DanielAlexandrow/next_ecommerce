import { ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { styles } from './EmptyCart.styles';

export default function EmptyCart() {
    return (
        <div className={styles.container}>
            <div className={styles.content.wrapper}>
                <ShoppingCartIcon className={styles.content.icon} />
                <h2 className={styles.content.title}>Your cart is empty</h2>
                <p className={styles.content.description}>
                    Looks like you haven't added any items to your cart yet.
                </p>
                <Button
                    onClick={() => window.location.href = '/productsearch'}
                    className={styles.content.button}
                >
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
}