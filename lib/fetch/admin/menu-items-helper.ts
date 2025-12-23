// /lib/fetch/admin/menu-items-helper.ts
import { supabase } from '@/lib/supabase/client';
import { MenuItem, Category } from '@/lib/types';

/**
 * Fetch all categories
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
 * Fetch all menu items (with category info)
 */
export async function fetchMenuItemsWithCategory(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false });

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
export async function addMenuItem(item: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    const { data, error } = await supabase.from('menu_items').insert({
      name: item.name!,
      description: item.description,
      price: item.price!,
      image_url: item.image_url,
      category_id: item.category_id,
      available: item.available ?? true,
      featured: item.featured ?? false,
    })
    .select(`
      *,
      category:categories(*)
    `)
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
export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        category_id: item.category_id,
        available: item.available,
        featured: item.featured,
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
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
    // First, get the menu item to retrieve the image URL
    const { data: item, error: fetchError } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the menu item from database
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;

    // Delete the associated image from storage if it exists
    if (item?.image_url) {
      const { deleteMenuItemImage } = await import('@/lib/upload-helpers');
      await deleteMenuItemImage(item.image_url);
    }

    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
}
