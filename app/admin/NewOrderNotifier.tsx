"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";
import { OrderDetailsModal } from "./orders/OrderDetailsModal";
import { X, Bell } from "lucide-react";

export function NewOrderNotifier() {
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("NewOrderNotifier: Setting up subscription...");
    const channel = supabase
      .channel("new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("NewOrderNotifier: New order received!", payload);
          setNewOrder(payload.new as Order);
        }
      )
      .subscribe((status) => {
        console.log("NewOrderNotifier: Subscription status:", status);
      });

    return () => {
      console.log("NewOrderNotifier: Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewOrder(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewOrder(null);
  };

  if (!newOrder) return null;

  return (
    <>
      <div
        onClick={handleNotificationClick}
        className="fixed top-20 right-5 bg-green-700 text-white p-4 rounded-lg shadow-lg cursor-pointer animate-pulse z-50 flex items-center gap-4"
      >
        <Bell size={24} />
        <div>
          <p className="font-bold">New Order Received!</p>
          <p className="text-sm">Click to view details.</p>
        </div>
        <button
          onClick={handleCloseNotification}
          className="absolute top-1 right-1 hover:bg-white/20 rounded-full p-1"
        >
          <X size={16} />
        </button>
      </div>

      <OrderDetailsModal
        order={newOrder}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
}
