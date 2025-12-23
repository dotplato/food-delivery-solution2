"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderTimer } from "@/components/ui/order-timer";

interface TodaysPendingOrdersProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  getStatusClass: (status: string) => string;
  onViewDetails: (order: Order) => void;
}

export function TodaysPendingOrders({
  orders,
  onStatusChange,
  getStatusClass,
  onViewDetails,
}: TodaysPendingOrdersProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    await onStatusChange(orderId, newStatus);
    setUpdatingOrderId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>Pending & Ready Orders</CardTitle>
          <Link href="/admin/orders" passHref>
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">No pending or ready orders.</p>
        ) : (
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
              >
                {/* Customer Info */}
                <div
                  className="cursor-pointer p-2 -m-2 rounded-md hover:bg-background transition-colors"
                  onClick={() => onViewDetails(order)}
                >
                  <p className="font-semibold">{order.full_name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {order.accepted_at && (
                    <OrderTimer acceptedAt={order.accepted_at} orderStatus={order.status} updatedAt={order.updated_at} className="text-orange-600 mt-1" />
                  )}
                </div>

                {/* Order Total + Actions */}
                <div className="flex items-center gap-4">
                  <p className="font-medium w-16 text-right">
                    ${order.order_total.toFixed(2)}
                  </p>

                  {/* If updating */}
                  {updatingOrderId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : order.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => handleStatusChange(order.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={() => handleStatusChange(order.id, "denied")}
                      >
                        Deny
                      </Button>
                    </div>
                  ) : order.status === "ready" ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      onClick={() => handleStatusChange(order.id, "completed")}
                    >
                      Mark Complete
                    </Button>
                  ) : (
                    // Fallback for already-updated orders
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-32 h-8 text-xs capitalize",
                          getStatusClass(order.status)
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
