"use client";
import { useEffect, useState } from "react";
import { Badge, Eye, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { Order } from "@/lib/types";
import { OrderDetailsModal } from "./OrderDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { OrderTimer } from "@/components/ui/order-timer";
import { supabase } from "@/lib/supabase/client";

// ✅ Import optimized helpers
import {
  fetchOrdersData,
  filterOrdersData,
  updateOrderStatus,
  updatePaymentStatus,
  getStatusClass,
  FilterType,
} from "@/lib/fetch/admin/orders-helper";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Re-filter when orders or filter changes
  useEffect(() => {
    const filtered = filterOrdersData(orders, activeFilter);
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [orders, activeFilter]);

  // ✅ Real-time subscription to sync with kitchen dashboard
  useEffect(() => {
    const channel = supabase
      .channel("admin_orders_realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order updated:", payload);
          // Update the order in the local state
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === payload.new.id
                ? { ...order, ...(payload.new as Order) }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await fetchOrdersData();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
      console.error("orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const updated = await updateOrderStatus(orderId, newStatus, orders);
    setOrders(updated);
    setUpdatingOrderId(null);
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    newStatus: string
  ) => {
    setUpdatingOrderId(orderId);
    const updated = await updatePaymentStatus(orderId, newStatus, orders);
    setOrders(updated);
    setUpdatingOrderId(null);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const FilterButton = ({
    filter,
    label,
  }: {
    filter: FilterType;
    label: string;
  }) => (
    <Button
      variant={activeFilter === filter ? "default" : "outline"}
      onClick={() => setActiveFilter(filter)}
    >
      {label}
    </Button>
  );

  // Paginated data
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getFilterLabel = (filter: FilterType): string => {
    const labels = {
      all: "All Orders",
      today: "Today's Orders",
      week: "Last Week",
      month: "Last 3 Months",
    };
    return labels[filter];
  };

  return (
    <div>
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all customer orders
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{filteredOrders.length} Order(s)</CardTitle>
            <div className="flex flex-col gap-3">
              {/* Active Filter Badge */}
              {activeFilter !== "all" && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-muted-foreground">
                    Showing:
                  </span>
                  <Badge
                    variant="secondary"
                    className="flex items-center pl-3 pr-2 py-1 gap-1"
                  >
                    {getFilterLabel(activeFilter)}
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="ml-1 hover:bg-muted rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}
              <div className="flex gap-2">
                <FilterButton filter="all" label="All" />
                <FilterButton filter="today" label="Today" />
                <FilterButton filter="week" label="Last Week" />
                <FilterButton filter="month" label="Last 3 Months" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-red-600 text-center py-10">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">Customer</TableHead>
                    <TableHead className="p-4">Created</TableHead>
                    <TableHead className="p-4">Total</TableHead>
                    <TableHead className="p-4">Status</TableHead>
                    <TableHead className="p-4">Timer</TableHead>
                    <TableHead className="p-4">Order Type</TableHead>
                    <TableHead className="p-4">Payment</TableHead>
                    <TableHead className="p-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <TableCell className="p-4">
                        <p className="font-medium">
                          {order.full_name || "Guest"}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {order.id.substring(0, 8)}...
                        </p>
                      </TableCell>
                      <TableCell className="p-4">
                        {new Date(order.created_at).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        ${order.order_total?.toFixed(2)}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleStatusChange(order.id, value)
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-32 h-8 text-xs capitalize",
                                  getStatusClass(order.status)
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="punched">Punched</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">
                                  Processing
                                </SelectItem>
                                <SelectItem value="cooking">Cooking</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        {order.accepted_at ? (
                          <OrderTimer
                            acceptedAt={order.accepted_at}
                            orderStatus={order.status}
                            updatedAt={order.completed_at}
                            className="text-orange-600"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-medium capitalize">
                          {(order.order_type as string) || "Online Order"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Select
                              value={order.payment_status}
                              onValueChange={(value) =>
                                handlePaymentStatusChange(order.id, value)
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-36 h-8 text-xs capitalize",
                                  getStatusClass(order.payment_status)
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cash_on_delivery">
                                  Cash on Delivery
                                </SelectItem>
                                <SelectItem value="Dine In">Dine In</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-sm text-muted-foreground">
                      per page
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                      of {totalItems}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        ←
                      </Button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={i}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        →
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
