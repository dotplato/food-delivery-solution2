"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function PointsDisplay() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPoints = async () => {
      // Immediately return if no user
      if (!user?.id) {
        setPoints(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("royalty_points")
          .select("current_balance")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setPoints(data.current_balance || 0);
        } else {
          setPoints(0);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
        setPoints(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [user, supabase]);

  // Return null immediately if no user
  if (!user) {
    return null;
  }

  // Don't show anything if loading and no points
  if (loading && points === null) {
    return null;
  }

  return (
    <Link href="/profile" className="hover:opacity-80 transition-opacity">
      {/* Desktop version */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
        <Coins className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-800">
          {loading ? "..." : points?.toLocaleString() || "0"}
        </span>
        <Badge
          variant="secondary"
          className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200"
        >
          pts
        </Badge>
      </div>

      {/* Mobile version - compact */}
      <div className="flex sm:hidden items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
        <Coins className="w-3.5 h-3.5 text-yellow-600" />
        <span className="text-xs font-medium text-yellow-800">
          {loading ? "..." : points?.toLocaleString() || "0"}
        </span>
      </div>
    </Link>
  );
}
