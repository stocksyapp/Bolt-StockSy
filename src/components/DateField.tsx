import { useMemo, useState, useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

interface Props {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function parseDate(s: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  return { y: Number(parts[0]), m: Number(parts[1]) - 1, d: Number(parts[2]) };
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export function DateField({ label, value, onChange, placeholder = 'Select date' }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseDate(value);
  const [year, setYear] = useState(parsed?.y ?? new Date().getFullYear());
  const [month, setMonth] = useState(parsed?.m ?? new Date().getMonth());
  const [day, setDay] = useState(parsed?.d ?? 1);

  useEffect(() => {
    if (open) {
      const p = parseDate(value);
      if (p) { setYear(p.y); setMonth(p.m); setDay(p.d); }
    }
  }, [open, value]);

  const years = useMemo(() => {
    const arr: number[] = [];
    const now = new Date().getFullYear();
    for (let y = now - 5; y <= now + 10; y++) arr.push(y);
    return arr;
  }, []);
  const days = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month]);

  function confirm() {
    onChange(`${year}-${pad(month + 1)}-${pad(Math.min(day, days.length))}`);
    setOpen(false);
  }

  function clear() {
    onChange('');
    setOpen(false);
  }

  const display = parsed ? `${MONTHS[parsed.m]} ${parsed.d}, ${parsed.y}` : placeholder;

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5"
      >
        <Text className={`text-base ${parsed ? 'text-gray-900' : 'text-gray-400'}`}>{display}</Text>
        <ChevronDown size={18} color="#9ca3af" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} className="mt-auto bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Pressable onPress={clear}><Text className="text-sm font-medium text-gray-500">Clear</Text></Pressable>
              <Text className="text-lg font-bold text-gray-900">{label}</Text>
              <Pressable onPress={confirm}><Text className="text-sm font-semibold text-primary-600">Done</Text></Pressable>
            </View>
            <View className="flex-row px-4 py-4" style={{ height: 220 }}>
              <ScrollColumn items={MONTHS} index={month} onIndex={setMonth} />
              <ScrollColumn items={days.map(String)} index={day - 1} onIndex={(i) => setDay(i + 1)} />
              <ScrollColumn items={years.map(String)} index={Math.max(0, years.indexOf(year))} onIndex={(i) => setYear(years[i])} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ScrollColumn({ items, index, onIndex }: { items: string[]; index: number; onIndex: (i: number) => void }) {
  const ref = useRef<ScrollView>(null);
  const ITEM_H = 40;

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ y: index * ITEM_H, animated: false });
    }
  }, [index]);

  return (
    <ScrollView
      ref={ref}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      onMomentumScrollEnd={(e) => {
        const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
        onIndex(Math.max(0, Math.min(items.length - 1, i)));
      }}
      contentContainerStyle={{ paddingVertical: ITEM_H * 3 }}
    >
      {items.map((item, i) => (
        <View key={item + i} style={{ height: ITEM_H }} className="items-center justify-center">
          <Text className={`text-base ${i === index ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
