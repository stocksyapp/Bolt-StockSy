import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  LayoutGrid, ChevronRight, Activity, ChefHat, CalendarDays, ShoppingCart, Milk, Sparkles,
} from 'lucide-react-native';
import { View, Text, Pressable, ScrollView } from 'react-native';

const sections = [
  { icon: Activity, title: 'Track - Daily Tracker', desc: 'Milk & Maid daily tracking', route: '/more/tracker', color: '#1d6fd1', bg: 'bg-primary-100' },
  { icon: ChefHat, title: 'Recipes', desc: 'Browse and save recipes', route: '/more/recipes', color: '#059669', bg: 'bg-accent-100' },
  { icon: CalendarDays, title: 'Meal Planner', desc: 'Plan breakfast, lunch & dinner', route: '/more/planner', color: '#b45309', bg: 'bg-warning-100' },
  { icon: ShoppingCart, title: 'Shopping List', desc: 'Future shopping integration', route: '/more/shopping', color: '#9333ea', bg: 'bg-purple-100' },
];

export default function MoreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <LayoutGrid size={22} color="#1d6fd1" />
            <Text className="text-xl font-bold text-slate-900">More</Text>
          </View>
          <Text className="text-sm text-slate-500">Explore additional features</Text>
        </View>

        <View className="px-5 pt-5 gap-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Pressable key={s.title} onPress={() => router.push(s.route as any)} className="bg-white rounded-2xl border border-slate-100 p-4 flex-row items-center gap-3 active:opacity-80" style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <View className={`h-12 w-12 rounded-xl items-center justify-center ${s.bg}`}><Icon size={24} color={s.color} /></View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900">{s.title}</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">{s.desc}</Text>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </Pressable>
            );
          })}
        </View>

        <View className="px-5 mt-6">
          <View className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={18} color="#fff" />
              <Text className="text-white font-bold">Coming Soon</Text>
            </View>
            <Text className="text-primary-100 text-sm leading-relaxed">Smart shopping integration with popular grocery apps, AI-powered recipe suggestions based on your inventory, and automated reorder alerts.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
