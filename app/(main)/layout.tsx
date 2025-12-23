"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OrderTypeDialogProvider } from "@/components/location/OrderTypeDialogProvider";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

  const isProfilePage = pathname.startsWith("/profile");
  const isHomePage = pathname === "/";

  useEffect(() => {
    const footer = document.querySelector("footer");
    footerRef.current = footer as HTMLElement;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFooterVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <OrderTypeDialogProvider>
      <Navbar />

      <main className={cn("flex-grow", isHomePage ? "pt-0" : "pt-14 sm:pt-16")}>
        {children}
      </main>

      <Footer />

      {!isProfilePage && (
        <Link href="/profile">
          <Button
            size="lg"
            className={`fixed bottom-4 md:bottom-6 z-50 shadow-2xl hover:scale-105 transition-all duration-300 bg-brand-600 hover:bg-brand-600 text-white px-4 py-4 md:px-6 md:py-6 rounded-full flex items-center gap-2 md:gap-3 ${
              isFooterVisible ? "left-4 md:left-6" : "right-4 md:right-6"
            }`}
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-semibold text-sm md:text-base">
              Order Now
            </span>
          </Button>
        </Link>
      )}
    </OrderTypeDialogProvider>
  );
}
