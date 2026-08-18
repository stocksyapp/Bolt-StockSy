import '../global.css';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '@/context/AppContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

function AuthGate() {
  const { isAuthed, loading } = useApp();
  const router = useRouter();
  const navState = useRootNavigationState();

  useFrameworkReady();

  useEffect(() => {
    if (!navState?.key) return;
    if (loading) return;
    if (isAuthed) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthed, loading, navState?.key]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </AppProvider>
  );
}
