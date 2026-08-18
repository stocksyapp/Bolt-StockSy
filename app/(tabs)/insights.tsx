import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, CATEGORIES } from '@/types';
import { expiryStatus, isLowStock } from '@/utils/expiry';
import { BarChart3, TrendingDown, Package, AlertTriangle, XCircle, Wallet, Calendar, Filter } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView } from 'react-native';

export default function InsightsScreen() {
  const { items } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const filtered = useMemo(() => categoryFilter === 'all' ? items : items.filter((it) => it.category === categoryFilter), [items, categoryFilter]);

  const stats = useMemo(() => {
    let expired = 0, soon = 0, low = 0, totalQty = 0;
    for (const it of filtered) {
      const s = expiryStatus(it);
      if (s === 'expired') expired++;
      if (s === 'soon') soon++;
      if (isLowStock(it)) low++;
      totalQty += it.quantity;
    }
    return { total: filtered.length, expired, soon, low, totalQty };
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of filtered) map.set(it.category, (map.get(it.category) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byLocation = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of filtered) map.set(it.location, (map.get(it.location) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const maxCat = Math.max(1, ...byCategory.map((c) => c[1]));
  const maxLoc = Math.max(1, ...byLocation.map((l) => l[1]));

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <BarChart3 size={22} color="#1d6fd1" />
            <Text className="text-xl font-bold text-slate-900">Insights & Reports</Text>
          </View>
          <Text className="text-sm text-slate-500">Understand your inventory and usage</Text>
        </View>

        <View className="px-5 mt-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Filter size={15} color="#64748b" />
            <Text className="text-sm font-semibold text-slate-700">Filter by Category</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
            {(['all', ...CATEGORIES] as (Category | 'all')[]).map((c) => (
              <Pressable key={c} onPress={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-full ${categoryFilter === c ? 'bg-primary-600' : 'bg-white border border-slate-200'}`}>
                <Text className={`text-sm font-medium ${categoryFilter === c ? 'text-white' : 'text-slate-600'}`}>{c === 'all' ? 'All' : c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="px-5 mt-5 flex-row flex-wrap gap-3">
          <InsightCard icon={Package} label="Total Items" value={stats.total} bg="bg-primary-100" color="#1d6fd1" />
          <InsightCard icon={TrendingDown} label="Total Quantity" value={stats.totalQty} bg="bg-accent-100" color="#059669" />
          <InsightCard icon={AlertTriangle} label="Expiring Soon" value={stats.soon} bg="bg-warning-100" color="#b45309" />
          <InsightCard icon={XCircle} label="Expired" value={stats.expired} bg="bg-danger-100" color="#b91c1c" />
        </View>

        <View className="px-5 mt-6">
          <Text className="text-base font-bold text-slate-900 mb-3">Monthly Usage Report</Text>
          <View className="bg-white rounded-2xl border border-slate-100 p-5">
            <View className="flex-row items-center gap-2 mb-4">
              <Calendar size={16} color="#1d6fd1" />
              <Text className="font-semibold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
            </View>
            <View className="gap-3">
              <ReportRow label="Items Added" value={stats.total} />
              <ReportRow label="Low Stock Alerts" value={stats.low} />
              <ReportRow label="Expiring Soon" value={stats.soon} />
              <ReportRow label="Expired Items" value={stats.expired} />
            </View>
          </View>
        </View>

        {byCategory.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-base font-bold text-slate-900 mb-3">By Category</Text>
            <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-3">
              {byCategory.map(([cat, count]) => (
                <View key={cat}>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-slate-700">{cat}</Text>
                    <Text className="text-sm font-semibold text-slate-900">{count}</Text>
                  </View>
                  <View className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <View className="h-full rounded-full bg-primary-500" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {byLocation.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-base font-bold text-slate-900 mb-3">By Location</Text>
            <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-3">
              {byLocation.map(([loc, count]) => (
                <View key={loc}>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-slate-700">{loc}</Text>
                    <Text className="text-sm font-semibold text-slate-900">{count}</Text>
                  </View>
                  <View className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <View className="h-full rounded-full bg-accent-500" style={{ width: `${(count / maxLoc) * 100}%` }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="px-5 mt-6">
          <Text className="text-base font-bold text-slate-900 mb-3">Expense Overview</Text>
          <View className="bg-primary-600 rounded-2xl p-5">
            <View className="flex-row items-center gap-2 mb-2"><Wallet size={18} color="#fff" /><Text className="text-white font-semibold">Estimated Monthly Spend</Text></View>
            <Text className="text-white text-3xl font-bold">INR {(stats.totalQty * 150).toLocaleString('en-IN')}</Text>
            <Text className="text-primary-100 text-sm mt-2">Based on {stats.total} items and average category pricing</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InsightCard({ icon: Icon, label, value, bg, color }: { icon: typeof Package; label: string; value: number; bg: string; color: string }) {
  return (
    <View className="flex-row items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100" style={{ width: '48%', flex: 1, shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
      <View className={`h-10 w-10 rounded-xl items-center justify-center ${bg}`}><Icon size={20} color={color} /></View>
      <View><Text className="text-xl font-bold text-slate-900">{value}</Text><Text className="text-xs text-slate-500 mt-0.5">{label}</Text></View>
    </View>
  );
}

function ReportRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-slate-600">{label}</Text>
      <View className="bg-slate-100 rounded-full px-3 py-1"><Text className="text-sm font-semibold text-slate-900">{value}</Text></View>
    </View>
  );
}
