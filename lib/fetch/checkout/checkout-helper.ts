// /lib/fetch/checkout/checkout-helper.ts
import { supabase } from "@/lib/supabase/client";

// ✅ Fetch user profile (name & phone)
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Failed to fetch user profile");
  return data;
}

// ✅ Fetch user royalty points
export async function fetchUserPoints(userId: string) {
  const { data, error } = await supabase
    .from("royalty_points")
    .select("current_balance")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return 0;
  return data?.current_balance || 0;
}

// ✅ Create a new order (for COD or points)
export async function createOrder(orderPayload: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();

  if (error) throw new Error("Failed to create order");
  return data;
}

// ✅ Insert royalty point record (earned/spent)
export async function insertRoyaltyPoints(userId: string, earned: number, spent: number) {
  const { error } = await supabase.from("royalty_points").insert({
    user_id: userId,
    points_earned: earned,
    points_spent: spent,
  });

  if (error) console.error("Error inserting royalty points:", error);
}
