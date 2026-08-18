/*
# Create Transactional Database Structure for StockSy (Fixed)

## Overview
This migration creates all transactional tables that store user-specific operational data,
linked to the logged-in user and their master configuration.

## New Tables
1. txn_inventory_items - inventory transactions with brand, qty, UoM, rate, total cost, dates
2. txn_milk_daily - daily milk delivery tracking
3. txn_milk_payments - monthly milk payment summaries
4. txn_maid_daily - daily maid attendance tracking
5. txn_maid_payments - monthly maid payment summaries (with year/month columns in definition)
6. txn_recipe_saves - user bookmarked recipes
7. txn_meal_plans - user weekly meal plan entries
8. txn_shopping_list - user shopping list items

All tables auto-generate transaction_code using the user's unique_code_id.
All tables are owner-scoped with RLS policies using auth.uid() = user_id.
*/

-- ============================================
-- Helper function: get user's unique code
-- ============================================
CREATE OR REPLACE FUNCTION get_user_code(p_user_id uuid)
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  SELECT unique_code_id INTO code FROM master_users WHERE id = p_user_id;
  RETURN COALESCE(code, 'UNK');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. txn_inventory_items
-- ============================================
CREATE TABLE IF NOT EXISTS txn_inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  master_item_id uuid REFERENCES master_inventory_items(id) ON DELETE SET NULL,
  category_id uuid REFERENCES master_categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES master_subcategories(id) ON DELETE SET NULL,
  name text NOT NULL,
  brand text DEFAULT '',
  quantity numeric DEFAULT 0,
  uom text DEFAULT 'pcs',
  rate_per_uom numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  location text DEFAULT 'Pantry',
  purchase_date date,
  expiry_date date,
  low_stock_threshold numeric DEFAULT 1,
  expiry_alerts boolean DEFAULT true,
  low_stock_alerts boolean DEFAULT true,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE txn_inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_inventory" ON txn_inventory_items;
CREATE POLICY "select_own_inventory" ON txn_inventory_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_inventory" ON txn_inventory_items;
CREATE POLICY "insert_own_inventory" ON txn_inventory_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_inventory" ON txn_inventory_items;
CREATE POLICY "update_own_inventory" ON txn_inventory_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_inventory" ON txn_inventory_items;
CREATE POLICY "delete_own_inventory" ON txn_inventory_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_inventory_code_and_cost()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'INV-' || get_user_code(NEW.user_id) || '-' || EXTRACT(EPOCH FROM now())::bigint::text;
  END IF;
  NEW.total_cost := NEW.quantity * NEW.rate_per_uom;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_inventory_auto ON txn_inventory_items;
CREATE TRIGGER trg_inventory_auto BEFORE INSERT OR UPDATE ON txn_inventory_items FOR EACH ROW EXECUTE FUNCTION trg_inventory_code_and_cost();

-- ============================================
-- 2. txn_milk_daily
-- ============================================
CREATE TABLE IF NOT EXISTS txn_milk_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id uuid REFERENCES master_milk_config(id) ON DELETE SET NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  date date NOT NULL,
  qty_liters numeric DEFAULT 0,
  present boolean DEFAULT true,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE txn_milk_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_milk_daily" ON txn_milk_daily;
CREATE POLICY "select_own_milk_daily" ON txn_milk_daily FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_milk_daily" ON txn_milk_daily;
CREATE POLICY "insert_own_milk_daily" ON txn_milk_daily FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_milk_daily" ON txn_milk_daily;
CREATE POLICY "update_own_milk_daily" ON txn_milk_daily FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_milk_daily" ON txn_milk_daily;
CREATE POLICY "delete_own_milk_daily" ON txn_milk_daily FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_milk_daily_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'MLK-' || get_user_code(NEW.user_id) || '-' || NEW.date::text;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_milk_daily_auto ON txn_milk_daily;
CREATE TRIGGER trg_milk_daily_auto BEFORE INSERT ON txn_milk_daily FOR EACH ROW EXECUTE FUNCTION trg_milk_daily_code();

-- ============================================
-- 3. txn_milk_payments
-- ============================================
CREATE TABLE IF NOT EXISTS txn_milk_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id uuid REFERENCES master_milk_config(id) ON DELETE SET NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  total_days_received integer DEFAULT 0,
  total_no_days integer DEFAULT 0,
  total_milk_liters numeric DEFAULT 0,
  rate_per_kg numeric DEFAULT 80,
  total_amount numeric DEFAULT 0,
  paid_on date,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE txn_milk_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_milk_payments" ON txn_milk_payments;
