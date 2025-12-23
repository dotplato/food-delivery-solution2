"use client";

import { Coins, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PointsSectionProps {
  userPoints: number;
  redeemPoints: boolean;
  pointsToRedeem: number;
  pointsDiscount: number;
  total: number;
  onRedeemChange: (checked: boolean) => void;
}

export function PointsSection({
  userPoints,
  redeemPoints,
  pointsToRedeem,
  pointsDiscount,
  total,
  onRedeemChange,
}: PointsSectionProps) {
  const dollarValue = userPoints / 100; // 100 points = $1
  const pointsToEarn = Math.floor(
    (total - (redeemPoints ? pointsDiscount : 0)) * 10
  );

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-orange-50/50">
      <CardContent className="p-3">
        {/* Compact header with available points */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">
                {userPoints.toLocaleString()} pts
              </div>
              <div className="text-xs text-gray-500">
                ${dollarValue.toFixed(2)} value
              </div>
            </div>
          </div>

          {/* Compact badges for applied/earned points */}
          <div className="flex gap-1.5">
            {redeemPoints && pointsDiscount > 0 && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-0.5"
              >
                <ArrowDown className="w-3 h-3 mr-1 inline" />
                -${pointsDiscount.toFixed(2)}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
            >
              <ArrowUp className="w-3 h-3 mr-1 inline" />+{pointsToEarn}
            </Badge>
          </div>
        </div>

        {/* Redeem checkbox - only show if user has points */}
        {userPoints > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-yellow-200">
            <Checkbox
              id="redeem-points"
              checked={redeemPoints}
              onCheckedChange={(checked) => onRedeemChange(checked as boolean)}
              className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
            />
            <Label
              htmlFor="redeem-points"
              className="cursor-pointer flex-1 text-sm font-medium text-gray-700"
            >
              Redeem points for discount
            </Label>
            <span className="text-xs text-yellow-700 font-semibold">
              Save ${(userPoints / 100).toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
