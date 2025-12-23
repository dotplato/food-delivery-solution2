import { Suspense } from "react";
import { fetchMenuData } from "@/lib/fetch/menu-data";
import { MenuGrid } from "@/components/menu/menu-grid";
import { KitchenHeader } from "@/components/kitchen/kitchen-header";
import { DineInOrderSummary } from "@/components/dinein/dinein-order-summary";
import { RestaurantStatus } from "@/components/menu/restaurant-status";

export default async function DineInCreateOrderPage() {
  const data = await fetchMenuData();
  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Top Banner - Always first */}
          <div className="md:col-span-12 order-1">
            <RestaurantStatus />
          </div>

          {/* Menu Table - Left on desktop (order 2), Bottom on mobile (order 3) */}
          <div className="order-3 md:order-2 md:col-span-8 lg:col-span-9">
            <MenuGrid
              initialCategories={data.categories}
              initialMenuItems={data.menuItems}
              initialAddons={data.addons}
              initialMealOptions={data.mealOptions}
              initialSauces={data.sauces}
              initialCategorySauces={data.categorySauces}
              hideStatus
            />
          </div>

          {/* Order Summary - Right on desktop (order 3), Below Status on mobile (order 2) */}
          <div className="order-2 md:order-3 md:col-span-4 lg:col-span-3">
            <Suspense fallback={<div />}>
              <DineInOrderSummary />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
