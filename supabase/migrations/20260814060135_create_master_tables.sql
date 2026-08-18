/*
# Create Master Database Structure for StockSy

## Overview
This migration creates all master (reference/lookup) tables for the StockSy application.

## New Tables

### 1. master_users
Extended user registration table linked to Supabase auth.
- `id` (uuid, PK, links to auth.users)
- `unique_code_id` (text, unique) - auto-generated unique code like STK-2026-00001
- `mobile` (text, NOT NULL, mandatory) - mobile number
- `name` (text, NOT NULL)
- `email` (text)
- `address` (text)
- `pin_code` (text)
- `country` (text)
- `state` (text)
- `user_tier` (text) - 'free', 'paid', 'premium' (default: 'free')
- `avatar_color` (text)
- `household_size` (integer)
- `notifications_enabled`, `expiry_alerts`, `low_stock_alerts` (booleans)
- `created_at`, `updated_at` (timestamps)

### 2. master_categories
Inventory categories - shared reference data.
- `id` (uuid, PK)
- `name` (text, NOT NULL, unique)
- `description` (text)
- `image_url` (text)
- `sort_order` (integer)
- `created_at` (timestamp)

### 3. master_subcategories
Subcategories linked to categories.
- `id` (uuid, PK)
- `category_id` (uuid, FK to master_categories)
- `name` (text, NOT NULL)
- `description` (text)
- `image_url` (text)
- `sort_order` (integer)
- `created_at` (timestamp)

### 4. master_inventory_items
Inventory item templates - shared reference data.
- `id` (uuid, PK)
- `category_id` (uuid, FK to master_categories)
- `subcategory_id` (uuid, FK to master_subcategories, nullable)
- `name` (text, NOT NULL)
- `description` (text)
- `image_url` (text)
- `default_unit` (text) - kg, pcs, liters, g, ml, pack
- `default_low_stock_threshold` (integer)
- `barcode` (text)
- `created_at` (timestamp)

### 5. master_milk_config
Milk tracker configuration per user.
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
- `rate_per_kg` (numeric, default 80)
- `milk_per_day` (numeric, default 2)
- `milkman_name` (text, default 'Jitendra')
- `milkman_mobile` (text, default '9876578654')
- `created_at`, `updated_at` (timestamps)

### 6. master_maid_config
Maid tracker configuration per user - supports multiple maids.
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
- `maid_name` (text, NOT NULL)
- `role` (text) - e.g. 'Cleaning Maid', 'Cooking Maid'
- `rate_per_month` (numeric)
- `arrival_time` (text) - e.g. '11 AM & 5 PM'
- `mobile` (text)
- `created_at`, `updated_at` (timestamps)

### 7. master_recipes
Recipe master/templates - shared reference data.
- `id` (uuid, PK)
- `name` (text, NOT NULL)
- `description` (text)
- `image_url` (text)
- `category` (text) - Breakfast, Lunch, Dinner, Beverage
- `cook_time` (text) - e.g. '45 min'
- `servings` (integer)
- `rating` (numeric)
- `ingredients` (jsonb array)
- `steps` (jsonb array)
- `created_at` (timestamp)

### 8. master_meal_plan_templates
Weekly meal plan templates - shared reference data.
- `id` (uuid, PK)
- `name` (text, NOT NULL)
- `description` (text)
- `day_of_week` (text) - Mon, Tue, Wed, Thu, Fri, Sat, Sun
- `breakfast` (text)
- `lunch` (text)
- `dinner` (text)
- `created_at` (timestamp)

## Security
- All tables have RLS enabled.
- master_users: owner-scoped (user can only see/edit their own profile).
- master_categories, master_subcategories, master_inventory_items, master_recipes, master_meal_plan_templates: shared reference data - all authenticated users can SELECT; only authenticated users can INSERT/UPDATE/DELETE.
- master_milk_config, master_maid_config: owner-scoped (user can only manage their own configs).

## Important Notes
1. A trigger auto-generates unique_code_id for new master_users rows.
2. A sequence is used to generate sequential unique codes.
3. The existing `profiles` table remains unchanged - master_users is a new extended table.
4. Seed data is inserted for categories, subcategories, sample inventory items, and recipes.
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SEQUENCE for unique user codes
-- ============================================
CREATE SEQUENCE IF NOT EXISTS user_code_seq START 1;

-- ============================================
-- 1. master_users
-- ============================================
CREATE TABLE IF NOT EXISTS master_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unique_code_id text UNIQUE NOT NULL,
  mobile text NOT NULL,
  name text NOT NULL,
  email text DEFAULT '',
  address text DEFAULT '',
  pin_code text DEFAULT '',
  country text DEFAULT '',
  state text DEFAULT '',
  user_tier text NOT NULL DEFAULT 'free' CHECK (user_tier IN ('free', 'paid', 'premium')),
  avatar_color text DEFAULT '#1d6fd1',
  household_size integer DEFAULT 1,
  notifications_enabled boolean DEFAULT true,
  expiry_alerts boolean DEFAULT true,
  low_stock_alerts boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE master_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_master_user" ON master_users;
CREATE POLICY "select_own_master_user" ON master_users FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_master_user" ON master_users;
CREATE POLICY "insert_own_master_user" ON master_users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_master_user" ON master_users;
CREATE POLICY "update_own_master_user" ON master_users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_master_user" ON master_users;
CREATE POLICY "delete_own_master_user" ON master_users FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Trigger to auto-generate unique_code_id
CREATE OR REPLACE FUNCTION generate_user_code_id()
RETURNS trigger AS $$
DECLARE
  next_val bigint;
  code_text text;
BEGIN
  next_val := nextval('user_code_seq');
  code_text := 'STK-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(next_val::text, 5, '0');
  NEW.unique_code_id := code_text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_generate_user_code ON master_users;
CREATE TRIGGER trg_generate_user_code
  BEFORE INSERT ON master_users
  FOR EACH ROW
  EXECUTE FUNCTION generate_user_code_id();

-- ============================================
-- 2. master_categories
-- ============================================
CREATE TABLE IF NOT EXISTS master_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_master_categories" ON master_categories;
CREATE POLICY "select_master_categories" ON master_categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_master_categories" ON master_categories;
CREATE POLICY "insert_master_categories" ON master_categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_master_categories" ON master_categories;
CREATE POLICY "update_master_categories" ON master_categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_master_categories" ON master_categories;
CREATE POLICY "delete_master_categories" ON master_categories FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- 3. master_subcategories
-- ============================================
CREATE TABLE IF NOT EXISTS master_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES master_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_master_subcategories" ON master_subcategories;
CREATE POLICY "select_master_subcategories" ON master_subcategories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_master_subcategories" ON master_subcategories;
CREATE POLICY "insert_master_subcategories" ON master_subcategories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_master_subcategories" ON master_subcategories;
CREATE POLICY "update_master_subcategories" ON master_subcategories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_master_subcategories" ON master_subcategories;
CREATE POLICY "delete_master_subcategories" ON master_subcategories FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- 4. master_inventory_items
-- ============================================
CREATE TABLE IF NOT EXISTS master_inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES master_categories(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES master_subcategories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  default_unit text DEFAULT 'pcs',
  default_low_stock_threshold integer DEFAULT 1,
  barcode text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_master_inventory_items" ON master_inventory_items;
CREATE POLICY "select_master_inventory_items" ON master_inventory_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_master_inventory_items" ON master_inventory_items;
CREATE POLICY "insert_master_inventory_items" ON master_inventory_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_master_inventory_items" ON master_inventory_items;
CREATE POLICY "update_master_inventory_items" ON master_inventory_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_master_inventory_items" ON master_inventory_items;
CREATE POLICY "delete_master_inventory_items" ON master_inventory_items FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- 5. master_milk_config
-- ============================================
CREATE TABLE IF NOT EXISTS master_milk_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_per_kg numeric DEFAULT 80,
  milk_per_day numeric DEFAULT 2,
  milkman_name text DEFAULT 'Jitendra',
  milkman_mobile text DEFAULT '9876578654',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE master_milk_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_milk_config" ON master_milk_config;
CREATE POLICY "select_own_milk_config" ON master_milk_config FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_milk_config" ON master_milk_config;
CREATE POLICY "insert_own_milk_config" ON master_milk_config FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_milk_config" ON master_milk_config;
CREATE POLICY "update_own_milk_config" ON master_milk_config FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_milk_config" ON master_milk_config;
CREATE POLICY "delete_own_milk_config" ON master_milk_config FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 6. master_maid_config
-- ============================================
CREATE TABLE IF NOT EXISTS master_maid_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  maid_name text NOT NULL,
  role text DEFAULT '',
  rate_per_month numeric DEFAULT 0,
  arrival_time text DEFAULT '',
  mobile text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE master_maid_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_maid_config" ON master_maid_config;
CREATE POLICY "select_own_maid_config" ON master_maid_config FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_maid_config" ON master_maid_config;
CREATE POLICY "insert_own_maid_config" ON master_maid_config FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_maid_config" ON master_maid_config;
CREATE POLICY "update_own_maid_config" ON master_maid_config FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_maid_config" ON master_maid_config;
CREATE POLICY "delete_own_maid_config" ON master_maid_config FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 7. master_recipes
-- ============================================
CREATE TABLE IF NOT EXISTS master_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'Dinner',
  cook_time text DEFAULT '',
  servings integer DEFAULT 2,
  rating numeric DEFAULT 4.5,
  ingredients jsonb DEFAULT '[]'::jsonb,
  steps jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_master_recipes" ON master_recipes;
CREATE POLICY "select_master_recipes" ON master_recipes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_master_recipes" ON master_recipes;
CREATE POLICY "insert_master_recipes" ON master_recipes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_master_recipes" ON master_recipes;
CREATE POLICY "update_master_recipes" ON master_recipes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_master_recipes" ON master_recipes;
CREATE POLICY "delete_master_recipes" ON master_recipes FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- 8. master_meal_plan_templates
-- ============================================
CREATE TABLE IF NOT EXISTS master_meal_plan_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  day_of_week text DEFAULT '',
  breakfast text DEFAULT '',
  lunch text DEFAULT '',
  dinner text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_meal_plan_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_master_meal_templates" ON master_meal_plan_templates;
CREATE POLICY "select_master_meal_templates" ON master_meal_plan_templates FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_master_meal_templates" ON master_meal_plan_templates;
CREATE POLICY "insert_master_meal_templates" ON master_meal_plan_templates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_master_meal_templates" ON master_meal_plan_templates;
CREATE POLICY "update_master_meal_templates" ON master_meal_plan_templates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_master_meal_templates" ON master_meal_plan_templates;
CREATE POLICY "delete_master_meal_templates" ON master_meal_plan_templates FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_master_users_mobile ON master_users(mobile);
CREATE INDEX IF NOT EXISTS idx_master_users_tier ON master_users(user_tier);
CREATE INDEX IF NOT EXISTS idx_master_subcategories_cat ON master_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_master_inv_items_cat ON master_inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_master_inv_items_subcat ON master_inventory_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_master_milk_config_user ON master_milk_config(user_id);
CREATE INDEX IF NOT EXISTS idx_master_maid_config_user ON master_maid_config(user_id);
CREATE INDEX IF NOT EXISTS idx_master_recipes_category ON master_recipes(category);

-- ============================================
-- SEED DATA: Categories
-- ============================================
INSERT INTO master_categories (name, description, sort_order) VALUES
  ('Groceries', 'Rice, flour, pulses, grains and staples', 1),
  ('Dairy', 'Milk, cheese, yogurt and dairy products', 2),
  ('Produce', 'Fresh fruits and vegetables', 3),
  ('Bakery', 'Bread, cakes and baked goods', 4),
  ('Beverages', 'Juices, tea, coffee and drinks', 5),
  ('Snacks', 'Chips, biscuits and snack items', 6),
  ('Cleaning', 'Dish soap, detergents and cleaning supplies', 7),
  ('Personal Care', 'Soap, shampoo and hygiene products', 8),
  ('Medicine', 'OTC medicines and health supplies', 9),
  ('Other', 'Miscellaneous household items', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA: Subcategories
-- ============================================
INSERT INTO master_subcategories (category_id, name, description, sort_order)
SELECT c.id, s.sub_name, s.sub_desc, s.sort_order
FROM master_categories c
JOIN (VALUES
  ('Groceries', 'Rice & Grains', 'Rice, wheat, basmati, etc', 1),
  ('Groceries', 'Pulses & Lentils', 'Dal, chickpeas, beans', 2),
  ('Groceries', 'Flour & Atta', 'Wheat flour, besan, maida', 3),
  ('Groceries', 'Spices & Masala', 'Whole and ground spices', 4),
  ('Groceries', 'Cooking Oil', 'Mustard, sunflower, olive oil', 5),
  ('Dairy', 'Milk', 'Full cream, toned, skimmed milk', 1),
  ('Dairy', 'Curd & Yogurt', 'Plain, flavored, greek yogurt', 2),
  ('Dairy', 'Cheese', 'Processed, mozzarella, paneer', 3),
  ('Dairy', 'Butter & Ghee', 'Butter, ghee, cream', 4),
  ('Produce', 'Vegetables', 'Fresh vegetables', 1),
  ('Produce', 'Fruits', 'Fresh fruits', 2),
  ('Produce', 'Herbs', 'Coriander, mint, curry leaves', 3),
  ('Bakery', 'Bread', 'Brown, white, multigrain bread', 1),
  ('Bakery', 'Cakes & Pastries', 'Cakes, muffins, pastries', 2),
  ('Bakery', 'Cookies & Biscuits', 'Cookies, rusk, biscuits', 3),
  ('Beverages', 'Tea & Coffee', 'Tea leaves, coffee powder', 1),
  ('Beverages', 'Juices', 'Packaged and fresh juices', 2),
  ('Beverages', 'Soft Drinks', 'Aerated drinks, soda', 3),
  ('Snacks', 'Chips & Namkeen', 'Potato chips, namkeen, bhujia', 1),
  ('Snacks', 'Chocolate & Candy', 'Chocolates, candies, sweets', 2),
  ('Cleaning', 'Dishwashing', 'Dish soap, scrub, tablets', 1),
  ('Cleaning', 'Laundry', 'Detergent, fabric softener', 2),
  ('Cleaning', 'Surface Cleaning', 'Floor cleaner, disinfectant', 3),
  ('Personal Care', 'Bath & Body', 'Soap, body wash, shampoo', 1),
  ('Personal Care', 'Oral Care', 'Toothpaste, mouthwash, brush', 2),
  ('Personal Care', 'Hair Care', 'Shampoo, conditioner, oil', 3),
  ('Medicine', 'OTC Tablets', 'Paracetamol, ibuprofen, etc', 1),
  ('Medicine', 'First Aid', 'Bandages, antiseptic, gauze', 2)
) AS s(cat_name, sub_name, sub_desc, sort_order)
ON c.name = s.cat_name
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Master Inventory Items (sample)
-- ============================================
INSERT INTO master_inventory_items (category_id, name, description, default_unit, default_low_stock_threshold)
SELECT c.id, i.item_name, i.item_desc, i.unit, i.threshold
FROM master_categories c
JOIN (VALUES
  ('Groceries', 'Basmati Rice', 'Premium long grain rice', 'kg', 2),
  ('Groceries', 'Wheat Flour (Atta)', 'Whole wheat flour', 'kg', 2),
  ('Groceries', 'Toor Dal', 'Split pigeon peas', 'kg', 1),
  ('Groceries', 'Sunflower Oil', 'Refined sunflower cooking oil', 'liters', 1),
  ('Groceries', 'Garam Masala', 'Mixed ground spices', 'pack', 1),
  ('Dairy', 'Whole Milk', 'Full cream milk', 'liters', 1),
  ('Dairy', 'Yogurt', 'Plain fresh yogurt', 'pack', 2),
  ('Dairy', 'Paneer', 'Fresh cottage cheese', 'pack', 1),
  ('Dairy', 'Butter', 'Salted butter', 'pack', 1),
  ('Produce', 'Tomatoes', 'Fresh red tomatoes', 'kg', 1),
  ('Produce', 'Onions', 'Fresh onions', 'kg', 2),
  ('Produce', 'Potatoes', 'Fresh potatoes', 'kg', 2),
  ('Produce', 'Bananas', 'Fresh bananas', 'pcs', 6),
  ('Bakery', 'Brown Bread', 'Whole wheat brown bread', 'pack', 1),
  ('Bakery', 'Milk Bread', 'Soft white milk bread', 'pack', 1),
  ('Beverages', 'Orange Juice', 'Tropicana orange juice', 'liters', 1),
  ('Beverages', 'Tea Leaves', 'Premium tea leaves', 'pack', 1),
  ('Snacks', 'Potato Chips', 'Lays potato chips', 'pack', 2),
  ('Cleaning', 'Dish Soap', 'Palmolive dish wash', 'pcs', 1),
  ('Personal Care', 'Bath Soap', 'Dettol bath soap', 'pcs', 2)
) AS i(cat_name, item_name, item_desc, unit, threshold)
ON c.name = i.cat_name
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Master Recipes (sample)
-- ============================================
INSERT INTO master_recipes (name, description, category, cook_time, servings, rating, ingredients, steps) VALUES
  ('Vegetable Biryani', 'Aromatic rice with mixed vegetables', 'Lunch', '45 min', 4, 4.8,
    '["2 cups Basmati Rice","Mixed vegetables","Biryani masala","Yogurt","Onions","Saffron"]'::jsonb,
    '["Soak rice for 30 min","Cook vegetables with spices","Layer rice and vegetables","Steam on low heat for 20 min"]'::jsonb),
  ('Paneer Butter Masala', 'Creamy tomato curry with paneer', 'Dinner', '30 min', 3, 4.9,
    '["200g Paneer","Butter","Tomato puree","Cream","Garam masala","Kasuri methi"]'::jsonb,
    '["Saute tomatoes and spices","Blend into smooth gravy","Add paneer cubes","Simmer and add cream"]'::jsonb),
  ('Masala Dosa', 'Crispy dosa with potato filling', 'Breakfast', '60 min', 4, 4.7,
    '["Rice batter","Potato filling","Dosa masala","Curry leaves"]'::jsonb,
    '["Prepare batter overnight","Cook potato masala filling","Spread batter on pan","Add filling and fold"]'::jsonb),
  ('Mango Lassi', 'Refreshing mango yogurt drink', 'Beverage', '10 min', 2, 4.6,
    '["1 cup Yogurt","Ripe mango","Sugar","Cardamom"]'::jsonb,
    '["Blend yogurt and mango","Add sugar and cardamom","Serve chilled"]'::jsonb),
  ('Aloo Paratha', 'Stuffed flatbread with potato', 'Breakfast', '40 min', 3, 4.9,
    '["Wheat flour","Potato","Spices","Butter"]'::jsonb,
    '["Make potato filling","Roll dough balls","Stuff and roll","Cook with butter"]'::jsonb),
  ('Chicken Curry', 'Traditional Indian chicken curry', 'Dinner', '50 min', 4, 4.8,
    '["500g Chicken","Onions","Tomato","Curry masala","Ginger-garlic paste"]'::jsonb,
    '["Saute onions and spices","Add chicken pieces","Cook with tomato gravy","Simmer until tender"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Master Meal Plan Templates
-- ============================================
INSERT INTO master_meal_plan_templates (name, description, day_of_week, breakfast, lunch, dinner) VALUES
  ('Standard Monday', 'Typical Monday meal plan', 'Mon', 'Aloo Paratha', 'Vegetable Biryani', 'Paneer Butter Masala'),
  ('Standard Tuesday', 'Typical Tuesday meal plan', 'Tue', 'Masala Dosa', 'Rajma Chawal', 'Chicken Curry'),
  ('Standard Wednesday', 'Typical Wednesday meal plan', 'Wed', 'Poha', 'Dal Tadka & Rice', 'Aloo Gobi'),
  ('Standard Thursday', 'Typical Thursday meal plan', 'Thu', 'Idli Sambar', 'Chole Bhature', 'Mixed Veg'),
  ('Standard Friday', 'Typical Friday meal plan', 'Fri', 'Upma', 'Sambar Rice', 'Fish Curry'),
  ('Standard Saturday', 'Typical Saturday meal plan', 'Sat', 'Pancakes', 'Pasta', 'Pizza'),
  ('Standard Sunday', 'Typical Sunday meal plan', 'Sun', 'Chole Kulche', 'Biryani', 'Rajma Rice')
ON CONFLICT DO NOTHING;
