'use client';

import { Coins, Sparkles, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PointsEarnedNotificationProps {
  pointsEarned: number;
  orderTotal: number;
}

export function PointsEarnedNotification({ pointsEarned, orderTotal }: PointsEarnedNotificationProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="text-center">
          {/* Success Icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
              <ArrowUp className="w-8 h-8 text-white" />
            </div>
            {/* Sparkles around the icon */}
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse delay-75" />
            </div>
            <div className="absolute top-1 -left-2">
              <Sparkles className="w-2 h-2 text-blue-300 animate-pulse delay-150" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            Points Earned!
          </h3>
          
          {/* Points Display */}
          <div className="mb-4">
            <div className="text-3xl font-bold text-blue-600">
              +{pointsEarned.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Points Added</div>
          </div>
          
          {/* Order Details */}
          <div className="bg-white/50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600 mb-1">From your order</div>
            <div className="font-semibold text-gray-800">
              ${orderTotal.toFixed(2)} spent
            </div>
            <div className="text-xs text-gray-500">
              10 points per $1 spent
            </div>
          </div>
          
          {/* Value Badge */}
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-sm">
            ${(pointsEarned / 100).toFixed(2)} value earned
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 