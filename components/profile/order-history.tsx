"use client";

import { useEffect, useState } from "react";
import format from "date-fns/format";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderTimer } from "@/components/ui/order-timer";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Order } from "@/lib/types";
import Link from "next/link";

const columns = [
  {
    accessorKey: "created_at",
    header: "Order Date",
    cell: ({ row }: any) => (
      <div>
        {format(new Date(row.original.created_at), "MMM dd, yyyy h:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }: any) => (
      <div className="font-mono text-xs">
        {row.original.id.substring(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: any) => <div>${row.original.order_total.toFixed(2)}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";

      switch (status) {
        case "pending":
          variant = "outline";
          break;
        case "processing":
          variant = "secondary";
          break;
        case "completed":
          variant = "default";
          break;
        case "cancelled":
          variant = "destructive";
          break;
      }

      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "timer",
    header: "Time",
    cell: ({ row }: any) => {
      const order = row.original;
      // Only show timer for orders that have been accepted
      if (order.accepted_at) {
        return (
          <OrderTimer
            acceptedAt={order.accepted_at}
            orderStatus={order.status}
            updatedAt={order.completed_at}
          />
        );
      }
      return <span className="text-sm text-muted-foreground">Pending</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <Link href={`/orders/${row.original.id}`}>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </Link>
    ),
  },
];

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet.
        </p>
        <Link href="/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
