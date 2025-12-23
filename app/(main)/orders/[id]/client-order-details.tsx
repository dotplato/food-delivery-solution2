"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";

export function ClientOrderDetails() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id[0];
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/signin?redirect=/orders");
      return;
    }

    fetchOrder();
  }, [user, id, router]);

  async function fetchOrder() {
    if (!user || !id) return;
    setLoading(true);
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!orderData) {
        router.push("/orders");
        return;
      }

      setOrder(orderData);
      setOrderItems(orderData.metadata || []);

      // ✅ Realtime subscription for live status updates
      const channel = supabase
        .channel(`order-status-${id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `id=eq.${id}`,
          },
          (payload) => {
            const updated = payload.new;
            if (updated) {
              // Update all fields, not just status
              setOrder((prev) => ({ ...prev!, ...updated }));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link href="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Order Details</h1>
                  <p className="text-muted-foreground">
                    Order #{order.id.substring(0, 8)}
                  </p>
                </div>
                <Badge
                  className="mt-2 sm:mt-0 capitalize"
                  variant={
                    order.status === "completed"
                      ? "default"
                      : order.status === "cancelled"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </div>

              {/* ✅ Friendly Status Message */}
              <p className="text-sm text-green-600 mb-4">
                {order.status === "accepted" &&
                  "🟡 Your order was accepted and is awaiting payment confirmation."}
                {order.status === "processing" &&
                  "🟢 Your payment was received! Your order is being prepared."}
                {order.status === "completed" &&
                  "✅ Order completed! Enjoy your meal 🍔"}
                {order.status === "cancelled" && "❌ Your order was cancelled."}
              </p>

              <Separator className="mb-6" />

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 border-b pb-4 last:border-b-0"
                      >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name || "Item"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {item.name || "Unknown Item"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                              {item.options && (
                                <div className="mt-2 space-y-1">
                                  {item.options.selectedOption && (
                                    <p className="text-sm text-muted-foreground">
                                      • {item.options.selectedOption.name}
                                      {item.options.selectedOption
                                        .price_adjustment > 0 && (
                                        <span className="ml-1">
                                          (+$
                                          {item.options.selectedOption.price_adjustment.toFixed(
                                            2
                                          )}
                                          )
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {item.options.selectedAddons &&
                                    item.options.selectedAddons.length > 0 && (
                                      <div className="text-sm text-muted-foreground">
                                        {item.options.selectedAddons.map(
                                          (addon: any, addonIdx: number) => (
                                            <p key={addonIdx}>
                                              • {addon.name}
                                              {addon.price_adjustment > 0 && (
                                                <span className="ml-1">
                                                  (+$
                                                  {addon.price_adjustment.toFixed(
                                                    2
                                                  )}
                                                  )
                                                </span>
                                              )}
                                            </p>
                                          )
                                        )}
                                      </div>
                                    )}
                                  {item.options.selectedMealOptions &&
                                    item.options.selectedMealOptions.length >
                                      0 && (
                                      <div className="text-sm text-muted-foreground">
                                        {item.options.selectedMealOptions.map(
                                          (option: any, optionIdx: number) => (
                                            <p key={optionIdx}>
                                              • {option.name}
                                              {option.price_adjustment > 0 && (
                                                <span className="ml-1">
                                                  (+$
                                                  {option.price_adjustment.toFixed(
                                                    2
                                                  )}
                                                  )
                                                </span>
                                              )}
                                            </p>
                                          )
                                        )}
                                      </div>
                                    )}
                                  {item.options.selectedSauce && (
                                    <p className="text-sm text-muted-foreground">
                                      • 🍯 {item.options.selectedSauce.name}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="font-semibold">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        ${(order.order_total - order.delivery_fee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span>${order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${order.order_total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Order Information</h3>
              <Separator className="mb-4" />

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p>
                    {format(new Date(order.created_at), "MMM dd, yyyy h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {order.payment_status || "pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Address
                  </p>
                  <p>{order.delivery_address || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p>{order.phone || "Not specified"}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <Button className="w-full" asChild>
                <Link href="/menu">Order Again</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
