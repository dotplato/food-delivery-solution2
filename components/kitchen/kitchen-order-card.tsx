"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";
import {
  Clock,
  User,
  Phone,
  MapPin,
  ChefHat,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { OrderTimer } from "@/components/ui/order-timer";

interface KitchenOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onCancel: (orderId: string) => void;
  isHistory?: boolean;
  serialNumber?: number;
}

export function KitchenOrderCard({
  order,
  onStatusUpdate,
  onCancel,
  isHistory = false,
  serialNumber,
}: KitchenOrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [expandedAddons, setExpandedAddons] = useState<Set<number>>(new Set());

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      await onCancel(order.id);
    }
  };

  const getStatusInfo = () => {
    switch (order.status) {
      case "punched":
        return {
          borderColor: "border-l-yellow-500",
          badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Punched",
          nextAction: "Start Preparing",
          nextStatus: "cooking",
        };
      case "accepted":
        return {
          borderColor: "border-l-yellow-500",
          badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Accepted",
          nextAction: "Start Preparing",
          nextStatus: "cooking",
        };
      case "processing":
        return {
          borderColor: "border-l-blue-500",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Processing",
          nextAction: "Start Preparing",
          nextStatus: "cooking",
        };
      case "cooking":
        return {
          borderColor: "border-l-orange-500",
          badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <ChefHat className="h-4 w-4" />,
          text: "Cooking",
          nextAction: "Mark Ready",
          nextStatus: "ready",
        };
      case "ready":
        return {
          borderColor: "border-l-green-500",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Ready",
          nextAction: null,
          nextStatus: null,
        };
      case "completed":
        return {
          borderColor: "border-l-purple-500",
          badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Completed",
          nextAction: null,
          nextStatus: null,
        };
      default:
        return {
          borderColor: "border-l-gray-500",
          badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="h-4 w-4" />,
          text: order.status,
          nextAction: null,
          nextStatus: null,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const orderItems = order.metadata || [];

  return (
    <Card
      className={`w-full ${statusInfo.borderColor} border-l-[8px] flex flex-col h-full`}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {serialNumber !== undefined && (
                <div className="bg-orange-500 text-white px-3 py-1 rounded font-bold text-lg">
                  {String(serialNumber).padStart(3, "0")}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <Badge className={`${statusInfo.badgeColor} pointer-events-none`}>
                {statusInfo.icon}
                {statusInfo.text}
              </Badge>
            </div>
          </div>

          <div className="mt-2">
            <h3 className="font-semibold text-lg">
              Order #{order.id.slice(-6)}
            </h3>
            {order.accepted_at && (
              <OrderTimer
                acceptedAt={order.accepted_at}
                orderStatus={order.status}
                updatedAt={order.completed_at ?? null}
                className="text-orange-600 mt-1"
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col flex-1 min-h-0">
        {/* Customer Info - Only Name */}
        <div className="flex items-center gap-2 text-sm flex-shrink-0">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{order.full_name || "Guest"}</span>
        </div>

        {/* Order Items - Scrollable section */}
        <div className="space-y-2 flex-1 min-h-[120px] flex flex-col">
          <h4 className="font-medium text-sm text-gray-700 flex-shrink-0">
            Items:
          </h4>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {(showAllItems ? orderItems : orderItems.slice(0, 3)).map(
              (item: any, index: number) => {
                const addonsText =
                  item.options?.selectedAddons
                    ?.map((addon: any) => addon.name)
                    .join(", ") || "";
                const isAddonsExpanded = expandedAddons.has(index);
                const hasLongAddons = addonsText.length > 100; // Threshold for showing Read More

                return (
                  <div
                    key={index}
                    className="space-y-1 text-sm border-b border-gray-200 pb-2 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium flex-1 leading-tight">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-500 text-xs">
                          x{item.quantity}
                        </span>
                        <span className="text-gray-900 font-semibold min-w-[60px] text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {/* Display sauce if available */}
                    {item.options?.selectedSauce && (
                      <div className="text-xs text-gray-500 pl-2">
                        🍯 {item.options.selectedSauce.name}
                      </div>
                    )}
                    {/* Display addons if available */}
                    {item.options?.selectedAddons &&
                      item.options.selectedAddons.length > 0 && (
                        <div className="text-xs text-gray-500 pl-2">
                          <div
                            className={
                              !isAddonsExpanded && hasLongAddons
                                ? "line-clamp-2"
                                : ""
                            }
                          >
                            ➕ {addonsText}
                          </div>
                          {hasLongAddons && (
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedAddons);
                                if (isAddonsExpanded) {
                                  newExpanded.delete(index);
                                } else {
                                  newExpanded.add(index);
                                }
                                setExpandedAddons(newExpanded);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium mt-1"
                            >
                              {isAddonsExpanded ? "Show Less" : "Read More"}
                            </button>
                          )}
                        </div>
                      )}
                    {/* Display meal options if available */}
                    {item.options?.selectedMealOptions &&
                      item.options.selectedMealOptions.length > 0 && (
                        <div className="text-xs text-gray-500 pl-2">
                          🍽️{" "}
                          {item.options.selectedMealOptions
                            .map((option: any) => option.name)
                            .join(", ")}
                        </div>
                      )}
                  </div>
                );
              }
            )}
          </div>

          {/* Read More/Less Toggle */}
          {orderItems.length > 3 && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 flex-shrink-0 text-left"
            >
              {showAllItems
                ? `Show Less`
                : `Show ${orderItems.length - 3} More Item${
                    orderItems.length - 3 > 1 ? "s" : ""
                  }`}
            </button>
          )}
        </div>

        {/* Bottom section - always at the bottom */}
        <div className="mt-auto space-y-4 flex-shrink-0">
          {/* Order Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                ${order.order_total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button - Reserve space even when hidden for alignment */}
          <div className="h-10">
            {!isHistory && statusInfo.nextAction && (
              <Button
                onClick={() => handleStatusUpdate(statusInfo.nextStatus!)}
                disabled={isUpdating}
                className={`w-full h-full ${
                  order.status === "accepted" || order.status === "processing"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : order.status === "cooking"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {isUpdating ? "Updating..." : statusInfo.nextAction}
              </Button>
            )}
          </div>

          {/* Order Time */}
          <div className="text-xs text-gray-500 text-center">
            {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
