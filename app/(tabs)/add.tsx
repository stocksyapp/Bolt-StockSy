import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Toggle } from '@/components/Toggle';
import { Modal } from '@/components/Modal';
import { SelectSheet } from '@/components/SelectSheet';
import { DateField } from '@/components/DateField';
import { InventoryItem, Category, Unit, Location, CATEGORIES, UNITS, LOCATIONS } from '@/types';
import {
  ArrowLeft, ScanLine, FileText, Bell, Save, Trash2, Check, Sparkles,
} from 'lucide-react-native';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';

interface FormState {
  name: string; brand: string; category: Category; quantity: string; unit: Unit;
  location: Location; purchaseDate: string; expiryDate: string; lowStockThreshold: string;
  expiryAlerts: boolean; lowStockAlerts: boolean;
}

const emptyForm: FormState = {
  name: '', brand: '', category: 'Groceries', quantity: '1', unit: 'pcs',
  location: 'Pantry', purchaseDate: new Date().toISOString().slice(0, 10),
  expiryDate: '', lowStockThreshold: '1', expiryAlerts: true, lowStockAlerts: true,
};

export default function AddEditScreen() {
  const { addItem, updateItem, deleteItem, items } = useApp();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editItem = useMemo(
    () => items.find((it) => it.id === params.editId) ?? null,
    [items, params.editId],
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [showScan, setShowScan] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name, brand: editItem.brand, category: editItem.category,
        quantity: String(editItem.quantity), unit: editItem.unit, location: editItem.location,
        purchaseDate: editItem.purchaseDate, expiryDate: editItem.expiryDate,
        lowStockThreshold: String(editItem.lowStockThreshold),
        expiryAlerts: editItem.expiryAlerts, lowStockAlerts: editItem.lowStockAlerts,
      });
    }
  }, [editItem]);

  const isEdit = !!editItem;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setError('');
    if (!form.name.trim()) { setError('Item name is required.'); return; }
    const qty = Number(form.quantity);
    if (isNaN(qty) || qty < 0) { setError('Quantity must be a valid number.'); return; }

    const payload = {
      name: form.name.trim(), brand: form.brand.trim(), category: form.category,
      quantity: qty, unit: form.unit, location: form.location,
      purchaseDate: form.purchaseDate, expiryDate: form.expiryDate,
      lowStockThreshold: Math.max(0, Number(form.lowStockThreshold) || 0),
      expiryAlerts: form.expiryAlerts, lowStockAlerts: form.lowStockAlerts,
    };

    if (isEdit && editItem) updateItem(editItem.id, payload);
    else addItem(payload);

    setSavedToast(true);
    setTimeout(() => router.replace('/(tabs)/dashboard'), 700);
  }

  function runScan() {
    setScanStep(0); setShowScan(true);
    [1, 2, 3].forEach((s) => setTimeout(() => setScanStep(s), s * 700));
    setTimeout(() => {
      setForm((p) => ({ ...p, name: 'Scan Organic Pasta', brand: 'Barilla', category: 'Groceries', quantity: '2', unit: 'pack' }));
      setShowScan(false);
    }, 2900);
  }

  function runOcr() {
    setScanStep(0); setShowOcr(true);
    [1, 2, 3].forEach((s) => setTimeout(() => setScanStep(s), s * 700));
    setTimeout(() => {
      setForm((p) => ({
        ...p, name: 'Whole Wheat Flour', brand: 'King Arthur', category: 'Groceries',
        quantity: '3', unit: 'kg', purchaseDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
      }));
      setShowOcr(false);
    }, 2900);
  }

  const scanMessages = ['Scanning…', 'Recognizing product…', 'Extracting details…', 'Done!'];
  const isScanOpen = showScan || showOcr;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="p-1.5">
          <ArrowLeft size={22} color="#475569" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Item' : 'Add Item'}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 20 }}>
        {!isEdit && (
          <View className="flex-row gap-3">
            <Pressable onPress={runScan} className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 items-center active:opacity-80">
              <View className="h-11 w-11 rounded-xl bg-primary-100 items-center justify-center mb-2">
                <ScanLine size={22} color="#1d6fd1" />
              </View>
              <Text className="font-semibold text-slate-900 text-sm">Scan Barcode</Text>
              <Text className="text-xs text-slate-400">Auto-fill item details</Text>
            </Pressable>
            <Pressable onPress={runOcr} className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 items-center active:opacity-80">
              <View className="h-11 w-11 rounded-xl bg-accent-100 items-center justify-center mb-2">
                <FileText size={22} color="#059669" />
              </View>
              <Text className="font-semibold text-slate-900 text-sm">Upload Bill / OCR</Text>
              <Text className="text-xs text-slate-400">Scan your receipt</Text>
            </Pressable>
          </View>
        )}

        <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-4">
          <Text className="font-bold text-slate-400 text-xs uppercase tracking-wide">Item Details</Text>
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">Item Name *</Text>
            <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" placeholder="e.g. Whole Milk" placeholderTextColor="#94a3b8" value={form.name} onChangeText={(v) => set('name', v)} />
          </View>
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">Brand</Text>
            <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" placeholder="e.g. DairyPure" placeholderTextColor="#94a3b8" value={form.brand} onChangeText={(v) => set('brand', v)} />
          </View>
          <SelectSheet label="Category" value={form.category} options={CATEGORIES} onSelect={(v) => set('category', v as Category)} />
          <SelectSheet label="Location / Room" value={form.location} options={LOCATIONS} onSelect={(v) => set('location', v as Location)} />
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-4">
          <Text className="font-bold text-slate-400 text-xs uppercase tracking-wide">Quantity</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Quantity</Text>
              <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={form.quantity} onChangeText={(v) => set('quantity', v)} keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <SelectSheet label="Unit" value={form.unit} options={UNITS} onSelect={(v) => set('unit', v as Unit)} />
            </View>
          </View>
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">Low Stock Alert Threshold</Text>
            <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={form.lowStockThreshold} onChangeText={(v) => set('lowStockThreshold', v)} keyboardType="number-pad" />
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-4">
          <Text className="font-bold text-slate-400 text-xs uppercase tracking-wide">Dates</Text>
          <DateField label="Purchase Date" value={form.purchaseDate} onChange={(v) => set('purchaseDate', v)} />
          <DateField label="Expiry Date" value={form.expiryDate} onChange={(v) => set('expiryDate', v)} placeholder="No expiry" />
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 p-5 gap-4">
          <View className="flex-row items-center gap-2">
            <Bell size={16} color="#1d6fd1" />
            <Text className="font-bold text-slate-400 text-xs uppercase tracking-wide">Alert Settings</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-medium text-slate-900 text-sm">Expiry Alerts</Text>
              <Text className="text-xs text-slate-400">Notify before this item expires</Text>
            </View>
            <Toggle checked={form.expiryAlerts} onChange={(v) => set('expiryAlerts', v)} />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-medium text-slate-900 text-sm">Low Stock Alerts</Text>
              <Text className="text-xs text-slate-400">Notify when stock runs low</Text>
            </View>
            <Toggle checked={form.lowStockAlerts} onChange={(v) => set('lowStockAlerts', v)} />
          </View>
        </View>

        {!!error && <Text className="text-sm text-danger-600">{error}</Text>}

        <View className="flex-row gap-3">
          {isEdit && editItem && (
            <Pressable onPress={() => { deleteItem(editItem.id); router.replace('/(tabs)/dashboard'); }} className="bg-danger-50 rounded-xl px-4 py-3.5 items-center justify-center active:opacity-80">
              <Trash2 size={18} color="#dc2626" />
            </Pressable>
          )}
          <Pressable onPress={handleSubmit} className="flex-1 bg-primary-600 rounded-xl py-3.5 flex-row items-center justify-center gap-2 active:opacity-80">
            <Save size={18} color="#fff" />
            <Text className="text-white font-semibold">{isEdit ? 'Update Item' : 'Save Item'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal open={isScanOpen} onClose={() => {}} title={showScan ? 'Scanning Barcode' : 'Reading Receipt'}>
        <View className="items-center py-6">
          <View className="h-40 w-40 rounded-2xl bg-slate-900 items-center justify-center mb-6 overflow-hidden">
            {showScan ? <ScanLine size={48} color="#599dff" /> : <FileText size={48} color="#34d399" />}
          </View>
          <View className="flex-row items-center gap-2">
            {scanStep < 3 && <Sparkles size={16} color="#1d6fd1" />}
            <Text className="font-medium text-slate-900">{scanMessages[scanStep]}</Text>
          </View>
          {scanStep >= 3 && <Check size={28} color="#1d6fd1" className="mt-3" />}
        </View>
      </Modal>

      {savedToast && (
        <View className="absolute bottom-24 inset-x-0 items-center">
          <View className="bg-slate-900 px-5 py-3 rounded-full flex-row items-center gap-2">
            <Check size={16} color="#599dff" />
            <Text className="text-white text-sm font-medium">{isEdit ? 'Item updated' : 'Item added'}</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
