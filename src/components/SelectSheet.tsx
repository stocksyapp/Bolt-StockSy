import { Modal } from 'react-native';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';

interface Props {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
}

export function SelectSheet({ label, value, options, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5"
      >
        <Text className="text-base text-gray-900">{value}</Text>
        <ChevronDown size={18} color="#9ca3af" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mt-auto bg-white rounded-t-3xl max-h-[60%]"
          >
            <View className="px-5 py-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">{label}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="px-2 py-2">
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  className="flex-row items-center justify-between px-4 py-3.5 rounded-xl"
                >
                  <Text className={`text-base ${opt === value ? 'font-semibold text-primary-600' : 'text-gray-700'}`}>{opt}</Text>
                  {opt === value && <Check size={20} color="#16a34a" />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
