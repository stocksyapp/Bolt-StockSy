import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Plus, Sun, Coffee, Moon } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Modal } from '@/components/Modal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#f59e0b', bg: 'bg-warning-100' },
  { key: 'lunch', label: 'Lunch', icon: Sun, color: '#1d6fd1', bg: 'bg-primary-100' },
  { key: 'dinner', label: 'Dinner', icon: Moon, color: '#7c3aed', bg: 'bg-purple-100' },
] as const;

interface MealPlan {
  [day: string]: { breakfast: string; lunch: string; dinner: string };
}

const SAMPLE_PLAN: MealPlan = {
  Mon: { breakfast: 'Aloo Paratha', lunch: 'Vegetable Biryani', dinner: 'Paneer Butter Masala' },
  Tue: { breakfast: 'Masala Dosa', lunch: 'Rajma Chawal', dinner: 'Chicken Curry' },
  Wed: { breakfast: 'Poha', lunch: 'Dal Tadka & Rice', dinner: 'Aloo Gobi' },
  Thu: { breakfast: 'Idli Sambar', lunch: 'Chole Bhature', dinner: 'Mixed Veg' },
  Fri: { breakfast: 'Upma', lunch: 'Sambar Rice', dinner: 'Fish Curry' },
  Sat: { breakfast: 'Pancakes', lunch: 'Pasta', dinner: 'Pizza' },
  Sun: { breakfast: 'Chole Kulche', lunch: 'Biryani', dinner: 'Rajma Rice' },
};

export default function PlannerScreen() {
  const [plan, setPlan] = useState<MealPlan>(SAMPLE_PLAN);
  const [editing, setEditing] = useState<{ day: string; meal: string } | null>(null);
  const [mealValue, setMealValue] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  function saveMeal() {
    if (!editing) return;
    setPlan((prev) => ({ ...prev, [editing.day]: { ...prev[editing.day], [editing.meal]: mealValue || 'Not planned' } }));
    setEditing(null);
    setMealValue('');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.push('/(tabs)/more')} className="p-1.5"><ArrowLeft size={22} color="#475569" /></Pressable>
        <View className="flex-1"><Text className="text-lg font-bold text-slate-900">Meal Planner</Text><Text className="text-xs text-slate-400">Plan your week</Text></View>
        <CalendarDays size={22} color="#b45309" />
      </View>

      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
        <Pressable onPress={() => setWeekOffset(weekOffset - 1)} className="p-1.5"><ChevronLeft size={20} color="#475569" /></Pressable>
        <Text className="font-bold text-slate-900">{weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} Week${weekOffset > 1 ? 's' : ''}` : `${Math.abs(weekOffset)} Week${weekOffset < -1 ? 's' : ''} Ago`}</Text>
        <Pressable onPress={() => setWeekOffset(weekOffset + 1)} className="p-1.5"><ChevronRight size={20} color="#475569" /></Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, padding: 20, gap: 12 }}>
        {DAYS.map((day) => (
          <View key={day} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
            <View className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
              <Text className="font-bold text-slate-900">{day}</Text>
            </View>
            <View className="p-3 gap-2">
              {MEALS.map((meal) => {
                const Icon = meal.icon;
                const value = (plan[day] as Record<string, string> | undefined)?.[meal.key] ?? 'Not planned';
                return (
                  <Pressable key={meal.key} onPress={() => { setEditing({ day, meal: meal.key }); setMealValue(value === 'Not planned' ? '' : value); }} className="flex-row items-center gap-3 px-2 py-2.5 rounded-xl active:bg-slate-50">
                    <View className={`h-9 w-9 rounded-xl items-center justify-center ${meal.bg}`}><Icon size={18} color={meal.color} /></View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-400 font-medium">{meal.label}</Text>
                      <Text className="text-sm font-medium text-slate-900">{value}</Text>
                    </View>
                    <Plus size={16} color="#cbd5e1" />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.meal ?? ''} - ${editing?.day ?? ''}`} footer={
        <View className="flex-row gap-3">
          <Pressable onPress={() => setEditing(null)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 items-center"><Text className="font-semibold text-slate-700">Cancel</Text></Pressable>
          <Pressable onPress={saveMeal} className="flex-1 bg-primary-600 rounded-xl py-3.5 items-center active:opacity-80"><Text className="font-semibold text-white">Save</Text></Pressable>
        </View>
      }>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Meal Name</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={mealValue} onChangeText={setMealValue} placeholder="e.g. Aloo Paratha" placeholderTextColor="#94a3b8" /></View>
      </Modal>
    </SafeAreaView>
  );
}

