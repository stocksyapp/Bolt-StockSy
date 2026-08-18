import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTracker, monthKey } from '@/context/TrackerContext';
import { ArrowLeft, ChevronDown, Pencil, Check, Calendar, UserCheck, Plus, Trash2 } from 'lucide-react-native';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Modal } from '@/components/Modal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function MaidTrackerScreen() {
  const { maids, maidData, getMaidMonthData, setMaidEntry, setMaidPaidOn, addMaid, updateMaid, removeMaid } = useTrackerFull();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);
  const [showYear, setShowYear] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [activeMaid, setActiveMaid] = useState(0);
  const [editingMaid, setEditingMaid] = useState<string | null>(null);
  const [addingMaid, setAddingMaid] = useState(false);

  const key = monthKey(year, month);

  const currentMaid = maids[activeMaid];
  const monthData = getMaidMonthData(currentMaid?.id ?? '', year, month);
  const totalYes = monthData.entries.filter((e) => e.present).length;
  const totalNo = monthData.entries.filter((e) => !e.present).length;
  const totalAmount = Math.round((totalYes / 30) * (currentMaid?.ratePerMonth ?? 0));

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.push('/more/tracker')} className="p-1.5"><ArrowLeft size={22} color="#475569" /></Pressable>
        <Text className="text-lg font-bold text-slate-900 flex-1">Maid Tracker</Text>
        <Pressable onPress={() => setAddingMaid(true)} className="p-1.5"><Plus size={20} color="#1d6fd1" /></Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, padding: 20, gap: 16 }}>
        <View className="flex-row gap-2">
          {maids.map((maid, idx) => (
            <Pressable key={maid.id} onPress={() => setActiveMaid(idx)} className={`flex-1 px-3 py-2.5 rounded-xl ${activeMaid === idx ? 'bg-primary-600' : 'bg-white border border-slate-200'}`}>
              <Text className={`text-xs font-bold ${activeMaid === idx ? 'text-white' : 'text-slate-600'}`} numberOfLines={1}>{maid.role.split(' ')[0]}</Text>
            </Pressable>
          ))}
        </View>

        {currentMaid && (
          <View className="bg-white rounded-2xl border border-slate-100 p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-bold text-slate-900">{currentMaid.name}</Text>
                <Text className="text-xs text-slate-400">{currentMaid.role}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable onPress={() => setEditingMaid(currentMaid.id)} className="p-1.5 rounded-lg bg-slate-100"><Pencil size={16} color="#475569" /></Pressable>
                {maids.length > 1 && <Pressable onPress={() => { removeMaid(currentMaid.id); setActiveMaid(0); }} className="p-1.5 rounded-lg bg-danger-100"><Trash2 size={16} color="#dc2626" /></Pressable>}
              </View>
            </View>
            <View className="flex-row justify-between"><ConfigRow label="Rate / Month" value={`INR ${currentMaid.ratePerMonth}`} /><ConfigRow label="Arrival" value={currentMaid.arrivalTime} /><ConfigRow label="Mobile" value={currentMaid.mobile} /></View>
          </View>
        )}

        <View className="flex-row gap-3">
          <Pressable onPress={() => setShowYear(true)} className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-row items-center justify-between active:opacity-80">
            <Text className="font-semibold text-slate-900">{year}</Text><ChevronDown size={18} color="#94a3b8" />
          </Pressable>
          <Pressable onPress={() => setShowMonth(true)} className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-row items-center justify-between active:opacity-80">
            <Text className="font-semibold text-slate-900">{MONTHS[month]}</Text><ChevronDown size={18} color="#94a3b8" />
          </Pressable>
        </View>

        {currentMaid && (
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <View className="flex-row bg-slate-50 px-4 py-3 border-b border-slate-100">
              <Text className="flex-1 text-xs font-bold text-slate-500 uppercase">Date</Text>
              <Text className="w-24 text-xs font-bold text-slate-500 uppercase text-center">{currentMaid.role.split(' ')[0]} - YES/NO</Text>
            </View>
            {monthData.entries.map((entry, idx) => {
              const dayNum = new Date(entry.date).getDate();
              return (
                <View key={entry.date} className={`flex-row items-center px-4 py-3 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''} border-b border-slate-50`}>
                  <Text className="flex-1 text-sm font-medium text-slate-900">{dayNum} {MONTHS[month].slice(0, 3)} {year}</Text>
                  <View className="w-24 items-center">
                    <Pressable onPress={() => setMaidEntry(currentMaid.id, key, entry.date, !entry.present)} className={`px-3 py-1 rounded-full ${entry.present ? 'bg-accent-100' : 'bg-danger-100'}`}>
                      <Text className={`text-xs font-bold ${entry.present ? 'text-accent-700' : 'text-danger-700'}`}>{entry.present ? 'YES' : 'NO'}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {currentMaid && (
          <View className="bg-accent-600 rounded-2xl p-5 gap-3">
            <Text className="text-white font-bold text-base">Summary - {MONTHS[month]} {year}</Text>
            <View className="flex-row justify-between"><Text className="text-accent-100 text-sm">Total Present Days</Text><Text className="text-white font-bold">{totalYes}</Text></View>
            <View className="flex-row justify-between"><Text className="text-accent-100 text-sm">Total Absent Days</Text><Text className="text-white font-bold">{totalNo}</Text></View>
            <View className="h-px bg-accent-400 my-1" />
            <View className="flex-row justify-between items-center"><Text className="text-white font-semibold">Total Amount</Text><Text className="text-white text-2xl font-bold">INR {totalAmount.toLocaleString('en-IN')}</Text></View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-accent-100 text-sm">Paid on</Text>
              <Pressable onPress={() => { const today = new Date().toISOString().slice(0, 10); setMaidPaidOn(currentMaid.id, key, monthData.paidOn ? '' : today); }}>
                <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg ${monthData.paidOn ? 'bg-white/20' : 'bg-white/10'}`}>
                  <Calendar size={14} color="#fff" /><Text className="text-white text-sm font-medium">{monthData.paidOn || 'Mark Paid'}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal open={showYear} onClose={() => setShowYear(false)} title="Select Year">
        <View className="gap-2">{YEARS.map((y) => (<Pressable key={y} onPress={() => { setYear(y); setShowYear(false); }} className={`px-4 py-3 rounded-xl ${y === year ? 'bg-primary-600' : 'bg-slate-100'}`}><Text className={`font-semibold ${y === year ? 'text-white' : 'text-slate-700'}`}>{y}</Text></Pressable>))}</View>
      </Modal>
      <Modal open={showMonth} onClose={() => setShowMonth(false)} title="Select Month">
        <View className="gap-2">{MONTHS.map((m, i) => (<Pressable key={m} onPress={() => { setMonth(i); setShowMonth(false); }} className={`px-4 py-3 rounded-xl ${i === month ? 'bg-primary-600' : 'bg-slate-100'}`}><Text className={`font-semibold ${i === month ? 'text-white' : 'text-slate-700'}`}>{m}</Text></Pressable>))}</View>
      </Modal>

      <MaidEditor open={!!editingMaid} onClose={() => setEditingMaid(null)} maid={maids.find((m) => m.id === editingMaid)} onSave={(data) => { if (editingMaid) updateMaid(editingMaid, data); setEditingMaid(null); }} />
      <MaidEditor open={addingMaid} onClose={() => setAddingMaid(false)} maid={null} onSave={(data) => { addMaid({ id: `maid-${Date.now()}`, ...data }); setAddingMaid(false); }} />
    </SafeAreaView>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return <View className="flex-1"><Text className="text-xs text-slate-400">{label}</Text><Text className="text-sm font-semibold text-slate-900">{value}</Text></View>;
}

function MaidEditor({ open, onClose, maid, onSave }: { open: boolean; onClose: () => void; maid: any; onSave: (data: any) => void }) {
  const [name, setName] = useState(maid?.name ?? '');
  const [role, setRole] = useState(maid?.role ?? '');
  const [rate, setRate] = useState(String(maid?.ratePerMonth ?? ''));
  const [arrival, setArrival] = useState(maid?.arrivalTime ?? '');
  const [mobile, setMobile] = useState(maid?.mobile ?? '');

  return (
    <Modal open={open} onClose={onClose} title={maid ? 'Edit Maid' : 'Add Maid'} footer={
      <Pressable onPress={() => { onSave({ name, role, ratePerMonth: Number(rate) || 0, arrivalTime: arrival, mobile }); onClose(); }} className="bg-primary-600 rounded-xl py-3.5 items-center active:opacity-80"><Text className="text-white font-semibold">Save</Text></Pressable>
    }>
      <View className="gap-4">
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Maid Name</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={name} onChangeText={setName} placeholder="e.g. Sunita" placeholderTextColor="#94a3b8" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Role</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={role} onChangeText={setRole} placeholder="e.g. Cleaning Maid" placeholderTextColor="#94a3b8" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Rate per Month (INR)</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={rate} onChangeText={setRate} keyboardType="number-pad" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Arrival Time</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={arrival} onChangeText={setArrival} placeholder="e.g. 11 AM & 5 PM" placeholderTextColor="#94a3b8" /></View>
        <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Mobile Number</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" /></View>
      </View>
    </Modal>
  );
}

function useTrackerFull() {
  const tracker = useTracker();
  const getMaidMonthData = (maidId: string, year: number, month: number) => {
    const key = monthKey(year, month);
    const maidMonths = tracker.maidData[maidId] ?? {};
    const existing = maidMonths[key];
    const days = new Date(year, month + 1, 0).getDate();
    const map = new Map(existing?.entries.map((e) => [e.date, e]));
    const entries = [];
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      entries.push(map.get(dateStr) ?? { date: dateStr, present: true });
    }
    return { entries, paidOn: existing?.paidOn ?? '' };
  };
  return { ...tracker, getMaidMonthData };
}
