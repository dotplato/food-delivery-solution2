"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  MenuItem,
  MenuItemOption,
  MenuItemAddon,
  MealOption,
  Category,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

interface MenuItemDialogProps {
  item: MenuItem;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (options: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
    selectedSauce?: any;
  }) => void;
  addons: any[];
  mealOptions: any[];
  sauces: any[];
  categorySauces: any[];
}

export function MenuItemDialog({
  item,
  category,
  open,
  onOpenChange,
  onAddToCart,
  addons,
  mealOptions,
  sauces,
  categorySauces,
}: MenuItemDialogProps) {
  const [selectedOption, setSelectedOption] = useState<MenuItemOption | null>(
    null
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [selectedMealOptions, setSelectedMealOptions] = useState<MealOption[]>(
    []
  );
  const [selectedStyle, setSelectedStyle] = useState<"own" | "meal">("own");
  const [selectedSauce, setSelectedSauce] = useState<any | null>(null);

  // Filter addons for this dialog
  const showAddons = category?.addons_available;
  // Filter meal options for this dialog
  const showMealOptions = category?.meal_options_available;
  // Filter sauces for this category
  const sauceIds = categorySauces
    .filter((cs) => cs.category_id === category?.id)
    .map((cs) => cs.sauce_id);
  const saucesForCategory = sauces.filter((s) => sauceIds.includes(s.id));

  const handleAddonChange = (addon: MenuItemAddon, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addon]);
    } else {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    }
  };

  const handleMealOptionChange = (option: MealOption, checked: boolean) => {
    if (checked) {
      setSelectedMealOptions([...selectedMealOptions, option]);
    } else {
      setSelectedMealOptions(
        selectedMealOptions.filter((o) => o.id !== option.id)
      );
    }
  };

  const calculateTotal = () => {
    let total = item.price;
    selectedAddons.forEach((addon) => {
      total += addon.price_adjustment;
    });
    if (selectedStyle === "meal") {
      selectedMealOptions.forEach((option) => {
        total += option.price_adjustment;
      });
    }
    return total;
  };

  const isAddToCartDisabled = saucesForCategory.length > 0 && !selectedSauce;

  const handleAddToCart = () => {
    if (isAddToCartDisabled) return;
    onAddToCart({
      selectedOption: undefined,
      selectedAddons,
      selectedMealOptions:
        selectedStyle === "meal" && selectedMealOptions.length > 0
          ? selectedMealOptions
          : undefined,
      selectedSauce,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-auto ">
        <DialogHeader>
          <DialogTitle className="text-2xl  font-bold">{item.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div className="relative h-64 rounded-lg sm:sticky bg-white top-0 overflow-hidden">
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
                <p className="text-muted-foreground">No image</p>
              </div>
            )}
          </div>

          <div className="space-y-6 relative flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-auto pr-1">
              <p className="text-muted-foreground">{item.description}</p>
              {/* Sauces (required, radio group) - Moved to top */}
              <div className="flex flex-col gap-5">
                {saucesForCategory.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      Choose a Sauce <span className="text-brand-600">*</span>
                    </h3>
                    <RadioGroup
                      value={selectedSauce?.id || ""}
                      onValueChange={(val) => {
                        const sauce = saucesForCategory.find(
                          (s) => s.id === val
                        );
                        setSelectedSauce(sauce || null);
                      }}
                      className="space-y-2"
                    >
                      {saucesForCategory.map((sauce) => (
                        <div
                          key={sauce.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={sauce.id} id={sauce.id} />
                          <Label htmlFor={sauce.id}>{sauce.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Addons */}
                {showAddons && addons.length > 0 && (
                  <div className="space-y-4 ">
                    <h3 className="font-semibold">Addons</h3>
                    <div className="space-y-2">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={selectedAddons.some(
                              (a) => a.id === addon.id
                            )}
                            onCheckedChange={(checked) =>
                              handleAddonChange(addon, checked as boolean)
                            }
                          />
                          <Label>
                            {addon.name}
                            {addon.price_adjustment > 0 && (
                              <span className="ml-2 text-muted-foreground">
                                +${addon.price_adjustment.toFixed(2)}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Options */}
                {showMealOptions && mealOptions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Choose Style</h3>
                    <RadioGroup
                      value={selectedStyle}
                      onValueChange={(val) =>
                        setSelectedStyle(val as "own" | "meal")
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="own" id="own" />
                        <Label htmlFor="own">On its Own</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="meal" id="meal" />
                        <Label htmlFor="meal">Make it a Meal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                {showMealOptions &&
                  mealOptions.length > 0 &&
                  selectedStyle === "meal" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Meal Options</h3>
                      <div className="space-y-2">
                        {mealOptions.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={selectedMealOptions.some(
                                (o) => o.id === option.id
                              )}
                              onCheckedChange={(checked) =>
                                handleMealOptionChange(
                                  option,
                                  checked as boolean
                                )
                              }
                            />
                            <Label>
                              {option.name}
                              {option.price_adjustment > 0 && (
                                <span className="ml-2 text-muted-foreground">
                                  +${option.price_adjustment.toFixed(2)}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="pt-4 border-t bg-white z-10 sticky bottom-0 top-0 left-0 right-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isAddToCartDisabled}
              >
                {isAddToCartDisabled
                  ? "Select required options"
                  : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
