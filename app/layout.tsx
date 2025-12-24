export const dynamic = "force-dynamic";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bunhub Burger",
  description:
    "Order delicious burgers, sides, and drinks for delivery or pickup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
