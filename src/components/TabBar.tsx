import { Redirect, Tabs } from 'expo-router';
import { Home, BarChart3, PlusCircle, LayoutGrid, User } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { View, ActivityIndicator, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBar() {
  const { isAuthed, loading } = useApp();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator size="large" color="#1d6fd1" />
      </View>
    );
  }
  if (!isAuthed) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1d6fd1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#f1f5f9', paddingBottom: insets.bottom / 2 + 6, height: 60 + insets.bottom },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} /> }} />
      <Tabs.Screen name="add" options={{ title: 'Add', tabBarIcon: ({ color }) => <PlusCircle size={22} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <LayoutGrid size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