CREATE POLICY "select_own_milk_payments" ON txn_milk_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_milk_payments" ON txn_milk_payments;
CREATE POLICY "insert_own_milk_payments" ON txn_milk_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_milk_payments" ON txn_milk_payments;
CREATE POLICY "update_own_milk_payments" ON txn_milk_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_milk_payments" ON txn_milk_payments;
CREATE POLICY "delete_own_milk_payments" ON txn_milk_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_milk_payment_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'MLKP-' || get_user_code(NEW.user_id) || '-' || NEW.year::text || '-' || NEW.month::text;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_milk_payment_auto ON txn_milk_payments;
CREATE TRIGGER trg_milk_payment_auto BEFORE INSERT ON txn_milk_payments FOR EACH ROW EXECUTE FUNCTION trg_milk_payment_code();

-- ============================================
-- 4. txn_maid_daily
-- ============================================
CREATE TABLE IF NOT EXISTS txn_maid_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id uuid REFERENCES master_maid_config(id) ON DELETE SET NULL,
  maid_name text NOT NULL,
  role text DEFAULT '',
  year integer NOT NULL,
  month integer NOT NULL,
  date date NOT NULL,
  present boolean DEFAULT true,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, config_id, date)
);

ALTER TABLE txn_maid_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_maid_daily" ON txn_maid_daily;
CREATE POLICY "select_own_maid_daily" ON txn_maid_daily FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_maid_daily" ON txn_maid_daily;
CREATE POLICY "insert_own_maid_daily" ON txn_maid_daily FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_maid_daily" ON txn_maid_daily;
CREATE POLICY "update_own_maid_daily" ON txn_maid_daily FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_maid_daily" ON txn_maid_daily;
CREATE POLICY "delete_own_maid_daily" ON txn_maid_daily FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_maid_daily_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'MAID-' || get_user_code(NEW.user_id) || '-' || COALESCE(NEW.config_id::text, 'NC') || '-' || NEW.date::text;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_maid_daily_auto ON txn_maid_daily;
CREATE TRIGGER trg_maid_daily_auto BEFORE INSERT ON txn_maid_daily FOR EACH ROW EXECUTE FUNCTION trg_maid_daily_code();

-- ============================================
-- 5. txn_maid_payments (year/month included in definition)
-- ============================================
CREATE TABLE IF NOT EXISTS txn_maid_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id uuid REFERENCES master_maid_config(id) ON DELETE SET NULL,
  maid_name text NOT NULL,
  role text DEFAULT '',
  rate_per_month numeric DEFAULT 0,
  total_present_days integer DEFAULT 0,
  total_absent_days integer DEFAULT 0,
  total_amount numeric DEFAULT 0,
  year integer NOT NULL,
  month integer NOT NULL,
  paid_on date,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, config_id, year, month)
);

ALTER TABLE txn_maid_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_maid_payments" ON txn_maid_payments;
CREATE POLICY "select_own_maid_payments" ON txn_maid_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_maid_payments" ON txn_maid_payments;
CREATE POLICY "insert_own_maid_payments" ON txn_maid_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_maid_payments" ON txn_maid_payments;
CREATE POLICY "update_own_maid_payments" ON txn_maid_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_maid_payments" ON txn_maid_payments;
CREATE POLICY "delete_own_maid_payments" ON txn_maid_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_maid_payment_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'MAIDP-' || get_user_code(NEW.user_id) || '-' || COALESCE(NEW.config_id::text, 'NC') || '-' || NEW.year::text || '-' || NEW.month::text;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_maid_payment_auto ON txn_maid_payments;
CREATE TRIGGER trg_maid_payment_auto BEFORE INSERT ON txn_maid_payments FOR EACH ROW EXECUTE FUNCTION trg_maid_payment_code();

-- ============================================
-- 6. txn_recipe_saves
-- ============================================
CREATE TABLE IF NOT EXISTS txn_recipe_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES master_recipes(id) ON DELETE SET NULL,
  recipe_name text NOT NULL,
  category text DEFAULT '',
  is_saved boolean DEFAULT true,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE txn_recipe_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recipe_saves" ON txn_recipe_saves;
