/*
# Create StockSy inventory database schema

## Overview
Sets up the database for the StockSy home inventory management app.
This is a multi-user app where each user owns their inventory items and profile data.

## New Tables

### 1. profiles
Stores user profile information linked to Supabase Auth.
- id (uuid, primary key, references auth.users)
- name (text, display name)
- email (text, email address)
- mobile (text, phone number)
- avatar_color (text, hex color for avatar)
- household_size (integer, number of people in household)
- notifications_enabled (boolean, master notification toggle)
- expiry_alerts (boolean, alert when items are expiring)
- low_stock_alerts (boolean, alert when items are running low)
- created_at (timestamptz)
- updated_at (timestamptz)

### 2. inventory_items
Stores individual inventory items belonging to a user.
- id (uuid, primary key)
- user_id (uuid, references auth.users, owner of the item)
- name (text, item name)
- brand (text, brand name)
- category (text, one of: Groceries, Dairy, Produce, Bakery, Beverages, Snacks, Cleaning, Personal Care, Medicine, Other)
- quantity (numeric, current stock amount)
- unit (text, one of: kg, pcs, liters, g, ml, pack)
- location (text, one of: Kitchen, Pantry, Fridge, Freezer, Bathroom, Garage, Other)
- purchase_date (date, when the item was purchased)
- expiry_date (date, when the item expires, nullable for non-perishables)
- low_stock_threshold (numeric, quantity below which low-stock alert triggers)
- expiry_alerts (boolean, whether to send expiry alerts for this item)
- low_stock_alerts (boolean, whether to send low-stock alerts for this item)
- created_at (timestamptz)
- updated_at (timestamptz)

## Security
- RLS enabled on both tables.
- profiles: users can only CRUD their own profile row (id = auth.uid()).
- inventory_items: users can only CRUD items they own (user_id = auth.uid()).
- user_id on inventory_items defaults to auth.uid() so inserts omitting it still work.

## Indexes
- inventory_items.user_id for fast per-user queries.
- inventory_items.expiry_date for expiring-soon queries.
- inventory_items.category for category filtering.
*/

-- ===== Profiles table =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  mobile text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#16a34a',
  household_size integer NOT NULL DEFAULT 1,
  notifications_enabled boolean NOT NULL DEFAULT true,
  expiry_alerts boolean NOT NULL DEFAULT true,
  low_stock_alerts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ===== Inventory items table =====
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Other',
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  location text NOT NULL DEFAULT 'Other',
  purchase_date date,
  expiry_date date,
  low_stock_threshold numeric NOT NULL DEFAULT 1,
  expiry_alerts boolean NOT NULL DEFAULT true,
  low_stock_alerts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_items" ON inventory_items;
CREATE POLICY "select_own_items" ON inventory_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_items" ON inventory_items;
CREATE POLICY "insert_own_items" ON inventory_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_items" ON inventory_items;
CREATE POLICY "update_own_items" ON inventory_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_items" ON inventory_items;
CREATE POLICY "delete_own_items" ON inventory_items
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- ===== Auto-update updated_at trigger =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER trg_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===== Auto-create profile on signup =====
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();