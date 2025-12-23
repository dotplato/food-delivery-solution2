'use client';

import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/cart-item';

export function ClientCartItems() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-card border rounded-2xl p-8 flex flex-col items-center justify-center text-center h-80">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>
      
      <Separator className="mb-4" />
      
      <div className="space-y-1">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            removeItem={removeFromCart}
          />
        ))}
      </div>
    </div>
  );
} 