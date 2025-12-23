"use client";

import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function DineInOrderSummary() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<"Dine In" | "Pick up">("Dine In");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createOrder() {
    if (!user) {
      toast.error("Sign in as admin to punch orders.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add items before punching an order.");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderMetadata = items.map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url,
        options: {
          selectedOption: item.options?.selectedOption ?? null,
          selectedAddons: item.options?.selectedAddons ?? [],
          selectedMealOptions: item.options?.selectedMealOptions ?? [],
          selectedSauce: item.options?.selectedSauce ?? null,
        },
      }));

      const { error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: total,
          delivery_fee: 0,
          order_total: total,
          delivery_address: null,
          phone: fullName || phone ? phone || "-" : "-",
          full_name: fullName || "-",
          payment_status: "Dine In",
          status: "punched",
          accepted_at: new Date().toISOString(),
          order_type: orderType,
          metadata: orderMetadata,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Order punched and sent to kitchen.");
      clearCart();
    } catch (err) {
      toast.error("Failed to punch order.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card className="sticky top-24 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Summary</span>
            <Badge variant="secondary">{items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={orderType}
            onValueChange={(v) => setOrderType(v as "Dine In" | "Pick up")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Dine In">Dine In</TabsTrigger>
              <TabsTrigger value="Pick up">Pick Up</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Input
              placeholder="Customer Name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              placeholder="Phone Number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => {
                  const options = {
                    selectedOption: item.options?.selectedOption ?? null,
                    selectedAddons: item.options?.selectedAddons ?? [],
                    selectedMealOptions:
                      item.options?.selectedMealOptions ?? [],
                    selectedSauce: item.options?.selectedSauce ?? null,
                  };
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <span className="text-sm font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {options.selectedOption && (
                            <Badge variant="outline" className="text-xs">
                              {options.selectedOption.name}
                            </Badge>
                          )}
                          {options.selectedAddons.map((addon) => (
                            <Badge
                              key={addon.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {addon.name}
                            </Badge>
                          ))}
                          {options.selectedMealOptions.map((meal) => (
                            <Badge
                              key={meal.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {meal.name}
                            </Badge>
                          ))}
                          {options.selectedSauce && (
                            <Badge variant="outline" className="text-xs">
                              {options.selectedSauce.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            x
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#f37039] hover:bg-[#be3f16] text-white"
                    onClick={createOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Order"}
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    Clear
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            Orders punched here skip checkout and go to kitchen.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
