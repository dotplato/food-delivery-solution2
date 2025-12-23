import { Suspense } from "react";
import Loader from "@/components/ui/loader";
import { fetchMenuData } from "@/lib/fetch/menu-data";
import { MenuPageClient } from "@/components/menu/menu-page-client";

export const metadata = {
  title: "Menu | Bunhub Burger",
  description: "Browse our delicious menu of burgers, sides, and drinks",
};

export const revalidate = 60; // Cache for 1 minute (ISR)

export default async function MenuPage() {
  const data = await fetchMenuData();

  return (
    <div className="pt-16 pb-16">
      <div className="container mx-auto px-4">
        <Suspense fallback={<Loader />}>
          <MenuPageClient data={data} />
        </Suspense>
      </div>
    </div>
  );
}
