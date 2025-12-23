"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Clock } from "lucide-react";

import Loader from "@/components/ui/loader";
import { Order } from "@/lib/types";
import { startOfDay, subDays } from "date-fns";
import { TodaysPendingOrders } from "./TodaysPendingOrders";
import { OrderDetailsModal } from "./orders/OrderDetailsModal";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  sales: { label: "Sales", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

type ChartData = {
  date: string;
  revenue: number;
  sales: number;
};

type TopProduct = {
  id: string;
  name: string;
  image_url: string | null;
  total_sold: number;
};

// ✅ FIXED TYPE HERE
type OrderSummary = {
  created_at: string;
  order_total: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
  });
  const [todaysPendingOrders, setTodaysPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ✅ FIXED TYPE HERE
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);

  const [filteredChartData, setFilteredChartData] = useState<ChartData[]>([]);
  const [activeFilter, setActiveFilter] = useState<"today" | "week" | "month">(
    "week"
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);

    // Fetch stats
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("order_total")
      .eq("payment_status", "paid");

    const { count: salesCount, error: salesError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    const { count: productsCount, error: productsError } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true });

    if (!revenueError && !salesError && !productsError) {
      const totalRevenue =
        revenueData?.reduce((sum, order) => sum + order.order_total, 0) || 0;
      setStats({
        totalRevenue: totalRevenue,
        totalSales: salesCount || 0,
        totalProducts: productsCount || 0,
      });
    }

    // Fetch pending orders (including ready orders)
    const today = startOfDay(new Date()).toISOString();
    const { data: pendingOrders, error: pendingOrdersError } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "ready"])
      .order("created_at", { ascending: false });

    if (pendingOrdersError) {
      console.error("Error fetching today's pending orders:", pendingOrdersError);
    } else {
      setTodaysPendingOrders(pendingOrders || []);
    }

    // Fetch all orders for chart
    const { data: allOrdersData, error: allOrdersError } = await supabase
      .from("orders")
      .select("created_at, order_total");

    if (allOrdersError) {
      console.error("Error fetching all orders:", allOrdersError);
    } else if (allOrdersData) {
      setAllOrders(allOrdersData);
    }

      // Fetch top grossing products for today
      const { data: todaysOrders, error: todaysOrdersError } = await supabase
        .from('orders')
        .select('id, metadata')
        .eq('status', 'completed')
        .gte('created_at', today);

    if (todaysOrdersError) {
      console.error("Error fetching today's orders for top products:", todaysOrdersError);
    } else if (todaysOrders && todaysOrders.length > 0) {
      const productSales = todaysOrders.reduce<Record<string, TopProduct>>((acc, order) => {
        if (!order.metadata || !Array.isArray(order.metadata)) return acc;

          for (const item of order.metadata) {
            const key = item.menu_item_id;
            if (!acc[key]) {
              acc[key] = {
                id: item.menu_item_id,
                name: item.name,
                image_url: null,
                total_sold: 0
              };
            }
            acc[key].total_sold += item.quantity;
          }
          return acc;
        }, {});

      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 3);

      setTopProducts(sortedProducts);
    } else {
      setTopProducts([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    processChartData();
  }, [allOrders, activeFilter]);

  // Real-time updates for order changes
  useEffect(() => {
    const channel = supabase
      .channel("admin_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Admin order update:", payload);
          fetchAllData(); // Refresh all data when orders change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const processChartData = () => {
    let startDate: Date;
    switch (activeFilter) {
      case "today":
        startDate = startOfDay(new Date());
        break;
      case "month":
        startDate = subDays(new Date(), 90);
        break;
      case "week":
      default:
        startDate = subDays(new Date(), 7);
        break;
    }

    const filtered = allOrders.filter(
      (order) => new Date(order.created_at) >= startDate
    );

    const aggregated = filtered.reduce((acc, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if(!acc[date]) {
            acc[date] = { date, revenue: 0, sales: 0 };
        }
        acc[date].revenue += order.order_total;
        acc[date].sales += 1;
        return acc;
    }, {} as {[key: string]: ChartData});

    setFilteredChartData(
      Object.values(aggregated).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };

    // Set accepted_at timestamp when order is accepted
    if (newStatus === "accepted") {
      updateData.accepted_at = new Date().toISOString();
    }

    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
    } else {
      toast.success("Order status updated.");
      setTodaysPendingOrders((prevOrders) =>
        prevOrders.filter((o) => o.id !== orderId)
      );
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10";
      case "processing":
        return "border-blue-500 text-blue-500 hover:bg-blue-500/10";
      case "completed":
        return "border-green-500 text-green-500 hover:bg-green-500/10";
      case "cancelled":
        return "border-red-500 text-red-500 hover:bg-red-500/10";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 border-l-4 border-green-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Total Revenue
              </CardTitle>
              <Image
                src="/images/revenue.png"
                alt="Revenue"
                width={80}
                height={80}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 border-l-4 border-blue-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Sales</CardTitle>
              <Image
                src="/images/orders.png"
                alt="Sales"
                width={80}
                height={80}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.totalSales}</div>
            </CardContent>
          </Card>
          <Card className="border-0 border-l-4 border-orange-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Products</CardTitle>
              <Image
                src="/images/products.png"
                alt="Products"
                width={80}
                height={80}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodaysPendingOrders
                orders={todaysPendingOrders}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                getStatusClass={getStatusClass}
              />
            </div>
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Top Grossing Today</CardTitle>
                    <CardDescription>
                      Top 3 products sold today.
                    </CardDescription>
                  </div>
                  <Image
                    src="/images/profit-chart.png"
                    alt="Top Products"
                    width={40}
                    height={40}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <ul className="space-y-4">
                    {topProducts.map((product) => (
                      <li key={product.id} className="flex items-center gap-4">
                        <img 
                          src={product.image_url || '/images/burgers.jpeg'} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.total_sold} sold
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products sold yet today.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* SALES OVERVIEW CHARTS */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                An overview of your revenue and sales.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "today" ? "default" : "outline"}
                onClick={() => setActiveFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={activeFilter === "week" ? "default" : "outline"}
                onClick={() => setActiveFilter("week")}
              >
                Last 7 Days
              </Button>
              <Button
                variant={activeFilter === "month" ? "default" : "outline"}
                onClick={() => setActiveFilter("month")}
              >
                Last 3 Months
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue">
                <div className="h-64 w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <AreaChart
                      data={filteredChartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                     

                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(val) =>
                          new Date(val).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        dataKey="revenue"
                        tickFormatter={(val) => `$${val}`}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="revenue"
                        type="monotone"
                        fill="var(--color-revenue)"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </TabsContent>
              <TabsContent value="sales">
                <div className="h-64 w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <AreaChart
                      data={filteredChartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}/>
                      <YAxis dataKey="sales" />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="sales"
                        type="monotone"
                        fill="var(--color-sales)"
                        stroke="var(--color-sales)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

    </div>

  );

}
