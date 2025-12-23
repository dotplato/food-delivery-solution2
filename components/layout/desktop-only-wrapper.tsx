"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

interface DesktopOnlyWrapperProps {
  children: React.ReactNode;
  minWidth?: number;
}

export function DesktopOnlyWrapper({
  children,
  minWidth = 700,
}: DesktopOnlyWrapperProps) {
  const [mounted, setMounted] = useState(false);
  // Start as false - small screens show message immediately
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= minWidth);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, [minWidth]);

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
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
            <p className="text-2xl font-bold text-red-600 mt-1">{minWidth}px</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
