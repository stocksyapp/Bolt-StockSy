import { Link, Stack } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Page not found</Text>
        <Text className="text-gray-500 text-center mb-6">The screen you're looking for doesn't exist.</Text>
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable className="bg-primary-600 rounded-xl px-6 py-3.5">
            <Text className="text-white font-semibold">Go home</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
