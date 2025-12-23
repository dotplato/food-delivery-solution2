export const revalidate = 60;


import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data || [];
}
