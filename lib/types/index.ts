export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  addons_available: boolean;
  meal_options_available: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
  options?: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
    selectedSauce?: any;
  };
  addons?: MenuItemAddon[];
  meal_options?: MealOption[];
};

export type CartItem = MenuItem & {
  quantity: number;
  options?: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
    selectedSauce?: any;
  };
};

export type Order = {
  id: string;
  user_id: string | null;
  status: string;
  subtotal: number;
  order_total: number;
  delivery_address: string | null;
  delivery_fee: number;
  phone: string | null;
  full_name?: string | null;
  payment_intent_id: string | null;
  payment_status: string;
  order_type?: string | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  completed_at?: string | null;
  points_discount?: number;
  metadata?: any[]; // Array of order items with their options/addons/sauces
};



export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type PendingOrder = {
  items: CartItem[];
  order_type: 'delivery' | 'pickup';
  delivery_address?: string;
  phone?: string;
  full_name?: string;
  location?: {
    lat: number;
    lng: number;
  };
  subtotal: number;
  delivery_fee: number;
  order_total: number;
};

export type MenuItemOption = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_required: boolean;
  created_at: string;
};

export type MenuItemAddon = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_required: boolean;
  created_at: string;
};

export type MealOption = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  created_at: string;
};
