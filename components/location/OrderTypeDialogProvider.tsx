"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FirstVisitOrderTypeDialog } from "./FirstVisitOrderTypeDialog";

export function OrderTypeDialogProvider({ children }: { children: React.ReactNode }) {
  const [showDialog, setShowDialog] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show dialog on auth pages, checkout, cart, or admin pages
    const excludedPaths = ['/signin', '/signup', '/checkout', '/cart', '/admin', '/kitchen', '/order-success', '/profile', '/orders'];
    const shouldExclude = excludedPaths.some(path => pathname?.startsWith(path));
    
    if (typeof window !== 'undefined' && !shouldExclude) {
      const orderType = localStorage.getItem('order_type');
      if (!orderType) setShowDialog(true);
    }
  }, [pathname]);

  return (
    <>
      <FirstVisitOrderTypeDialog open={showDialog} onClose={() => setShowDialog(false)} />
      {children}
    </>
  );
} 