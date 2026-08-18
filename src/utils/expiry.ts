import { ExpiryStatus, InventoryItem } from '@/types';

const SOON_DAYS = 3;

export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / 86400000);
}

export function expiryStatus(item: InventoryItem): ExpiryStatus {
  if (!item.expiryDate) return 'none';
  const d = daysUntil(item.expiryDate);
  if (d === null) return 'none';
  if (d < 0) return 'expired';
  if (d <= SOON_DAYS) return 'soon';
  return 'fresh';
}

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.lowStockThreshold;
}

export function expiryLabel(item: InventoryItem): string {
  const status = expiryStatus(item);
  const d = daysUntil(item.expiryDate);
  if (status === 'none' || d === null) return 'No expiry';
  if (status === 'expired') return `Expired ${Math.abs(d)}d ago`;
  if (status === 'soon') return `Expires in ${d}d`;
  return `Fresh · ${d}d left`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
