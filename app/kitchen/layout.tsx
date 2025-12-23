"use client";

import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { DesktopOnlyWrapper } from "@/components/layout/desktop-only-wrapper";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DesktopOnlyWrapper>
        {children}
        <Toaster />
      </DesktopOnlyWrapper>
    </AuthProvider>
  );
}
