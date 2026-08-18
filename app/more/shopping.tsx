import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, ShoppingCart, Plus, Check, Trash2, ShoppingBag, Link2 } from 'lucide-react-native';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';

interface ShoppingItem { id: string; name: string; qty: string; checked: boolean; }

const SAMPLE_ITEMS: ShoppingItem[] = [
  { id: '1', name: 'Basmati Rice', qty: '5 kg', checked: false },
  { id: '2', name: 'Whole Milk', qty: '2 liters', checked: true },
  { id: '3', name: 'Tomatoes', qty: '3 kg', checked: false },
  { id: '4', name: 'Brown Bread', qty: '1 pack', checked: false },
];

const LINKED_APPS = [
  { name: 'BigBasket', color: '#1d6fd1' },
  { name: 'Amazon Fresh', color: '#059669' },
  { name: 'Blinkit', color: '#f59e0b' },
  { name: 'Zepto', color: '#7c3aed' },
];

export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>(SAMPLE_ITEMS);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');

  function addItem() {
    if (!newName.trim()) return;
    setItems((prev) => [{ id: `shop-${Date.now()}`, name: newName.trim(), qty: newQty.trim() || '1 pcs', checked: false }, ...prev]);
    setNewName(''); setNewQty('');
  }
  function toggleItem(id: string) { setItems((prev) => prev.map((it) => it.id === id ? { ...it, checked: !it.checked } : it)); }
  function removeItem(id: string) { setItems((prev) => prev.filter((it) => it.id !== id)); }

  const remaining = items.filter((it) => !it.checked).length;
  const completed = items.filter((it) => it.checked).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.push('/(tabs)/more')} className="p-1.5"><ArrowLeft size={22} color="#475569" /></Pressable>
        <View className="flex-1"><Text className="text-lg font-bold text-slate-900">Shopping List</Text><Text className="text-xs text-slate-400">{remaining} items to buy</Text></View>
        <ShoppingCart size={22} color="#9333ea" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, padding: 20, gap: 16 }}>
        <View className="bg-white rounded-2xl border border-slate-100 p-4 gap-3">
          <Text className="font-bold text-slate-400 text-xs uppercase tracking-wide">Add Item</Text>
          <View className="flex-row gap-2">
            <TextInput className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900" placeholder="Item name" placeholderTextColor="#94a3b8" value={newName} onChangeText={setNewName} />
            <TextInput className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900" placeholder="Qty" placeholderTextColor="#94a3b8" value={newQty} onChangeText={setNewQty} />
          </View>
          <Pressable onPress={addItem} className="bg-primary-600 rounded-xl py-3.5 flex-row items-center justify-center gap-2 active:opacity-80">
            <Plus size={18} color="#fff" /><Text className="text-white font-semibold">Add to List</Text>
          </Pressable>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-white rounded-xl border border-slate-100 p-3 items-center"><Text className="text-2xl font-bold text-primary-600">{remaining}</Text><Text className="text-xs text-slate-400">Remaining</Text></View>
          <View className="flex-1 bg-white rounded-xl border border-slate-100 p-3 items-center"><Text className="text-2xl font-bold text-accent-600">{completed}</Text><Text className="text-xs text-slate-400">Completed</Text></View>
        </View>

        <View className="gap-2">
          {items.map((item) => (
            <View key={item.id} className={`bg-white rounded-xl border p-4 flex-row items-center gap-3 ${item.checked ? 'border-accent-200' : 'border-slate-100'}`} style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
              <Pressable onPress={() => toggleItem(item.id)} className={`h-6 w-6 rounded-full border-2 items-center justify-center ${item.checked ? 'bg-accent-500 border-accent-500' : 'border-slate-300'}`}>
                {item.checked && <Check size={14} color="#fff" />}
              </Pressable>
              <View className="flex-1">
                <Text className={`font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</Text>
                <Text className="text-xs text-slate-400">{item.qty}</Text>
              </View>
              <Pressable onPress={() => removeItem(item.id)} className="p-1.5"><Trash2 size={16} color="#cbd5e1" /></Pressable>
            </View>
          ))}
        </View>

        <View className="mt-4">
          <View className="flex-row items-center gap-2 mb-3"><Link2 size={16} color="#9333ea" /><Text className="font-bold text-slate-900">Linked Shopping Apps</Text></View>
          <View className="flex-row flex-wrap gap-2">
            {LINKED_APPS.map((app) => (
              <Pressable key={app.name} className="flex-row items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 active:opacity-80">
                <ShoppingBag size={16} color={app.color} /><Text className="text-sm font-medium text-slate-700">{app.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="text-xs text-slate-400 mt-3">Future integration - link your favorite grocery apps for seamless ordering</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
