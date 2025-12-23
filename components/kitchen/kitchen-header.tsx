"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, LogOut, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function KitchenHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userRole, setUserRole] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDineInRoute =
    pathname.toLowerCase().startsWith("/dinein") ||
    pathname.toLowerCase().startsWith("/create-order");

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get user role
  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      setUserRole(data?.role || "customer");
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGoToAdmin = () => {
    router.push("/admin");
  };

  const handleGoToDineInMenu = () => {
    router.push("/create-order");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 py-3 lg:h-26">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2">
              <Image
                src="/logos/logo-brown.png"
                alt="Logo"
                width={80}
                height={73}
                className="object-contain sm:w-[110px] sm:h-[100px]"
                priority
              />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">
                  {isDineInRoute ? "Order Menu" : "Kitchen Dashboard"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Order Management System
                </p>
              </div>
            </div>

            {/* Mobile actions - show on small screens */}
            <div className="flex lg:hidden items-center gap-2">
              {userRole === "admin" && !isDineInRoute && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoToDineInMenu}
                  className="h-8 px-2"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center - Time and status (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="font-medium text-sm lg:text-base">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
              <span className="text-xs lg:text-sm text-gray-600">
                {user?.email || "Kitchen Staff"}
              </span>
              <Badge variant="secondary" className="text-xs">
                {userRole === "admin" ? "Admin" : "Staff"}
              </Badge>
            </div>
          </div>

          {/* Right side - Actions (hidden on mobile, shown on lg+) */}
          <div className="hidden lg:flex items-center gap-3">
            {userRole === "admin" && !isDineInRoute && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToDineInMenu}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Dine-In Menu
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
