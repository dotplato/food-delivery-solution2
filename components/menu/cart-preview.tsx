"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CartPreview() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const [showMobileCart, setShowMobileCart] = useState(false);

  if (items.length === 0) {
    return (
      <>
        {/* Empty cart - desktop */}
        <Card className="sticky top-24 h-fit hidden sm:block">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some delicious items to get started!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Empty cart - mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg flex items-center justify-between px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cart is empty</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop */}
      <Card className="sticky top-24 h-fit hidden sm:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
            <Badge variant="secondary">{items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item) => {
              const options = {
                selectedOption: item.options?.selectedOption ?? null,
                selectedAddons: item.options?.selectedAddons ?? [],
                selectedMealOptions: item.options?.selectedMealOptions ?? [],
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
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {options.selectedOption && (
                        <Badge variant="outline" className="text-xs">
                          {options.selectedOption.name}
                        </Badge>
                      )}

                      {options.selectedAddons.map((addon) => (
                        <Badge key={addon.id} variant="outline" className="text-xs">
                          {addon.name}
                        </Badge>
                      ))}

                      {options.selectedMealOptions.map((meal) => (
                        <Badge key={meal.id} variant="outline" className="text-xs">
                          {meal.name}
                        </Badge>
                      ))}

                      {options.selectedSauce && (
                        <Badge variant="outline" className="text-xs">
                        {options.selectedSauce.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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

            <Link href="/checkout" className="w-full">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="bg-white border-t shadow-lg flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-600" />
            <span className="font-semibold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
            <span className="text-muted-foreground text-sm">|</span>
            <span className="font-bold text-brand-700">${total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Link href="/checkout">
              <Button
                size="sm"
                className="bg-primary text-white px-4 py-4 rounded-xl font-semibold"
              >
                Checkout
              </Button>
            </Link>
          </div>
        </div>

        {showMobileCart && (
          <div className="fixed inset-0 z-50 flex items-end sm:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileCart(false)}
            />
            <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slideup">
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-semibold">Your Cart</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileCart(false)}
                  className="text-gray-500"
                >
                  Close
                </Button>
              </div>
              <div className="p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Add some delicious items to get started!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => {
                        const options = {
                          selectedOption: item.options?.selectedOption ?? null,
                          selectedAddons: item.options?.selectedAddons ?? [],
                          selectedMealOptions: item.options?.selectedMealOptions ?? [],
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
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)}
                              </p>

                              <div className="flex flex-wrap gap-1 mt-1">
                                {options.selectedOption && (
                                  <Badge variant="outline" className="text-xs">
                                    {options.selectedOption.name}
                                  </Badge>
                                )}

                                {options.selectedAddons.map((addon) => (
                                  <Badge key={addon.id} variant="outline" className="text-xs">
                                    {addon.name}
                                  </Badge>
                                ))}

                                {options.selectedMealOptions.map((meal) => (
                                  <Badge key={meal.id} variant="outline" className="text-xs">
                                    {meal.name}
                                  </Badge>
                                ))}

                                {options.selectedSauce && (
                                  <Badge variant="outline" className="text-xs">
                                    🍯 {options.selectedSauce.name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
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
                      <Link href="/checkout" className="w-full">
                        <Button className="w-full" size="lg">
                          Proceed to Checkout
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
