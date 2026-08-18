import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import { InventoryCard } from '@/components/InventoryCard';
import { Modal } from '@/components/Modal';
import { Toggle } from '@/components/Toggle';
import { InventoryItem, Category, CATEGORIES } from '@/types';
import { expiryStatus, isLowStock } from '@/utils/expiry';
import {
  Search, SlidersHorizontal, Plus, Package, AlertTriangle, XCircle, TrendingDown, Inbox,
} from 'lucide-react-native';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';

type SortKey = 'recent' | 'name' | 'expiry' | 'stock';
type FilterExpiry = 'all' | 'fresh' | 'soon' | 'expired';

export default function DashboardScreen() {
  const { items, adjustQuantity, deleteItem, user } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [expiryFilter, setExpiryFilter] = useState<FilterExpiry>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const stats = useMemo(() => {
    let expired = 0, soon = 0, low = 0;
    for (const it of items) {
      const s = expiryStatus(it);
      if (s === 'expired') expired++;
      if (s === 'soon') soon++;
      if (isLowStock(it)) low++;
    }
    return { total: items.length, expired, soon, low };
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((it) => {
      if (query) {
        const q = query.toLowerCase();
        if (!it.name.toLowerCase().includes(q) && !it.brand.toLowerCase().includes(q)) return false;
      }
      if (category !== 'all' && it.category !== category) return false;
      if (expiryFilter !== 'all' && expiryStatus(it) !== expiryFilter) return false;
      if (lowStockOnly && !isLowStock(it)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'expiry': {
          const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return da - db;
        }
        case 'stock': return a.quantity - b.quantity;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [items, query, category, expiryFilter, lowStockOnly, sort]);

  const hasActiveFilters = category !== 'all' || expiryFilter !== 'all' || lowStockOnly;
  function clearFilters() { setCategory('all'); setExpiryFilter('all'); setLowStockOnly(false); }
  const expiryOptions: { key: FilterExpiry; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'fresh', label: 'Fresh' },
    { key: 'soon', label: 'Expiring Soon' }, { key: 'expired', label: 'Expired' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-sm text-slate-500">Welcome back</Text>
              <Text className="text-xl font-bold text-slate-900">{user.name}</Text>
            </View>
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: user.avatarColor }}>
              <Text className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 mb-3">
            <Search size={18} color="#94a3b8" />
            <TextInput className="flex-1 px-2.5 py-3.5 text-base text-slate-900" placeholder="Search items, brands…" placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery} />
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => setShowFilters(true)} className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl ${hasActiveFilters ? 'bg-primary-100' : 'bg-slate-100'}`}>
              <SlidersHorizontal size={15} color={hasActiveFilters ? '#1d6fd1' : '#475569'} />
              <Text className={`text-sm font-medium ${hasActiveFilters ? 'text-primary-700' : 'text-slate-600'}`}>Filters</Text>
            </Pressable>
            {hasActiveFilters && (
              <Pressable onPress={clearFilters}><Text className="text-sm text-slate-400 font-medium px-2">Clear</Text></Pressable>
            )}
          </View>
        </View>

        <View className="px-5 mt-4 flex-row flex-wrap gap-3">
          <StatCard icon={Package} label="Total Items" value={stats.total} bg="bg-primary-100" color="#1d6fd1" />
          <StatCard icon={AlertTriangle} label="Expiring Soon" value={stats.soon} bg="bg-warning-100" color="#b45309" />
          <StatCard icon={XCircle} label="Expired" value={stats.expired} bg="bg-danger-100" color="#b91c1c" />
          <StatCard icon={TrendingDown} label="Low Stock" value={stats.low} bg="bg-warning-100" color="#d97706" />
        </View>

        <View className="px-5 mt-6 mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">Your Inventory</Text>
          <Text className="text-xs text-slate-400">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</Text>
        </View>

        {filtered.length === 0 ? (
          <View className="items-center py-16 px-5">
            <View className="h-16 w-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
              <Inbox size={32} color="#cbd5e1" />
            </View>
            <Text className="font-semibold text-slate-700 mb-1">{items.length === 0 ? 'No items yet' : 'No matches found'}</Text>
            <Text className="text-sm text-slate-400 mb-5 text-center">{items.length === 0 ? 'Add your first inventory item to get started.' : 'Try adjusting your search or filters.'}</Text>
            {items.length === 0 && (
              <Pressable onPress={() => router.push('/(tabs)/add')} className="bg-primary-600 rounded-xl px-5 py-3.5 flex-row items-center gap-2 active:opacity-80">
                <Plus size={18} color="#fff" />
                <Text className="text-white font-semibold">Add Item</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="px-5 gap-3">
            {filtered.map((item) => (
              <InventoryCard key={item.id} item={item} onAdjust={adjustQuantity} onEdit={(it) => router.push({ pathname: '/(tabs)/add', params: { editId: it.id } })} onDelete={(it) => setDeleteTarget(it)} />
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/(tabs)/add')} className="absolute bottom-6 right-5 h-14 w-14 rounded-full bg-primary-600 items-center justify-center active:opacity-80" style={{ shadowColor: '#1d6fd1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}>
        <Plus size={26} color="#fff" />
      </Pressable>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Item" footer={
        <View className="flex-row gap-3">
          <Pressable onPress={() => setDeleteTarget(null)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 items-center"><Text className="font-semibold text-slate-700">Cancel</Text></Pressable>
          <Pressable onPress={() => { if (deleteTarget) deleteItem(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 bg-danger-500 rounded-xl py-3.5 items-center active:opacity-80"><Text className="font-semibold text-white">Delete</Text></Pressable>
        </View>
      }>
        <Text className="text-slate-600">Are you sure you want to remove <Text className="font-semibold text-slate-900">{deleteTarget?.name}</Text> from your inventory? This cannot be undone.</Text>
      </Modal>

      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filter & Sort" footer={
        <View className="flex-row gap-3">
          <Pressable onPress={clearFilters} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 items-center"><Text className="font-semibold text-slate-700">Reset</Text></Pressable>
          <Pressable onPress={() => setShowFilters(false)} className="flex-1 bg-primary-600 rounded-xl py-3.5 items-center active:opacity-80"><Text className="font-semibold text-white">Show {filtered.length}</Text></Pressable>
        </View>
      }>
        <View className="gap-6">
          <View>
            <Text className="text-sm font-semibold text-slate-900 mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['all', ...CATEGORIES] as (Category | 'all')[]).map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)} className={`px-3 py-1.5 rounded-full ${category === c ? 'bg-primary-600' : 'bg-slate-100'}`}>
                  <Text className={`text-sm font-medium ${category === c ? 'text-white' : 'text-slate-600'}`}>{c === 'all' ? 'All' : c}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900 mb-2">Expiry Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {expiryOptions.map((o) => (
                <Pressable key={o.key} onPress={() => setExpiryFilter(o.key)} className={`px-3 py-1.5 rounded-full ${expiryFilter === o.key ? 'bg-primary-600' : 'bg-slate-100'}`}>
                  <Text className={`text-sm font-medium ${expiryFilter === o.key ? 'text-white' : 'text-slate-600'}`}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900 mb-2">Sort By</Text>
            <View className="flex-row flex-wrap gap-2">
              {([{ k: 'recent', l: 'Recent' }, { k: 'name', l: 'Name A–Z' }, { k: 'expiry', l: 'Expiry Date' }, { k: 'stock', l: 'Stock: Low to High' }] as { k: SortKey; l: string }[]).map((o) => (
                <Pressable key={o.k} onPress={() => setSort(o.k)} className={`px-3 py-1.5 rounded-full ${sort === o.k ? 'bg-primary-600' : 'bg-slate-100'}`}>
                  <Text className={`text-sm font-medium ${sort === o.k ? 'text-white' : 'text-slate-600'}`}>{o.l}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable onPress={() => setLowStockOnly(!lowStockOnly)} className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border ${lowStockOnly ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white'}`}>
            <Text className="font-medium text-slate-900">Low stock only</Text>
            <Toggle checked={lowStockOnly} onChange={setLowStockOnly} />
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ icon: Icon, label, value, bg, color }: { icon: typeof Package; label: string; value: number; bg: string; color: string }) {
  return (
    <View className="flex-row items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100" style={{ width: '48%', flex: 1, shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
      <View className={`h-10 w-10 rounded-xl items-center justify-center ${bg}`}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text className="text-xl font-bold text-slate-900">{value}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">{label}</Text>
      </View>
    </View>
  );
}
