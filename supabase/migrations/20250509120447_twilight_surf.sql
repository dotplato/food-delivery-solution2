/*
  # Initial schema for burger restaurant app

  1. New Tables
    - `categories` - Food categories like burgers, sides, drinks
    - `menu_items` - Individual food items with descriptions, prices
    - `orders` - Customer orders
    - `order_items` - Items within each order
    - `profiles` - Extended user profile information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table as extension of auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  phone TEXT,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

-- Menu items policies (public read, admin write)
CREATE POLICY "Menu items are viewable by everyone" 
  ON menu_items FOR SELECT 
  USING (true);

-- Profiles policies (users can view and update their own profiles)
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
  ON orders FOR UPDATE 
  USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" 
  ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items" 
  ON order_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Create function to create a profile after signup
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile after signup
CREATE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Insert some sample categories
INSERT INTO categories (name, slug, description, image_url)
VALUES 
  ('Burgers', 'burgers', 'Juicy beef patties with fresh toppings', 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg'),
  ('Sides', 'sides', 'Perfect companions to your meal', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg'),
  ('Drinks', 'drinks', 'Refreshing beverages to complete your meal', 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg'),
  ('Combos', 'combos', 'Value meals with burgers, sides and drinks', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg');

-- Insert some sample menu items
INSERT INTO menu_items (name, description, price, image_url, category_id, featured)
VALUES 
  ('Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 8.99, 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', (SELECT id FROM categories WHERE slug = 'burgers'), true),
  ('Cheese Burger', 'Classic burger with American cheese', 9.99, 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg', (SELECT id FROM categories WHERE slug = 'burgers'), true),
  ('Bacon Burger', 'Classic burger with crispy bacon strips', 10.99, 'https://images.pexels.com/photos/3219547/pexels-photo-3219547.jpeg', (SELECT id FROM categories WHERE slug = 'burgers'), false),
  ('Double Trouble', 'Two beef patties with all the fixings', 12.99, 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg', (SELECT id FROM categories WHERE slug = 'burgers'), true),
  ('Veggie Burger', 'Plant-based patty with fresh vegetables', 9.99, 'https://images.pexels.com/photos/3607284/pexels-photo-3607284.jpeg', (SELECT id FROM categories WHERE slug = 'burgers'), false),
  
  ('French Fries', 'Crispy golden potato fries', 3.99, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', (SELECT id FROM categories WHERE slug = 'sides'), false),
  ('Onion Rings', 'Crispy battered onion rings', 4.99, 'https://images.pexels.com/photos/4676413/pexels-photo-4676413.jpeg', (SELECT id FROM categories WHERE slug = 'sides'), false),
  ('Coleslaw', 'Fresh cabbage and carrot in creamy dressing', 2.99, 'https://images.pexels.com/photos/5718073/pexels-photo-5718073.jpeg', (SELECT id FROM categories WHERE slug = 'sides'), false),
  
  ('Soda', 'Your choice of carbonated beverage', 1.99, 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg', (SELECT id FROM categories WHERE slug = 'drinks'), false),
  ('Milkshake', 'Thick and creamy hand-spun shake', 4.99, 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', (SELECT id FROM categories WHERE slug = 'drinks'), true),
  ('Lemonade', 'Fresh squeezed lemonade', 2.99, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', (SELECT id FROM categories WHERE slug = 'drinks'), false),
  
  ('Burger Combo', 'Classic burger with fries and a drink', 12.99, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', (SELECT id FROM categories WHERE slug = 'combos'), true),
  ('Double Combo', 'Double burger with fries and a drink', 15.99, 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg', (SELECT id FROM categories WHERE slug = 'combos'), false),
  ('Family Feast', 'Four burgers, two large fries, and four drinks', 39.99, 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg', (SELECT id FROM categories WHERE slug = 'combos'), false);