import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem, User } from '@/types';

const KEYS = { onboarded: 'stocksy.onboarded', authed: 'stocksy.authed', user: 'stocksy.user', items: 'stocksy.items' } as const;

export const storage = {
  async hasOnboarded(): Promise<boolean> { return (await AsyncStorage.getItem(KEYS.onboarded)) === 'true'; },
  async setOnboarded(): Promise<void> { await AsyncStorage.setItem(KEYS.onboarded, 'true'); },
  async getAuth(): Promise<boolean> { return (await AsyncStorage.getItem(KEYS.authed)) === 'true'; },
  async setAuth(value: boolean): Promise<void> { await AsyncStorage.setItem(KEYS.authed, String(value)); },
  async getUser(): Promise<User | null> { const raw = await AsyncStorage.getItem(KEYS.user); return raw ? JSON.parse(raw) as User : null; },
  async setUser(user: User): Promise<void> { await AsyncStorage.setItem(KEYS.user, JSON.stringify(user)); },
  async getItems(): Promise<InventoryItem[]> { const raw = await AsyncStorage.getItem(KEYS.items); return raw ? JSON.parse(raw) as InventoryItem[] : seedItems(); },
  async setItems(items: InventoryItem[]): Promise<void> { await AsyncStorage.setItem(KEYS.items, JSON.stringify(items)); },
  async clearData(): Promise<void> { await AsyncStorage.multiRemove([KEYS.authed, KEYS.user, KEYS.items]); },
};

function iso(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function seedItems(): InventoryItem[] {
  const entries = [
    ['Garama Masala', 'Rajesh Masala', 'Groceries', 1, 'pcs', 'Kitchen', 10],
    ['Whole Milk', 'DairyPure', 'Dairy', 2, 'liters', 'Fridge', 1],
    ['Brown Bread', 'Bakers Delight', 'Bakery', 1, 'pack', 'Pantry', 0],
    ['Basmati Rice', 'India Gate', 'Groceries', 5, 'kg', 'Pantry', 180],
    ['Tomatoes', 'Fresh Farms', 'Produce', 3, 'kg', 'Fridge', 4],
    ['Orange Juice', 'Tropicana', 'Beverages', 0, 'liters', 'Fridge', 10],
    ['Dish Soap', 'Palmolive', 'Cleaning', 1, 'pcs', 'Kitchen', 0],
    ['Potato Chips', 'Lays', 'Snacks', 4, 'pack', 'Pantry', 60],
  ] as const;
  return entries.map(([name, brand, category, quantity, unit, location, expiry], index) => ({
    id: `seed-${index}`, name, brand, category, quantity, unit, location,
    purchaseDate: iso(-Math.max(1, index)), expiryDate: expiry ? iso(expiry) : '',
    lowStockThreshold: quantity <= 1 ? 1 : 2, expiryAlerts: true, lowStockAlerts: true,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  } as InventoryItem));
}
