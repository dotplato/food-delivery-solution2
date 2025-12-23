// /lib/fetch/admin/analytics.ts
import { supabase } from "@/lib/supabase/client";

export type SalesData = {
  product_id: string;
  product_name: string;
  image_url: string | null;
  total_sold: number;
  revenue: number;
  sales_over_time: { date: string; count: number }[];
  most_active_time?: string;
  trend?: "up" | "down" | "flat";
};

function calculateMostActiveTime(sales: { date: string; count: number }[]) {
  const dayOfWeekCounts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const sale of sales) {
    const day = new Date(sale.date).getDay();
    dayOfWeekCounts[day] += sale.count;
  }
  const mostActiveDay = Object.keys(dayOfWeekCounts).reduce((a, b) =>
    dayOfWeekCounts[parseInt(a)] > dayOfWeekCounts[parseInt(b)] ? a : b
  );
  const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  return dayNames[parseInt(mostActiveDay)];
}

function calculateTrend(sales: { date: string; count: number }[]): "up" | "down" | "flat" {
  if (sales.length < 2) return "flat";
  const half = Math.floor(sales.length / 2);
  const firstHalf = sales.slice(0, half).reduce((acc, s) => acc + s.count, 0);
  const secondHalf = sales.slice(half).reduce((acc, s) => acc + s.count, 0);
  if (secondHalf > firstHalf) return "up";
  if (secondHalf < firstHalf) return "down";
  return "flat";
}

/**
 * Fetch and aggregate analytics data from Supabase.
 * Returns array of SalesData sorted by total_sold descending.
 */
export async function getAnalyticsData(): Promise<SalesData[]> {
  // Fetch only the fields we need
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      status,
      order_total,
      metadata
    `);

  if (error) {
    console.error("Error fetching orders for analytics:", error);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  const aggregated: { [key: string]: SalesData } = {};

  for (const order of orders) {
    if (!order.metadata || !Array.isArray(order.metadata)) continue;

    for (const item of order.metadata) {
      const key = item.menu_item_id;
      if (!key) continue;

      if (!aggregated[key]) {
        aggregated[key] = {
          product_id: item.menu_item_id,
          product_name: item.name,
          image_url: null,
          total_sold: 0,
          revenue: 0,
          sales_over_time: [],
        };
      }

      aggregated[key].total_sold += item.quantity;
      aggregated[key].revenue += item.quantity * item.price;

      const date = new Date(order.created_at).toISOString().split("T")[0];
      const timeEntry = aggregated[key].sales_over_time.find((t) => t.date === date);
      if (timeEntry) {
        timeEntry.count += item.quantity;
      } else {
        aggregated[key].sales_over_time.push({ date, count: item.quantity });
      }
    }
  }

  // Post-process: calculate most_active_time and trend, sort sales_over_time
  const result = Object.values(aggregated).map((d) => {
    // sort sales_over_time by date ascending
    d.sales_over_time.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      ...d,
      most_active_time: d.sales_over_time.length ? calculateMostActiveTime(d.sales_over_time) : undefined,
      trend: d.sales_over_time.length ? calculateTrend(d.sales_over_time) : "flat",
    };
  });

  // sort by total_sold desc
  result.sort((a, b) => b.total_sold - a.total_sold);

  return result;
}
