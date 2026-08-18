export type Unit = 'kg' | 'pcs' | 'liters' | 'g' | 'ml' | 'pack';

export type Category =
  | 'Groceries' | 'Dairy' | 'Produce' | 'Bakery' | 'Beverages' | 'Snacks'
  | 'Cleaning' | 'Personal Care' | 'Medicine' | 'Other';

export type Location = 'Kitchen' | 'Pantry' | 'Fridge' | 'Freezer' | 'Bathroom' | 'Garage' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: Category;
  quantity: number;
  unit: Unit;
  location: Location;
  purchaseDate: string;
  expiryDate: string;
  lowStockThreshold: number;
  expiryAlerts: boolean;
  lowStockAlerts: boolean;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  mobile: string;
  avatarColor: string;
  householdSize: number;
  notificationsEnabled: boolean;
  expiryAlerts: boolean;
  lowStockAlerts: boolean;
}

export type ExpiryStatus = 'fresh' | 'soon' | 'expired' | 'none';

export const CATEGORIES: Category[] = ['Groceries', 'Dairy', 'Produce', 'Bakery', 'Beverages', 'Snacks', 'Cleaning', 'Personal Care', 'Medicine', 'Other'];
export const UNITS: Unit[] = ['kg', 'pcs', 'liters', 'g', 'ml', 'pack'];
export const LOCATIONS: Location[] = ['Kitchen', 'Pantry', 'Fridge', 'Freezer', 'Bathroom', 'Garage', 'Other'];
