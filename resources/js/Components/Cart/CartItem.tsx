import React from 'react';
import { CartItem as CartItemType } from '@/types/cart';
import { Button } from '@/components/ui/button';

interface CartItemProps {
    item: CartItemType;
    onIncrement: () => void;
    onDecrement: () => void;
    loading: boolean;
}

export default function CartItem({ item, onIncrement, onDecrement, loading }: CartItemProps) {
    return (
        <div className="flex items-center justify-between p-4 mb-4 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-4">
                <img
                    src={item.subproduct.product.images?.[0]?.full_path || '/placeholder.png'}
                    alt={item.subproduct.product.name}
                    className="w-16 h-16 object-cover rounded"
                />
                <div>
                    <h3 className="font-medium">{item.subproduct.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.subproduct.name}</p>
                    <p className="text-sm font-medium">${item.subproduct.price}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={onDecrement}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                    >
                        -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                        onClick={onIncrement}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                    >
                        +
                    </Button>
                </div>
                <p className="font-medium">
                    ${(item.subproduct.price * item.quantity).toFixed(2)}
                </p>
            </div>
        </div>
    );
}