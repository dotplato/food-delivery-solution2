import { supabase } from '@/lib/supabase/client';

export async function fetchMenuData() {
  const [catRes, menuRes, addonsRes, mealOptionsRes, saucesRes, catSaucesRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('menu_items').select('*').eq('available', true).order('name'),
    supabase.from('addons').select('*').order('name'),
    supabase.from('meal_options').select('*').order('name'),
    supabase.from('sauces').select('*').order('name'),
    supabase.from('category_sauces').select('*'),
  ]);

  return {
    categories: catRes.data ?? [],
    menuItems: menuRes.data ?? [],
    addons: addonsRes.data ?? [],
    mealOptions: mealOptionsRes.data ?? [],
    sauces: saucesRes.data ?? [],
    categorySauces: catSaucesRes.data ?? [],
  };
}
