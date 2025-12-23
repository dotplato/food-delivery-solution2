"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertCircle } from "lucide-react";
import {
  isRestaurantOpen,
  getNextOpeningTime,
  getTodayHours,
  formatTime,
  getCurrentTime,
} from "@/lib/restaurant-hours";

export function RestaurantStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [todayHours, setTodayHours] = useState<{
    open: string;
    close: string;
  } | null>(null);
  const [nextOpening, setNextOpening] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateStatus = async () => {
      try {
        const [open, hours, next] = await Promise.all([
          isRestaurantOpen(),
          getTodayHours(),
          getNextOpeningTime(),
        ]);
        setIsOpen(open);
        setTodayHours(hours);
        setNextOpening(next);
        setCurrentTime(getCurrentTime());
      } catch (error) {
        console.error("Error updating restaurant status:", error);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                  isOpen
                    ? "bg-gradient-to-br from-green-400 to-green-600 animate-pulse"
                    : "bg-gradient-to-br from-brand-400 to-brand-600"
                }`}
              >
                {isOpen ? (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Animated ring for open status */}
              {isOpen && (
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {isOpen ? "Open Now" : "Closed"}
                </h3>
                <Badge
                  variant="secondary"
                  className={`${
                    isOpen
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-brand-100 text-brand-700 border-brand-200"
                  }`}
                >
                  {isOpen ? "OPEN" : "CLOSED"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Bunhub Burger</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            {todayHours ? (
              <div className="text-sm text-gray-600">
                <div className="font-medium">Today's Hours</div>
                <div className="text-xs">
                  {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <div className="font-medium">Closed Today</div>
                <div className="text-xs">Opens {nextOpening}</div>
              </div>
            )}
          </div>
        </div>

        {/* Additional info for closed status */}
        {!isOpen && (
          <div className="mt-3 p-3 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-center gap-2 text-brand-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                We're currently closed. Orders will be available when we reopen{" "}
                {nextOpening}.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
