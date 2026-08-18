import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Milk, UserCheck, ChevronRight } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView } from 'react-native';

export default function TrackerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.push('/(tabs)/more')}
          className="p-1.5"
        >
          <ArrowLeft size={22} color="#475569" />
        </Pressable>

        <Text className="text-lg font-bold text-slate-900">
          Daily Tracker
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 40,
          padding: 20,
          gap: 16,
        }}
      >
        <Pressable
          onPress={() => router.push('/more/tracker/milk')}
          className="bg-white rounded-2xl border border-slate-100 p-5 flex-row items-center gap-4 active:opacity-80"
          style={{
            shadowColor: '#1d6fd1',
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}
        >
          <View className="h-14 w-14 rounded-2xl bg-primary-100 items-center justify-center">
            <Milk size={28} color="#1d6fd1" />
          </View>

          <View className="flex-1">
            <Text className="font-bold text-slate-900 text-base">
              Daily Milk Tracker
            </Text>
            <Text className="text-sm text-slate-400 mt-0.5">
              Track milk delivery, quantity & payment
            </Text>
          </View>

          <ChevronRight size={22} color="#cbd5e1" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/more/tracker/maid')}
          className="bg-white rounded-2xl border border-slate-100 p-5 flex-row items-center gap-4 active:opacity-80"
          style={{
            shadowColor: '#1d6fd1',
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}
        >
          <View className="h-14 w-14 rounded-2xl bg-accent-100 items-center justify-center">
            <UserCheck size={28} color="#059669" />
          </View>

          <View className="flex-1">
            <Text className="font-bold text-slate-900 text-base">
              Daily Maid Tracker
            </Text>
            <Text className="text-sm text-slate-400 mt-0.5">
              Track maid attendance & monthly payment
            </Text>
          </View>

          <ChevronRight size={22} color="#cbd5e1" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}