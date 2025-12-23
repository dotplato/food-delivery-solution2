"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { PaymentForm } from "@/components/checkout/payment-form";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { PendingOrder } from "@/lib/types";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationDialog } from "@/components/location/LocationDialog";
import {
  ShoppingBag,
  Bike,
  Loader2,
  MapPin,
  Pencil,
  Trash,
} from "lucide-react";
import { PointsSection } from "@/components/checkout/points-section";
import { supabase } from "@/lib/supabase/client";

// ✅ Centralized API helper imports
import {
  fetchUserProfile,
  fetchUserPoints,
  createOrder,
  insertRoyaltyPoints,
} from "@/lib/fetch/checkout/checkout-helper";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
type OrderType = "delivery" | "pickup";
type PaymentMethod = "card" | "cod";

function safeOptions(options: any) {
  return {
    selectedOption: options?.selectedOption ?? null,
    selectedAddons: options?.selectedAddons ?? [],
    selectedMealOptions: options?.selectedMealOptions ?? [],
    selectedSauce: options?.selectedSauce ?? null,
  };
}

export default function CheckoutPage() {
  const [step, setStep] = useState<"type" | "address" | "payment">("type");
  const [orderType, setOrderType] = useState<OrderType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("order_type") as OrderType) || "delivery";
    }
    return "delivery";
  });
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [addressError, setAddressError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessingCod, setIsProcessingCod] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // New: order id and status for approval flow
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");

  // Redirect unauthenticated users
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      router.replace("/signin?redirect=/checkout");
    }
  }, [user, router]);

  // Redirect if no items in cart
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      items.length === 0 &&
      step !== "type"
    ) {
      router.push("/cart");
    }
  }, [items, router, step]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 3.99;
  const total = orderType === "delivery" ? subtotal + deliveryFee : subtotal;

  // ✅ Fetch user profile (from helper)
  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        try {
          const profile = await fetchUserProfile(user.id);
          setFullName(profile.full_name || "");
          setPhone(profile.phone || "");
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      }
    }
    loadProfile();
  }, [user]);

  // ✅ Fetch user points (from helper)
  useEffect(() => {
    async function loadPoints() {
      if (user?.id && step === "payment") {
        try {
          const points = await fetchUserPoints(user.id);
          setUserPoints(points);
        } catch {
          setUserPoints(0);
        }
      }
    }
    loadPoints();
  }, [user, step]);

  // Calculate points logic
  useEffect(() => {
    if (redeemPoints && userPoints > 0 && pendingOrder) {
      const maxPoints = Math.min(
        userPoints,
        Math.floor(pendingOrder.order_total * 100)
      );
      setPointsToRedeem(maxPoints);
      setPointsDiscount(maxPoints / 100);
    } else {
      setPointsToRedeem(0);
      setPointsDiscount(0);
    }
  }, [redeemPoints, userPoints, pendingOrder]);

  const handleOrderTypeSubmit = () => setStep("address");
  const handleLocationSelect = (loc: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setSelectedLocation(loc);
    setLocationDialogOpen(false);
    setAddressError("");
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "delivery") {
      if (!selectedLocation)
        return setAddressError("Please select a delivery address.");
      if (!fullName || !phone)
        return setAddressError("Full Name and Phone are required.");

      setPendingOrder({
        items,
        order_type: "delivery",
        delivery_address: selectedLocation.address,
        location: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        phone,
        subtotal,
        delivery_fee: deliveryFee,
        order_total: subtotal + deliveryFee,
        message,
        full_name: fullName,
      } as any);
    } else {
      if (!fullName || !phone)
        return setAddressError("Full Name and Phone are required.");
      setPendingOrder({
        items,
        order_type: "pickup",
        phone,
        subtotal,
        delivery_fee: 0,
        order_total: subtotal,
        message,
        full_name: fullName,
      } as any);
    }
    setAddressError("");
    setStep("payment");
  };

  // ✅ Handle Cash on Delivery
  const handleCodOrder = async () => {
    if (!pendingOrder) return;
    setIsProcessingCod(true);

    try {
      const orderMetadata = pendingOrder.items.map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url,
        /* 🔧 CHANGE 2: SAFE replace only */
        options: safeOptions(item.options),
      }));

      const orderPayload = {
        order_total: pendingOrder.order_total,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
        order_type: "Online Order",
        metadata: orderMetadata,
        user_id: user?.id,
      };

      const order = await createOrder(orderPayload);

      if (order && user?.id) {
        const pointsEarned = Math.floor(pendingOrder.order_total * 10);
        if (pointsEarned > 0)
          await insertRoyaltyPoints(user.id, pointsEarned, 0);
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/order-success");
    } catch (err) {
      toast.error("Failed to create order. Please try again.");
      console.error("COD Order Error:", err);
    } finally {
      setIsProcessingCod(false);
    }
  };

  // ✅ COD with points
  const handleCodOrderWithPoints = async (
    pointsToRedeem: number,
    pointsDiscount: number
  ) => {
    if (!pendingOrder) return;
    setIsProcessingCod(true);

    try {
      const orderMetadata = pendingOrder.items.map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url,
        /* 🔧 CHANGE */
        options: safeOptions(item.options),
      }));

      const orderPayload = {
        order_total: pendingOrder.order_total - pointsDiscount,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
        order_type: "Online Order",
        metadata: orderMetadata,
        user_id: user?.id,
      };

      const order = await createOrder(orderPayload);

      if (order && user?.id) {
        if (pointsToRedeem > 0)
          await insertRoyaltyPoints(user.id, 0, pointsToRedeem);

        const pointsEarned = Math.floor(
          (pendingOrder.order_total - pointsDiscount) * 10
        );
        if (pointsEarned > 0)
          await insertRoyaltyPoints(user.id, pointsEarned, 0);
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/order-success");
    } catch (err) {
      toast.error("Failed to create order. Please try again.");
      console.error("COD Order Error:", err);
    } finally {
      setIsProcessingCod(false);
    }
  };

  // --- create pending order (card flow) ---
  const createPendingOrder = async () => {
    if (!user || !pendingOrder) return null;

    try {
      const orderMetadata = pendingOrder.items.map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url,
        /* 🔧 CHANGE */
        options: safeOptions(item.options),
      }));

      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: pendingOrder.subtotal,
          delivery_fee: pendingOrder.delivery_fee,
          order_total: pendingOrder.order_total,
          delivery_address: pendingOrder.delivery_address,
          phone: pendingOrder.phone,
          full_name: pendingOrder.full_name,
          payment_status: "unpaid",
          status: "pending",
          order_type: "Online Order",
          metadata: orderMetadata,
        })
        .select()
        .single();

      if (error) throw error;

      setOrderId(data.id);
      setOrderStatus("pending");
      toast.success("Order created successfully! Waiting for admin approval.");
      return data.id;
    } catch (err) {
      toast.error("Failed to create order.");
      console.error("Error creating pending order:", err);
      throw err;
    }
  };

  // --- NEW: realtime listener for that specific order ---
  // Watch for admin acceptance
  // --- NEW: realtime listener for that specific order ---
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          console.log("Realtime order update:", newStatus);

          if (newStatus === "accepted") {
            setOrderStatus("accepted");
            // Payment will be triggered automatically by PaymentForm component
            // Toast will be shown by PaymentForm when payment processing starts
          } else if (newStatus === "denied") {
            toast.error("Admin denied your order.");
            setOrderStatus("denied");
          } else {
            setOrderStatus(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {step === "type" && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Select Order Type
                </h2>
                <Separator className="mb-6" />
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  className="flex flex-col gap-4"
                >
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${
                        orderType === "delivery"
                          ? "border-gray-500"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => setOrderType("delivery")}
                  >
                    <RadioGroupItem
                      value="delivery"
                      id="delivery"
                      className="h-5 w-5"
                    />
                    <span className="flex items-center gap-2">
                      {/* Delivery Icon */}
                      <Bike className="h-6 w-6 text-blue-500" />
                      <Label
                        htmlFor="delivery"
                        className="text-lg font-medium "
                      >
                        Delivery
                      </Label>
                    </span>
                  </div>
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${
                        orderType === "pickup"
                          ? "border-gray-500"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => setOrderType("pickup")}
                  >
                    <RadioGroupItem
                      value="pickup"
                      id="pickup"
                      className="h-5 w-5"
                    />
                    <span className="flex items-center gap-2">
                      {/* Pickup Icon */}
                      <ShoppingBag className="h-6 w-6 text-green-500" />
                      <Label htmlFor="pickup" className="text-lg font-medium">
                        Pickup
                      </Label>
                    </span>
                  </div>
                </RadioGroup>
                <Button className="mt-6 w-full" onClick={handleOrderTypeSubmit}>
                  Continue
                </Button>
              </div>
            )}

            {step === "address" && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {orderType === "delivery"
                    ? "Delivery Information"
                    : "Pickup Information"}
                </h2>
                <Separator className="mb-6" />
                <form onSubmit={handleAddressFormSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                    />
                  </div>
                  {orderType === "delivery" && (
                    <>
                      <div>
                        <div className="flex items-center bg-gray-100 border rounded p-3 text-sm mt-2 gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            {/* Lucide MapPin icon for address display */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 21s-6-5.686-6-10A6 6 0 0112 3a6 6 0 016 6c0 4.314-6 10-6 10z"
                              />
                              <circle
                                cx="12"
                                cy="9"
                                r="2.5"
                                fill="currentColor"
                              />
                            </svg>
                            <div>
                              {selectedLocation ? (
                                <>
                                  <b>Selected Address:</b>{" "}
                                  {selectedLocation.address}
                                </>
                              ) : (
                                <p>No address selected</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {selectedLocation ? (
                              <>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-blue-100 text-blue-600 transition"
                                  title="Edit address"
                                  onClick={() => setLocationDialogOpen(true)}
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                                  title="Delete address"
                                  onClick={() => setSelectedLocation(null)}
                                >
                                  <Trash className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="p-2 flex gap-2 rounded hover:bg-blue-100 text-blue-600 transition"
                                title="Select address"
                                onClick={() => setLocationDialogOpen(true)}
                              >
                                <MapPin className="h-5 w-5" />
                                Select Address
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {addressError && (
                        <div className="text-red-600 text-sm mt-1">
                          {addressError}
                        </div>
                      )}
                    </>
                  )}
                  <Button type="submit" className="w-full mt-2">
                    Continue to Payment
                  </Button>
                </form>
                {orderType === "delivery" && (
                  <LocationDialog
                    open={locationDialogOpen}
                    onClose={() => setLocationDialogOpen(false)}
                    onSelect={handleLocationSelect}
                  />
                )}
              </div>
            )}

            {step === "payment" && pendingOrder && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <Separator className="mb-6" />

                {/* Beautiful Points Section */}
                <div className="mb-6">
                  <PointsSection
                    userPoints={userPoints}
                    redeemPoints={redeemPoints}
                    pointsToRedeem={pointsToRedeem}
                    pointsDiscount={pointsDiscount}
                    total={total}
                    onRedeemChange={setRedeemPoints}
                  />
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                  className="mb-6 flex flex-col gap-3"
                >
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${
                        paymentMethod === "card"
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <RadioGroupItem
                      value="card"
                      id="card"
                      className="h-5 w-5"
                    />
                    <span className="flex items-center gap-2">
                      {/* Card Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <rect
                          x="2"
                          y="6"
                          width="20"
                          height="12"
                          rx="2"
                          strokeWidth={2}
                          stroke="currentColor"
                          fill="none"
                        />
                        <path
                          d="M2 10h20"
                          strokeWidth={2}
                          stroke="currentColor"
                        />
                      </svg>
                      <Label htmlFor="card" className="text-lg font-medium">
                        Credit / Debit Card
                      </Label>
                    </span>
                  </div>
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${
                        paymentMethod === "cod"
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <RadioGroupItem value="cod" id="cod" className="h-5 w-5" />
                    <span className="flex items-center gap-2">
                      {/* Cash Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="7"
                          width="18"
                          height="10"
                          rx="2"
                          strokeWidth={2}
                          stroke="currentColor"
                          fill="none"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          strokeWidth={2}
                          stroke="currentColor"
                          fill="none"
                        />
                      </svg>
                      <Label htmlFor="cod" className="text-lg font-medium">
                        Cash on Delivery
                      </Label>
                    </span>
                  </div>
                </RadioGroup>

                <Separator className="mb-6" />

                {paymentMethod === "card" ? (
                  <div className="space-y-4">
                    {/* Always show Stripe form */}
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        pendingOrder={{
                          ...pendingOrder,
                          pointsToRedeem,
                          pointsDiscount,
                          ...(orderId ? { id: orderId } : {}), // <-- only include id if orderId exists
                        }}
                        orderStatus={orderStatus}
                        orderId={orderId} // Pass orderId as prop
                        onCreateOrder={createPendingOrder}
                        onCardChange={(complete) => {
                          console.log("Card complete status:", complete);
                          setCardComplete(complete);
                        }}
                        onPaymentSuccess={() => {
                          clearCart();
                          router.push("/order-success");
                        }}
                      />
                    </Elements>

                    {orderId && orderStatus === "pending" && (
                      <div className="p-4 border rounded text-center text-gray-500">
                        Waiting for admin approval...
                      </div>
                    )}

                    {orderId && orderStatus === "denied" && (
                      <div className="p-6 border rounded-lg text-center text-red-600 bg-red-50 border-red-200">
                        <p className="font-semibold">
                          Your order is currently denied.
                        </p>
                        <p>You can order something else from menu.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-4">
                      You will pay in cash upon delivery.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        redeemPoints && pointsToRedeem > 0
                          ? handleCodOrderWithPoints(
                              pointsToRedeem,
                              pointsDiscount
                            )
                          : handleCodOrder()
                      }
                      disabled={isProcessingCod}
                    >
                      {isProcessingCod ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Confirm Order
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <Separator className="mb-4" />

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeFromCart}
                  />
                ))}
              </div>
              {/* Points Discount and Updated Total */}
              {redeemPoints && pointsDiscount > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="font-semibold text-green-700">
                        Points Discount Applied
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      -${pointsDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="font-medium text-gray-700">
                      Final Total
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ${(total - pointsDiscount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <CartSummary
              showCheckoutButton={false}
              pointsDiscount={redeemPoints ? pointsDiscount : 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
