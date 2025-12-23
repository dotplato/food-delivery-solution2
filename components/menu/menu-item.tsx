"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  MenuItem as MenuItemType,
  MenuItemOption,
  MenuItemAddon,
  MealOption,
  Category,
} from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { MenuItemDialog } from "./menu-item-dialog";
import { Plus, Star } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRestaurantStatus } from "@/lib/restaurant-hours";

interface MenuItemProps {
  item: MenuItemType;
  category?: Category;
  addons: any[];
  mealOptions: any[];
  sauces: any[];
  categorySauces: any[];
}

export function MenuItem({
  item,
  category,
  addons,
  mealOptions,
  sauces,
  categorySauces,
}: MenuItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isOpen: isRestaurantOpen } = useRestaurantStatus();

  const handleAddToCart = (selectedOptions: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  }) => {
    let totalPrice = item.price;

    if (selectedOptions.selectedOption) {
      totalPrice += selectedOptions.selectedOption.price_adjustment;
    }
    selectedOptions.selectedAddons.forEach((addon) => {
      totalPrice += addon.price_adjustment;
    });
    selectedOptions.selectedMealOptions?.forEach((option) => {
      totalPrice += option.price_adjustment;
    });

    addToCart({ ...item, price: totalPrice }, selectedOptions);
  };

  const handleOpenDialog = () => {
    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin?redirect=/menu";
      }
      return;
    }
    if (!isRestaurantOpen) {
      alert("Sorry, the restaurant is currently closed.");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      {/* FIXED WIDTH CARD */}
      <Card className="w-full max-w-[300px] overflow-hidden hover:shadow-xl transition-shadow duration-200 border-0 shadow-md bg-white flex flex-col">
        {/* IMAGE */}
        <div className="relative h-48 w-full overflow-hidden bg-white">
          <img
            src={
              item.image_url && item.image_url.trim() !== ""
                ? item.image_url
                : "/logos/logo-gray.png"
            }
            alt={item.name}
            className="object-contain w-full h-full transition-transform duration-200 hover:scale-105"
          />

          {item.featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-0">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>

        <CardContent className="px-4 pt-4 pb-5 flex flex-col flex-1">
          {/* Title & Price */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight pr-2">
              {item.name}
            </h3>
            <span className="text-lg font-bold text-brand-700 flex-shrink-0">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Description with fixed height area */}
          <div className="flex-1 min-h-[72px] mb-4">
            {item.description ? (
              <p className="text-sm text-gray-600 line-clamp-3 leading-snug">
                {item.description}
              </p>
            ) : (
              <div className="h-[72px]" />
            )}
          </div>

          {/* Button */}
          <Button
            onClick={handleOpenDialog}
            className={`w-full font-medium py-6 rounded-xl transition-colors duration-200 ${
              !item.available || !isRestaurantOpen
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 hover:bg-brand-700 hover:text-white text-foreground"
            }`}
            disabled={!item.available || !isRestaurantOpen}
          >
            <Plus className="h-4 w-4 mr-2" />
            {!item.available
              ? "Not Available"
              : !isRestaurantOpen
              ? "Restaurant Closed"
              : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>

      <MenuItemDialog
        item={item}
        category={category}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddToCart={handleAddToCart}
        addons={addons}
        mealOptions={mealOptions}
        sauces={sauces}
        categorySauces={categorySauces}
      />
    </>
  );
}
