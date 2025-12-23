'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  pointsDiscount?: number;
}

export function CartSummary({ showCheckoutButton = true, pointsDiscount = 0 }: CartSummaryProps) {
  const { items, total: cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [deliveryFee, setDeliveryFee] = useState(3.99);
  const [total, setTotal] = useState(0);

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    setTotal(subtotal + deliveryFee - pointsDiscount);
  }, [subtotal, deliveryFee, pointsDiscount]);

  const handleCheckout = () => {
    if (!user) {
      router.push('/signin?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-green-700 font-semibold">
            <span>Points Discount</span>
            <span>- ${pointsDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <Separator className="my-3" />
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      {showCheckoutButton && (
        <Button 
          className="w-full mt-6 bg-red-700 hover:bg-red-600 text-white"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
        </Button>
      )}
      
      {items.length === 0 && showCheckoutButton && (
        <p className="text-sm text-muted-foreground text-center mt-3">
          Your cart is empty. Add items to proceed.
        </p>
      )}
    </div>
  );
}