import { useState, useCallback } from 'react';
import { CartItem } from '@/types';

interface UseCartReturn {
    isOpen: boolean;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
}

export const useCart = (): UseCartReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const addItem = useCallback((item: CartItem) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(i =>
                i.product_id === item.product_id &&
                i.subproduct_id === item.subproduct_id
            );

            if (existingItem) {
                return currentItems.map(i =>
                    i.id === existingItem.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }

            return [...currentItems, item];
        });
        openCart();
    }, [openCart]);

    const removeItem = useCallback((itemId: number) => {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: number, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeItem]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        isOpen,
        items,
        totalItems,
        totalPrice,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
    };
};

export default useCart; 