import { Stack } from 'expo-router';
import { TrackerProvider } from '@/context/TrackerContext';

export default function TrackerLayout() {
  return (
    <TrackerProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TrackerProvider>
  );
}