"use client";

import { useState, useEffect, useRef } from "react";
import { MenuItem } from "./menu-item";
import type { MenuItem as MenuItemType, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RestaurantStatus } from "./restaurant-status";

type MenuGridProps = {
  initialCategories: Category[];
  initialMenuItems: MenuItemType[];
  initialAddons: any[];
  initialMealOptions: any[];
  initialSauces: any[];
  initialCategorySauces: any[];
  searchQuery?: string;
  hideStatus?: boolean;
};

export function MenuGrid({
  initialCategories,
  initialMenuItems,
  initialAddons,
  initialMealOptions,
  initialSauces,
  initialCategorySauces,
  searchQuery = "",
  hideStatus = false,
}: MenuGridProps) {
  // ✅ States initialized from pre-fetched data
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>(initialMenuItems);
  const [addons, setAddons] = useState<any[]>(initialAddons);
  const [mealOptions, setMealOptions] = useState<any[]>(initialMealOptions);
  const [sauces, setSauces] = useState<any[]>(initialSauces);
  const [categorySauces, setCategorySauces] = useState<any[]>(
    initialCategorySauces
  );
  const [loading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Intersection observer for highlighting active category
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute("data-category-id");
            if (categoryId) {
              setActiveCategory(categoryId);

              // Auto-scroll active category button into view
              const activeButton = scrollContainerRef.current?.querySelector(
                `[data-category-btn="${categoryId}"]`
              );
              if (activeButton && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const buttonRect = activeButton.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollLeft =
                  container.scrollLeft +
                  (buttonRect.left - containerRect.left) -
                  containerRect.width / 2 +
                  buttonRect.width / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
              }
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading, categories, menuItems, searchQuery]);

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    let items = menuItems.filter((item) => item.category_id === categoryId);

    // Apply search filter if searchQuery exists
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

    return items;
  };

  const getAllFilteredItems = () => {
    if (!searchQuery || searchQuery.trim() === "") {
      return menuItems;
    }

    const query = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
  };

  const filteredItemsCount = getAllFilteredItems().length;

  if (loading) return <MenuSkeleton />;

  return (
    <div className="space-y-8">
      {/* Restaurant Status */}
      {!hideStatus && (
        <div className="mb-6">
          <RestaurantStatus />
        </div>
      )}

      {/* CATEGORY BAR FIXED */}
      <div className="sticky top-20 z-10 bg-white/95 pt-10 backdrop-blur-sm border-b pb-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-2 py-1 select-none"
          onMouseDown={(e) => {
            const container = e.currentTarget as HTMLDivElement & {
              isDown?: boolean;
              startX?: number;
              scrollLeftStart?: number;
            };
            container.isDown = true;
            container.startX = e.pageX - container.offsetLeft;
            container.scrollLeftStart = container.scrollLeft;
          }}
          onMouseLeave={(e) => {
            const container = e.currentTarget as HTMLDivElement & {
              isDown?: boolean;
            };
            container.isDown = false;
          }}
          onMouseUp={(e) => {
            const container = e.currentTarget as HTMLDivElement & {
              isDown?: boolean;
            };
            container.isDown = false;
          }}
          onMouseMove={(e) => {
            const container = e.currentTarget as HTMLDivElement & {
              isDown?: boolean;
              startX?: number;
              scrollLeftStart?: number;
            };
            if (!container.isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - (container.startX ?? 0)) * 1;
            container.scrollLeft = (container.scrollLeftStart ?? 0) - walk;
          }}
        >
          {/* All Items */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveCategory(null);
            }}
            className={cn(
              "flex-shrink-0 rounded-full px-6 py-6",
              activeCategory === null
                ? "bg-brand-700 text-white border-brand-700 hover:bg-brand-800"
                : "border-gray-300 text-gray-900 hover:bg-gray-50"
            )}
          >
            All Items
          </Button>

          {/* Categories */}
          {categories.map((category) => {
            // count items but don't hide if 0
            const itemCount = getItemsByCategory(category.id).length;

            return (
              <Button
                key={category.id}
                data-category-btn={category.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-6 py-6 whitespace-nowrap transition-all",
                  activeCategory === category.id
                    ? "bg-brand-700 text-white border-brand-700 hover:bg-brand-800"
                    : "border-gray-300 text-gray-900 hover:bg-gray-50"
                )}
              >
                {category.name}
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 text-xs",
                    activeCategory === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {itemCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* MENU GRID */}
      <div className="space-y-12">
        {filteredItemsCount === 0 &&
        searchQuery &&
        searchQuery.trim() !== "" ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-2">
              No results found for "{searchQuery}"
            </p>
            <p className="text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const categoryItems = getItemsByCategory(category.id);
            // Show category even if no items
            // if (categoryItems.length === 0) return null;

            return (
              <div
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
                data-category-id={category.id}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryItems.map((item) => {
                    const matchedCategory = categories.find(
                      (cat) => cat.id === item.category_id
                    );
                    return (
                      <div key={item.id} className="flex">
                        <MenuItem
                          item={item}
                          category={matchedCategory}
                          addons={addons}
                          mealOptions={mealOptions}
                          sauces={sauces}
                          categorySauces={categorySauces}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
