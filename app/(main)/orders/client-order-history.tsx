'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { OrderHistory } from '@/components/profile/order-history';

export function ClientOrderHistory() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=/orders');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <OrderHistory />;
} 