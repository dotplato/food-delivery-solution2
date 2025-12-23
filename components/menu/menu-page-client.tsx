'use client';

import { useState } from "react";
import { MenuGrid } from "@/components/menu/menu-grid";
import { CartPreview } from "@/components/menu/cart-preview";
import { MenuHeader } from "@/components/menu/menu-header";

interface MenuPageClientProps {
    data: {
        categories: any[];
        menuItems: any[];
        addons: any[];
        mealOptions: any[];
        sauces: any[];
        categorySauces: any[];
    };
}

export function MenuPageClient({ data }: MenuPageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <MenuHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Menu Content */}
                <div className="lg:col-span-3">
                    <MenuGrid
                        initialCategories={data.categories}
                        initialMenuItems={data.menuItems}
                        initialAddons={data.addons}
                        initialMealOptions={data.mealOptions}
                        initialSauces={data.sauces}
                        initialCategorySauces={data.categorySauces}
                        searchQuery={searchQuery}
                    />
                </div>

                {/* Cart Preview */}
                <div className="lg:col-span-1">
                    <CartPreview />
                </div>
            </div>
        </>
    );
}
