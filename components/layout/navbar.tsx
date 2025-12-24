"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 text-white font-semibold"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-7 w-7 text-white" />
            </Button>
          </div>

          <nav className="flex flex-col gap-6 text-center px-6 py-8 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "text-lg transition-colors",
                  isActive(item.href)
                    ? "text-red-500 font-semibold"
                    : "text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-[200] h-14 sm:h-16 bg-white shadow-md">
        <div className="container mx-auto px-3 sm:px-4 h-full flex items-center justify-between relative">
          {/* Left - Hamburger */}
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isOpen ? <X /> : <Menu />}
          </Button>

          {/* Center - Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center h-full md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Image
              src="/logos/header_logo_for_WBG-01.png"
              alt="Logo"
              width={90}
              height={40}
              className="sm:hidden object-contain"
            />
            <Image
              src="/logos/header_logo_for_WBG-01.png"
              alt="Logo"
              width={110}
              height={48}
              className="hidden sm:block object-contain"
            />
          </Link>

          {/* Right - Cart, Auth */}
          <div className="flex items-center gap-2">
            <a href="/menu#/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart />
              </Button>
            </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[300]">
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/menu#/history";
                    }}
                  >
                    Previous Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/menu#/account/payment-methods";
                    }}
                  >
                    Payment Methods
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/menu#/delivery";
                    }}
                  >
                    Delivery Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem >Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
         </div>
        </div>
      </header>
    </>
  );
}
