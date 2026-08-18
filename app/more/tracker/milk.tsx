import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTracker, monthKey } from '@/context/TrackerContext';
import { ArrowLeft, ChevronDown, Pencil, Check, X, Calendar, Wallet } from 'lucide-react-native';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Modal } from '@/components/Modal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function MilkTrackerScreen() {
  const { milkConfig, updateMilkConfig, getMilkMonth, setMilkEntry, setMilkPaidOn } = useTracker();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);
  const [showYear, setShowYear] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);
  const [editQty, setEditQty] = useState<Record<string, string>>({});

  const key = monthKey(year, month);
  const monthData = getMilkMonth(year, month);

  const totalYes = monthData.entries.filter((e) => e.present).length;
  const totalNo = monthData.entries.filter((e) => !e.present).length;
  const totalMilk = monthData.entries.reduce((sum, e) => sum + (e.present ? e.qty : 0), 0);
  const totalAmount = totalYes * milkConfig.milkPerDay * milkConfig.ratePerKg;

  function togglePresent(date: string, current: boolean) {
    setMilkEntry(key, date, !current, !current ? milkConfig.milkPerDay : 0);
  }

  function saveQty(date: string) {
    const qty = Number(editQty[date] ?? 0);
    if (!isNaN(qty) && qty >= 0) setMilkEntry(key, date, true, qty);
    setEditQty((prev) => { const next = { ...prev }; delete next[date]; return next; });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.push('/more/tracker')} className="p-1.5"><ArrowLeft size={22} color="#475569" /></Pressable>
        <Text className="text-lg font-bold text-slate-900 flex-1">Milk Tracker</Text>
        <Pressable onPress={() => setEditingConfig(true)} className="p-1.5"><Pencil size={18} color="#1d6fd1" /></Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, padding: 20, gap: 16 }}>
        <View className="bg-white rounded-2xl border border-slate-100 p-4 gap-3">
          <View className="flex-row justify-between"><ConfigRow label="Rate per KG" value={`INR ${milkConfig.ratePerKg}`} /><ConfigRow label="Milk / Day" value={`${milkConfig.milkPerDay} Ltr`} /></View>
          <View className="flex-row justify-between"><ConfigRow label="Milkman" value={milkConfig.milkmanName} /><ConfigRow label="Mobile" value={milkConfig.milkmanMobile} /></View>
        </View>

        <View className="flex-row gap-3">
          <Pressable onPress={() => setShowYear(true)} className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-row items-center justify-between active:opacity-80">
            <Text className="font-semibold text-slate-900">{year}</Text><ChevronDown size={18} color="#94a3b8" />
          </Pressable>
          <Pressable onPress={() => setShowMonth(true)} className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-row items-center justify-between active:opacity-80">
            <Text className="font-semibold text-slate-900">{MONTHS[month]}</Text><ChevronDown size={18} color="#94a3b8" />
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <View className="flex-row bg-slate-50 px-4 py-3 border-b border-slate-100">
            <Text className="flex-1 text-xs font-bold text-slate-500 uppercase">Date</Text>
            <Text className="w-20 text-xs font-bold text-slate-500 uppercase text-center">Qty (Ltr)</Text>
            <Text className="w-24 text-xs font-bold text-slate-500 uppercase text-center">Present</Text>
          </View>
          {monthData.entries.map((entry, idx) => {
            const dayNum = new Date(entry.date).getDate();
            const isEditing = editQty[entry.date] !== undefined;
            return (
              <View key={entry.date} className={`flex-row items-center px-4 py-3 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''} border-b border-slate-50`}>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-slate-900">{dayNum} {MONTHS[month].slice(0, 3)} {year}</Text>
                </View>
                <View className="w-20 items-center">
                  {isEditing ? (
                    <View className="flex-row items-center gap-1">
                      <TextInput className="w-12 text-center border border-slate-200 rounded-lg px-1 py-1 text-sm text-slate-900" value={editQty[entry.date]} onChangeText={(v) => setEditQty((p) => ({ ...p, [entry.date]: v }))} keyboardType="number-pad" />
                      <Pressable onPress={() => saveQty(entry.date)}><Check size={16} color="#059669" /></Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => entry.present && setEditQty((p) => ({ ...p, [entry.date]: String(entry.qty) }))}>
                      <Text className={`text-sm font-semibold ${entry.present ? 'text-slate-900' : 'text-slate-300'}`}>{entry.present ? entry.qty : 0}</Text>
                    </Pressable>
                  )}
                </View>
                <View className="w-24 items-center">
                  <Pressable onPress={() => togglePresent(entry.date, entry.present)} className={`px-3 py-1 rounded-full ${entry.present ? 'bg-accent-100' : 'bg-danger-100'}`}>
                    <Text className={`text-xs font-bold ${entry.present ? 'text-accent-700' : 'text-danger-700'}`}>{entry.present ? 'YES' : 'NO'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <View className="bg-primary-600 rounded-2xl p-5 gap-3">
          <Text className="text-white font-bold text-base">Summary - {MONTHS[month]} {year}</Text>
          <View className="flex-row justify-between"><Text className="text-primary-100 text-sm">Total Days Received</Text><Text className="text-white font-bold">{totalYes}</Text></View>
          <View className="flex-row justify-between"><Text className="text-primary-100 text-sm">Total NO Days</Text><Text className="text-white font-bold">{totalNo}</Text></View>
          <View className="flex-row justify-between"><Text className="text-primary-100 text-sm">Total Milk Received</Text><Text className="text-white font-bold">{totalMilk} Ltr</Text></View>
          <View className="h-px bg-primary-400 my-1" />
          <View className="flex-row justify-between items-center"><Text className="text-white font-semibold">Total Amount</Text><Text className="text-white text-2xl font-bold">INR {totalAmount.toLocaleString('en-IN')}</Text></View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-primary-100 text-sm">Paid on</Text>
            <Pressable onPress={() => {
              const today = new Date().toISOString().slice(0, 10);
              setMilkPaidOn(key, monthData.paidOn ? '' : today);
            }}>
              <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg ${monthData.paidOn ? 'bg-white/20' : 'bg-white/10'}`}>
                <Calendar size={14} color="#fff" />
                <Text className="text-white text-sm font-medium">{monthData.paidOn || 'Mark Paid'}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal open={showYear} onClose={() => setShowYear(false)} title="Select Year">
        <View className="gap-2">{YEARS.map((y) => (
          <Pressable key={y} onPress={() => { setYear(y); setShowYear(false); }} className={`px-4 py-3 rounded-xl ${y === year ? 'bg-primary-600' : 'bg-slate-100'}`}>
            <Text className={`font-semibold ${y === year ? 'text-white' : 'text-slate-700'}`}>{y}</Text>
          </Pressable>
        ))}</View>
      </Modal>

      <Modal open={showMonth} onClose={() => setShowMonth(false)} title="Select Month">
        <View className="gap-2">{MONTHS.map((m, i) => (
          <Pressable key={m} onPress={() => { setMonth(i); setShowMonth(false); }} className={`px-4 py-3 rounded-xl ${i === month ? 'bg-primary-600' : 'bg-slate-100'}`}>
            <Text className={`font-semibold ${i === month ? 'text-white' : 'text-slate-700'}`}>{m}</Text>
          </Pressable>
        ))}</View>
      </Modal>

      <ConfigEditor open={editingConfig} onClose={() => setEditingConfig(false)} config={milkConfig} onSave={updateMilkConfig} />
    </SafeAreaView>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return <View><Text className="text-xs text-slate-400">{label}</Text><Text className="text-sm font-semibold text-slate-900">{value}</Text></View>;
}

function ConfigEditor({ open, onClose, config, onSave }: { open: boolean; onClose: () => void; config: any; onSave: (p: any) => void }) {
  const [rate, setRate] = useState(String(config.ratePerKg));
  const [perDay, setPerDay] = useState(String(config.milkPerDay));
  const [name, setName] = useState(config.milkmanName);
  const [mobile, setMobile] = useState(config.milkmanMobile);

  return (
    <Modal open={open} onClose={onClose} title="Edit Configuration" footer={
      <Pressable onPress={() => { onSave({ ratePerKg: Number(rate) || 0, milkPerDay: Number(perDay) || 0, milkmanName: name, milkmanMobile: mobile }); onClose(); }} className="bg-primary-600 rounded-xl py-3.5 items-center active:opacity-80">
        <Text className="text-white font-semibold">Save</Text>
      </Pressable>
    }>
      <View className="gap-4">
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Rate per KG (INR)</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={rate} onChangeText={setRate} keyboardType="number-pad" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Milk per Day (Ltr)</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={perDay} onChangeText={setPerDay} keyboardType="number-pad" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Milkman Name</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={name} onChangeText={setName} /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Milkman Mobile</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" /></View>
      </View>
    </Modal>
  );
}
