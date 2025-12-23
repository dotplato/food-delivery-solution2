"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/lib/types";

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

// Define types for options to include price_adjustment
interface Option {
  id: string;
  name: string;
  price_adjustment?: number;
}

interface SafeOptions {
  selectedOption: Option | null;
  selectedAddons: Option[];
  selectedMealOptions: Option[];
  selectedSauce: Option | null;
}

// Normalize options to always have the same shape
function safeOptions(options: any): SafeOptions {
  return {
    selectedOption: options?.selectedOption ?? null,
    selectedAddons: options?.selectedAddons ?? [],
    selectedMealOptions: options?.selectedMealOptions ?? [],
    selectedSauce: options?.selectedSauce ?? null,
  };
}

export function CartItem({ item, updateQuantity, removeItem }: CartItemProps) {
  const options = safeOptions(item.options);

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const increaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="flex border-b py-4 last:border-b-0">
      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-base">{item.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              ${item.price.toFixed(2)}
            </p>

            {options && (
              <div className="mt-2 space-y-1">
                {options.selectedOption && (
                  <p className="text-sm text-muted-foreground">
                    {options.selectedOption.name}
                    {typeof options.selectedOption?.price_adjustment ===
                      "number" &&
                      options.selectedOption.price_adjustment > 0 && (
                        <span className="ml-1">
                          (+$
                          {options.selectedOption.price_adjustment.toFixed(2)})
                        </span>
                      )}
                  </p>
                )}

                {options.selectedAddons.length > 0 &&
                  options.selectedAddons.map((addon: Option) => (
                    <p key={addon.id} className="text-sm text-muted-foreground">
                      {addon.name}
                      {typeof addon.price_adjustment === "number" &&
                        addon.price_adjustment > 0 && (
                          <span className="ml-1">
                            (+${addon.price_adjustment.toFixed(2)})
                          </span>
                        )}
                    </p>
                  ))}

                {options.selectedMealOptions.length > 0 &&
                  options.selectedMealOptions.map((option: Option) => (
                    <p
                      key={option.id}
                      className="text-sm text-muted-foreground"
                    >
                      {option.name}
                      {option.price_adjustment &&
                        option.price_adjustment > 0 && (
                          <span className="ml-1">
                            (+${option.price_adjustment.toFixed(2)})
                          </span>
                        )}
                    </p>
                  ))}

                {options.selectedSauce && (
                  <p className="text-sm text-muted-foreground">
                    {options.selectedSauce.name}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center mt-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={decreaseQuantity}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={increaseQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="ml-auto font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
