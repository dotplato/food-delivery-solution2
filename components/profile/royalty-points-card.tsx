'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Coins, Sparkles } from 'lucide-react';

interface RoyaltyPointsCardProps {
  points: number | null;
  isLoading?: boolean;
}

export function RoyaltyPointsCard({ points, isLoading = false }: RoyaltyPointsCardProps) {
  const displayPoints = points !== null ? points : 0;
  const dollarValue = displayPoints / 100; // 100 points = $1

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center">
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">Loyalty Points</h2>
          
          {/* Coin Icon with Sparkles */}
          <div className="relative mb-4">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <Coins className="w-8 h-8 text-white" />
              </div>
              {/* Sparkles around the coin */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Sparkles className="w-3 h-3 text-orange-400 animate-pulse delay-75" />
              </div>
              <div className="absolute top-1 -left-2">
                <Sparkles className="w-2 h-2 text-yellow-300 animate-pulse delay-150" />
              </div>
            </div>
          </div>
          
          {/* Points Balance */}
          <div className="mb-2">
            {isLoading ? (
              <div className="text-3xl font-bold text-green-600 animate-pulse">
                Loading...
              </div>
            ) : (
              <div className="text-4xl font-bold text-green-600">
                {displayPoints.toLocaleString()}
              </div>
            )}
          </div>
          
          {/* Balance Label */}
          <div className="text-sm text-gray-600 mb-3">Balance</div>
          
          {/* Conversion Rate */}
          <div className="text-xs text-gray-500">
            (100 loyalty points = $1)
          </div>
          
          {/* Dollar Value */}
          <div className="mt-3 text-lg font-semibold text-gray-700">
            ${dollarValue.toFixed(2)} value
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 