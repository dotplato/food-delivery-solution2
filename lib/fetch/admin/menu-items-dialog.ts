// /lib/fetch/admin/menu-items-helper.ts
import { supabase } from '@/lib/supabase/client';
import { MenuItem, Category } from '@/lib/types';

/**
 * Fetch all categories ordered by name
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all menu items with category info
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Add a new menu item
 */
export async function addMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding menu item:', error);
    return null;
  }
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(id: string, itemData: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    return null;
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
}
