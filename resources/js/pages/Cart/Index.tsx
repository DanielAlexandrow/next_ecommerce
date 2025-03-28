import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../../Layouts/Layout';
import CartItem from '../../Components/Cart/CartItem';
import EmptyCart from '../../Components/Cart/EmptyCart';
import CheckoutButton from '../../Components/Cart/CheckoutButton';
import { CartItemType } from '../../types/cart';

interface Props {
  cartitems: CartItemType[];
  sessionId: string;
}

export default function Index({ cartitems, sessionId }: Props) {
  const [items, setItems] = useState<CartItemType[]>(cartitems);
  const [loading, setLoading] = useState<boolean>(false);
  
  const subtotal = items.reduce((sum, item) => sum + (item.subproduct.price * item.quantity), 0);
  
  useEffect(() => {
    setItems(cartitems);
  }, [cartitems]);

  const updateQuantity = async (subproductId: number, action: 'add' | 'remove') => {
    setLoading(true);
    try {
      const response = await fetch(`/cart/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          subproduct_id: subproductId,
          quantity: 1
        }),
      });
      
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head title="Shopping Cart" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <CartItem 
                  key={item.subproduct_id} 
                  item={item} 
                  onIncrement={() => updateQuantity(item.subproduct_id, 'add')}
                  onDecrement={() => updateQuantity(item.subproduct_id, 'remove')}
                  loading={loading}
                />
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="flex justify-between font-semibold mb-6">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <CheckoutButton cartId={items[0]?.cart_id} disabled={loading} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
