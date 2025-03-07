import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedLayout from '@/components/Layout/AnimatedLayout';
import AnimatedCart from '@/components/Cart/AnimatedCart';
import useCart from '@/hooks/useCart';
import { styles } from './main-layout.styles';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = 'Welcome' }) => {
    const {
        isOpen,
        items,
        totalItems,
        openCart,
        closeCart,
        updateQuantity,
        removeItem
    } = useCart();

    return (
        <div className={styles.container}>
            <Head title={title} />
            <Navbar onCartClick={openCart} cartItemCount={totalItems} />

            <AnimatedLayout>
                <main className={styles.main}>
                    {children}
                </main>
            </AnimatedLayout>

            <AnimatedCart
                isOpen={isOpen}
                onClose={closeCart}
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
            />

            <Footer />
        </div>
    );
};

export default MainLayout;