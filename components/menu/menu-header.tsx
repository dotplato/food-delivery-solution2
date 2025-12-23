"use client";

import { Search, Star, Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MenuHeader({ searchQuery, onSearchChange }: MenuHeaderProps) {
  return (
    <div className="mb-10 px-2 sm:px-4 py-8 bg-white border-b border-gray-300">
      {/* Top Section: Title and Rating */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-6 gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Our Menu
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Explore our delicious selection of burgers, sides, drinks, and combo
            meals. Made with premium ingredients for maximum flavor.
          </p>
        </div>

        {/* Rating - Top Right */}
        <div className="flex items-center gap-2 text-gray-700 text-base sm:text-lg flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
          <span className="font-semibold">4.3</span>
        </div>
      </div>

      {/* Search Bar and Social Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar - Left */}
        <div className="w-full md:w-auto md:flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-6 text-base rounded-full border-2 border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors w-full"
            />
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-1 sm:gap-2 md:gap-3">
          {/* GOOGLE REVIEWS */}
          <Button
            asChild
            variant="outline"
            className="rounded-full border-2 border-yellow-400
            text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700  
                w-9 h-10 sm:w-auto sm:h-10 sm:px-4 md:px-6 p-0 sm:p-2 flex items-center justify-center"
          >
            <Link
              href="https://www.google.com/search?sca_esv=38e51a907b0f751b&sxsrf=AE3TifNa1YBfdL3tyWSkR_Xo-3uLovc86g:1764972711146&q=bunhub+burger+reviews&uds=AOm0WdGd210jajrq97gYkPxbMLnyTKWSsQocvkTxxjNiEy8VMdgSx_56bo7K2pbtr4E-t2D0fmKW-mPNmYvWVStcsa0WwoPsCpbHBUXf11tPszlKO312MEcyF1bwc_tTN11hP-gEETFM_9DG4H3xe8Fej6qIWHR56Nrrn9AnZZp7CzcMTFHaFP7QyosDImobZOql-r6Nl6F2lOyuy-RBII_rP8XJkSYC5zVfIg80PXQEdR6Eiw_1pJFUL7QuS0v5RMDGlL7CEOJs_YGSCInfQb7fqHWPyP32OmjikxlV7OHD7ubok7H6j6pZRDy9o2mFRwH7WxG1VwLCu-Gcp4FFPhEjDS4hc-v2ONsNJGaMSiLnpu8orB0_mCT5Xj1Z3d_a6NLjKkNRrcaMBM6nxVUfVyx2RhOwJkw83SAHPXlxq18nP6AHyg181GJc0TmYGdi-01iHAvK5UMEtE3wWgWMDLc9zHJaq3hYSe_SXhANKdWM9kIGAA8FGiUGPqjJpkL3PxUPrXMxhEVaq&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E8VobcOp282enfvA-YH7Ni0BIgwbBaYfoAskBYZlOfr1-HhUE_Cse3cBvtfmGiYEDA9JRjf28isZhM_zSkSOJvgelhyu&sa=X&ved=2ahUKEwjnxvHbu6eRAxVGOPsDHZxrAU8Qk8gLegQIGBAB&ictx=1&stq=1&cs=1&lei=p1gzaafXCMbw7M8PnNeF-AQ#ebo=2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Star className="h-4 w-4 fill-yellow-400" />
              <span className="hidden sm:inline whitespace-nowrap ml-2">
                Google Reviews
              </span>
            </Link>
          </Button>

          {/* FACEBOOK */}
          <Button
            asChild
            variant="outline"
            className="
              rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700
              w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center
            "
          >
            <Link href="https://facebook.com/YOUR_PAGE" target="_blank">
              <Facebook className="h-4 w-4" />
            </Link>
          </Button>

          {/* INSTAGRAM */}
          <Button
            asChild
            variant="outline"
            className="
              rounded-full border-2 border-pink-600 text-pink-600 hover:bg-pink-50 hover:text-pink-700
              w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center
            "
          >
            <Link href="https://instagram.com/YOUR_PAGE" target="_blank">
              <Instagram className="h-4 w-4" />
            </Link>
          </Button>

          {/* TWITTER */}
          <Button
            asChild
            variant="outline"
            className="
              rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-50 hover:text-sky-600
              w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center
            "
          >
            <Link href="https://twitter.com/YOUR_PAGE" target="_blank">
              <Twitter className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
