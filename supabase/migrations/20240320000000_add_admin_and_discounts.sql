-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create discounts table
CREATE TABLE discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create menu_item_discounts junction table
CREATE TABLE menu_item_discounts (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (menu_item_id, discount_id)
);

-- Create category_discounts junction table
CREATE TABLE category_discounts (
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (category_id, discount_id)
);

-- Add RLS policies for admin access
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_discounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON menu_items;
DROP POLICY IF EXISTS "Admin full access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Admin can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Admin can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Admin can delete menu items" ON menu_items;

-- Create new policies for menu_items
CREATE POLICY "Menu items are viewable by everyone" 
  ON menu_items FOR SELECT 
  USING (true);

-- Temporary policy for testing - allow all authenticated users to modify menu items
CREATE POLICY "Allow authenticated users to modify menu items" 
  ON menu_items FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Create policies for admin access
CREATE POLICY "Admin full access to categories" ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to orders" ON orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to profiles" ON profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to discounts" ON discounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to menu_item_discounts" ON menu_item_discounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to category_discounts" ON category_discounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 