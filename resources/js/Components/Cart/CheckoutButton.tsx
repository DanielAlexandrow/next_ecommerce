import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
    cartId: number;
    disabled: boolean;
}

export default function CheckoutButton({ cartId, disabled }: CheckoutButtonProps) {
    return (
        <Button
            asChild
            className="w-full"
            disabled={disabled}
            variant="default"
        >
            <Link href={`/checkout/${cartId}`}>
                Proceed to Checkout
            </Link>
        </Button>
    );
}