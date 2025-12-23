"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/context/auth-context";

interface PointsTransaction {
  id: string;
  points_earned: number;
  points_spent: number;
  created_at: string;
}

export function PointsHistory() {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("royalty_points")
          .select("id, points_earned, points_spent, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error fetching points history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {transaction.points_earned > 0 ? (
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        +{transaction.points_earned}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-brand-600" />
                      <Badge
                        variant="secondary"
                        className="bg-brand-100 text-brand-700"
                      >
                        -{transaction.points_spent}
                      </Badge>
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {transaction.points_earned > 0 ? "Earned" : "Redeemed"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(transaction.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
