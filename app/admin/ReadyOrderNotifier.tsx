"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";
import { OrderDetailsModal } from "./orders/OrderDetailsModal";
import { X, Bell } from "lucide-react";

export function ReadyOrderNotifier() {
  const [readyOrder, setReadyOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("ready-orders")
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "orders",
          filter: "status=eq.ready"
        },
        (payload) => {
          setReadyOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReadyOrder(null);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setReadyOrder(null);
  }

  if (!readyOrder) return null;

  return (
    <>
      <div
        onClick={handleNotificationClick}
        className="fixed top-20 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg cursor-pointer animate-pulse z-50 flex items-center gap-4"
      >
        <Bell size={24} />
        <div>
          <p className="font-bold">Order Ready for Pickup!</p>
          <p className="text-sm">Click to view details.</p>
        </div>
         <button onClick={handleCloseNotification} className="absolute top-1 right-1 hover:bg-white/20 rounded-full p-1">
            <X size={16} />
        </button>
      </div>

      <OrderDetailsModal
        order={readyOrder}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
}
