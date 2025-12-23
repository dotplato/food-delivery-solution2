-- Create menu_item_options table for required options like "On its Own" or "Make it a Meal"
CREATE TABLE IF NOT EXISTS menu_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_item_addons table for optional addons like sauces
CREATE TABLE IF NOT EXISTS menu_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create meal_options table for "Make it a Meal" options
CREATE TABLE IF NOT EXISTS meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_item_options table to store selected options for each order item
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID REFERENCES menu_item_options(id),
  addon_id UUID REFERENCES menu_item_addons(id),
  meal_option_id UUID REFERENCES meal_options(id),
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE menu_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_item_options
CREATE POLICY "Menu item options are viewable by everyone" 
  ON menu_item_options FOR SELECT 
  USING (true);

-- Create policies for menu_item_addons
CREATE POLICY "Menu item addons are viewable by everyone" 
  ON menu_item_addons FOR SELECT 
  USING (true);

-- Create policies for meal_options
CREATE POLICY "Meal options are viewable by everyone" 
  ON meal_options FOR SELECT 
  USING (true);

-- Create policies for order_item_options
CREATE POLICY "Users can view their own order item options" 
  ON order_item_options FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_options.order_item_id 
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order item options" 
  ON order_item_options FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_options.order_item_id 
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order item options"
  ON order_item_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert some sample options for burgers
INSERT INTO menu_item_options (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'On its Own',
  'Just the burger',
  0,
  true
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO menu_item_options (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'Make it a Meal',
  'Add fries and a drink',
  4.99,
  true
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

-- Insert some sample addons
INSERT INTO menu_item_addons (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'Extra Cheese',
  'Add an extra slice of cheese',
  0.99,
  false
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO menu_item_addons (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'Bacon',
  'Add crispy bacon strips',
  1.99,
  false
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

-- Insert some sample sauces
INSERT INTO menu_item_addons (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'BBQ Sauce',
  'Sweet and smoky BBQ sauce',
  0,
  true
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO menu_item_addons (menu_item_id, name, description, price_adjustment, is_required)
SELECT 
  id,
  'Spicy Mayo',
  'Creamy mayo with a kick',
  0,
  true
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

-- Insert some sample meal options
INSERT INTO meal_options (menu_item_id, name, description, price_adjustment)
SELECT 
  id,
  'Regular Fries',
  'Classic golden fries',
  0
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO meal_options (menu_item_id, name, description, price_adjustment)
SELECT 
  id,
  'Curly Fries',
  'Crispy curly fries',
  0.99
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO meal_options (menu_item_id, name, description, price_adjustment)
SELECT 
  id,
  'Soft Drink',
  'Your choice of carbonated beverage',
  0
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers');

INSERT INTO meal_options (menu_item_id, name, description, price_adjustment)
SELECT 
  id,
  'Milkshake',
  'Thick and creamy hand-spun shake',
  2.99
FROM menu_items 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'burgers'); 