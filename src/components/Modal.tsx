import { ReactNode } from 'react';
import { Modal as RNModal, View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const SCREEN_H = Dimensions.get('window').height;

export function Modal({ open, onClose, title, children, footer }: Props) {
  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="mt-auto bg-white rounded-t-3xl max-h-[85%]"
          style={{ maxHeight: SCREEN_H * 0.85 }}
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <Pressable onPress={onClose} className="p-1.5 rounded-lg">
              <X size={20} color="#9ca3af" />
            </Pressable>
          </View>
          <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer && <View className="px-5 py-4 border-t border-gray-100">{footer}</View>}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
