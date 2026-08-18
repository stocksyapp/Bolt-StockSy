import { InventoryItem } from '@/types';
import { expiryLabel, expiryStatus, formatDate, isLowStock } from '@/utils/expiry';
import { ExpiryBadge } from './ExpiryBadge';
import { Minus, Plus, MapPin, Tag, Trash2 } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';

interface Props {
  item: InventoryItem;
  onAdjust: (id: string, delta: number) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onAdjust, onEdit, onDelete }: Props) {
  const status = expiryStatus(item);
  const low = isLowStock(item);

  return (
    <Pressable onPress={() => onEdit(item)} className="bg-white rounded-2xl border border-slate-100 p-4 active:opacity-80" style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-slate-900" numberOfLines={1}>{item.name}</Text>
            {low && (
              <View className="rounded-full bg-warning-100 px-2 py-0.5">
                <Text style={{ fontSize: 10 }} className="font-medium text-warning-700">Low Stock</Text>
              </View>
            )}
          </View>
          {!!item.brand && <Text className="text-sm text-slate-500" numberOfLines={1}>{item.brand}</Text>}
        </View>
        <ExpiryBadge status={status} size="sm" />
      </View>

      <View className="flex-row items-center gap-3 mt-3">
        <View className="flex-row items-center gap-1">
          <Tag size={12} color="#94a3b8" />
          <Text style={{ fontSize: 12 }} className="text-slate-500">{item.category}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MapPin size={12} color="#94a3b8" />
          <Text style={{ fontSize: 12 }} className="text-slate-500">{item.location}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Pressable onPress={(e) => { e.stopPropagation?.(); onAdjust(item.id, -1); }} className="p-1.5 rounded-lg bg-slate-100 active:opacity-70">
          <Minus size={16} color="#475569" />
        </Pressable>
        <Text className="font-bold text-slate-900 flex-1 text-center">
          {item.quantity} <Text style={{ fontSize: 12 }} className="text-slate-500 font-normal">{item.unit}</Text>
        </Text>
        <Pressable onPress={(e) => { e.stopPropagation?.(); onAdjust(item.id, 1); }} className="p-1.5 rounded-lg bg-slate-100 active:opacity-70">
          <Plus size={16} color="#475569" />
        </Pressable>
        <View className="flex-row items-center gap-2 ml-3">
          {!!item.expiryDate && <Text style={{ fontSize: 12 }} className="text-slate-400">{formatDate(item.expiryDate)}</Text>}
          <Text style={{ fontSize: 12 }} className="font-medium text-slate-500">{expiryLabel(item)}</Text>
          <Pressable onPress={(e) => { e.stopPropagation?.(); onDelete(item); }} className="p-1.5 rounded-lg active:opacity-70">
            <Trash2 size={16} color="#cbd5e1" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
