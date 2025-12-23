"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  X,
  BarChart,
  Home,
  ClipboardList,
  ChefHat,
  Clock,
  Monitor,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { NewOrderNotifier } from "./NewOrderNotifier";
import { ReadyOrderNotifier } from "./ReadyOrderNotifier";
import RestaurantHoursDialog from "@/components/admin/restaurant-hours-dialog";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
  { name: "Products", href: "/admin/menu-items", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: ShoppingCart },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);

  return (
    <AuthProvider>
      {/* Desktop Required Message - Only visible on screens < 700px */}
      <div className="min-[700px]:hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Monitor className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Desktop Only
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This dashboard is optimized for desktop screens. Please access it
            from a device with a larger display.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-800">
              Minimum required:
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">700px</p>
          </div>
        </div>
      </div>

      {/* Admin Dashboard - Only visible on screens >= 700px */}
      <div className="max-[699px]:hidden flex gap-0 min-h-screen relative">
        <div className="lg:w-64 flex-shrink-0">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="flex-1 flex flex-col">
          <AdminHeader setIsHoursDialogOpen={setIsHoursDialogOpen} />
          <div className="flex-1 p-8">
            <NewOrderNotifier />
            <ReadyOrderNotifier />
            {children}
          </div>
        </main>
        <RestaurantHoursDialog
          open={isHoursDialogOpen}
          setOpen={setIsHoursDialogOpen}
        />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

function AdminHeader({
  setIsHoursDialogOpen,
}: {
  setIsHoursDialogOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoToKitchen = () => {
    router.push("/kitchen");
  };

  const handleGoToDineInMenu = () => {
    router.push("/create-order");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-end h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToDineInMenu}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              Dine-In Menu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToKitchen}
              className="flex items-center gap-2"
            >
              <ChefHat className="h-4 w-4" />
              Kitchen Panel
            </Button>

            {/* Change Hours button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHoursDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Change Hours
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <div className="h-screen sticky top-0 border-r bg-background  ">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/admin" className="text-xl font-bold">
              BHB ADMIN
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-6 text-sm font-medium rounded-xl",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="  lg:inset-y-0 lg:flex lg:w-full lg:h-full lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col ">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="text-xl font-bold text-red-500">
              BHB ADMIN
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-4 text-sm font-medium rounded-xl",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
