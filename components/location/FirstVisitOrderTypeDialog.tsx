"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, ShoppingBag } from "lucide-react";
import { LocationDialog } from "./LocationDialog";

export function FirstVisitOrderTypeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [showLocation, setShowLocation] = useState(false);

  const handleContinue = () => {
    localStorage.setItem("order_type", orderType);
    if (orderType === "delivery") {
      setShowLocation(true);
    } else {
      onClose();
    }
  };

  const handleLocationSelect = (loc: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    // Save location to localStorage (already handled in LocationDialog)
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              CHOOSE YOUR ORDER TYPE
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center my-6">
            <div className="flex bg-gray-100 rounded-full p-1 w-full max-w-xs">
              <button
                className={`flex-1 flex flex-col items-center py-3 rounded-full transition-all ${
                  orderType === "delivery"
                    ? "bg-white shadow font-semibold"
                    : ""
                }`}
                onClick={() => setOrderType("delivery")}
              >
                <Car className="h-5 w-5 mb-1" />
                Delivery
                <span className="text-xs text-gray-500">30 mins</span>
              </button>
              <button
                className={`flex-1 flex flex-col items-center py-3 rounded-full transition-all ${
                  orderType === "pickup" ? "bg-white shadow font-semibold" : ""
                }`}
                onClick={() => setOrderType("pickup")}
              >
                <ShoppingBag className="h-5 w-5 mb-1" />
                Pickup
                <span className="text-xs text-gray-500">15 mins</span>
              </button>
            </div>
          </div>
          <button
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg mt-4 transition"
            onClick={handleContinue}
          >
            Continue
          </button>
        </DialogContent>
      </Dialog>
      <LocationDialog
        open={showLocation}
        onClose={() => {
          setShowLocation(false);
          onClose();
        }}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
