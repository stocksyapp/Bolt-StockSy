import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const readyEvent = new Event('expo:ready');
      window.dispatchEvent(readyEvent);
    }
  }, []);
}