CREATE POLICY "select_own_recipe_saves" ON txn_recipe_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_recipe_saves" ON txn_recipe_saves;
CREATE POLICY "insert_own_recipe_saves" ON txn_recipe_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_recipe_saves" ON txn_recipe_saves;
CREATE POLICY "update_own_recipe_saves" ON txn_recipe_saves FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_recipe_saves" ON txn_recipe_saves;
CREATE POLICY "delete_own_recipe_saves" ON txn_recipe_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_recipe_save_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'RCP-' || get_user_code(NEW.user_id) || '-' || COALESCE(NEW.recipe_id::text, 'MANUAL');
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recipe_save_auto ON txn_recipe_saves;
CREATE TRIGGER trg_recipe_save_auto BEFORE INSERT ON txn_recipe_saves FOR EACH ROW EXECUTE FUNCTION trg_recipe_save_code();

-- ============================================
-- 7. txn_meal_plans
-- ============================================
CREATE TABLE IF NOT EXISTS txn_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  week_offset integer DEFAULT 0,
  day_of_week text NOT NULL,
  breakfast text DEFAULT 'Not planned',
  lunch text DEFAULT 'Not planned',
  dinner text DEFAULT 'Not planned',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_offset, day_of_week)
);

ALTER TABLE txn_meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_meal_plans" ON txn_meal_plans;
CREATE POLICY "select_own_meal_plans" ON txn_meal_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_meal_plans" ON txn_meal_plans;
CREATE POLICY "insert_own_meal_plans" ON txn_meal_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_meal_plans" ON txn_meal_plans;
CREATE POLICY "update_own_meal_plans" ON txn_meal_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_meal_plans" ON txn_meal_plans;
CREATE POLICY "delete_own_meal_plans" ON txn_meal_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_meal_plan_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'MEAL-' || get_user_code(NEW.user_id) || '-' || NEW.week_offset::text || '-' || NEW.day_of_week;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_meal_plan_auto ON txn_meal_plans;
CREATE TRIGGER trg_meal_plan_auto BEFORE INSERT ON txn_meal_plans FOR EACH ROW EXECUTE FUNCTION trg_meal_plan_code();

-- ============================================
-- 8. txn_shopping_list
-- ============================================
CREATE TABLE IF NOT EXISTS txn_shopping_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  qty text DEFAULT '1 pcs',
  checked boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE txn_shopping_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_shopping" ON txn_shopping_list;
CREATE POLICY "select_own_shopping" ON txn_shopping_list FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_shopping" ON txn_shopping_list;
CREATE POLICY "insert_own_shopping" ON txn_shopping_list FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_shopping" ON txn_shopping_list;
CREATE POLICY "update_own_shopping" ON txn_shopping_list FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_shopping" ON txn_shopping_list;
CREATE POLICY "delete_own_shopping" ON txn_shopping_list FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION trg_shopping_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'SHOP-' || get_user_code(NEW.user_id) || '-' || EXTRACT(EPOCH FROM now())::bigint::text;
  END IF;
  NEW.timestamp := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_shopping_auto ON txn_shopping_list;
CREATE TRIGGER trg_shopping_auto BEFORE INSERT ON txn_shopping_list FOR EACH ROW EXECUTE FUNCTION trg_shopping_code();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_txn_inv_user ON txn_inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_inv_code ON txn_inventory_items(transaction_code);
CREATE INDEX IF NOT EXISTS idx_txn_inv_cat ON txn_inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_txn_inv_expiry ON txn_inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_txn_milk_daily_user ON txn_milk_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_milk_daily_ym ON txn_milk_daily(year, month);
CREATE INDEX IF NOT EXISTS idx_txn_milk_daily_date ON txn_milk_daily(date);
CREATE INDEX IF NOT EXISTS idx_txn_milk_pay_user ON txn_milk_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_milk_pay_ym ON txn_milk_payments(year, month);
CREATE INDEX IF NOT EXISTS idx_txn_maid_daily_user ON txn_maid_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_maid_daily_ym ON txn_maid_daily(year, month);
CREATE INDEX IF NOT EXISTS idx_txn_maid_daily_date ON txn_maid_daily(date);
CREATE INDEX IF NOT EXISTS idx_txn_maid_pay_user ON txn_maid_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_maid_pay_ym ON txn_maid_payments(year, month);
CREATE INDEX IF NOT EXISTS idx_txn_recipe_saves_user ON txn_recipe_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_meal_plans_user ON txn_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_meal_plans_week ON txn_meal_plans(week_offset);
CREATE INDEX IF NOT EXISTS idx_txn_shopping_user ON txn_shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_shopping_checked ON txn_shopping_list(checked);
