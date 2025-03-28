import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function EmptyCart() {
    return (
        <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-6">
                <ShoppingCart className="w-full h-full text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
                <Link href="/productsearch">Continue Shopping</Link>
            </Button>
        </div>
    );
}