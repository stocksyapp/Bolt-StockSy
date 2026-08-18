import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import { Modal } from '@/components/Modal';
import { Toggle } from '@/components/Toggle';
import {
  ArrowLeft, Mail, Phone, Users, Bell, FileText, Shield, Trash2, LogOut,
  Pencil, Check, AlertTriangle, ChevronRight,
} from 'lucide-react-native';
import {
  View, Text, TextInput, Pressable, ScrollView, Alert,
} from 'react-native';

type LegalView = 'terms' | 'privacy' | null;

const AVATAR_COLORS = ['#1d6fd1', '#059669', '#ea580c', '#9333ea', '#db2777', '#0891b2', '#ca8a04'];

export default function ProfileScreen() {
  const { user, updateUser, logout, clearCache, deleteAccount, items } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editMobile, setEditMobile] = useState(user.mobile);
  const [editHousehold, setEditHousehold] = useState(user.householdSize);
  const [editColor, setEditColor] = useState(user.avatarColor);
  const [legal, setLegal] = useState<LegalView>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  function saveProfile() {
    updateUser({ name: editName.trim() || user.name, email: editEmail.trim(), mobile: editMobile.trim(), householdSize: Math.max(1, editHousehold), avatarColor: editColor });
    setEditing(false);
    Alert.alert('Saved', 'Profile updated successfully');
  }
  async function handleDeleteAccount() { if (deleteConfirm !== 'DELETE') return; await deleteAccount(); setShowDelete(false); router.replace('/login'); }
  async function handleLogout() { await logout(); router.replace('/login'); }
  async function handleClearCache() { await clearCache(); Alert.alert('Done', 'Cache cleared successfully'); }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
          <Pressable onPress={() => router.push('/(tabs)/dashboard')} className="p-1.5">
            <ArrowLeft size={22} color="#475569" />
          </Pressable>
          <Text className="text-lg font-bold text-slate-900">Profile & Settings</Text>
        </View>

        <View className="px-5 pt-5 gap-6">
          <View className="bg-white rounded-2xl border border-slate-100 p-5 items-center" style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
            <View className="h-20 w-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: user.avatarColor }}>
              <Text className="text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-xl font-bold text-slate-900">{user.name}</Text>
            <View className="flex-row items-center gap-1 mt-2"><Mail size={14} color="#64748b" /><Text className="text-sm text-slate-500">{user.email}</Text></View>
            <View className="flex-row items-center gap-1 mt-1"><Phone size={14} color="#64748b" /><Text className="text-sm text-slate-500">{user.mobile}</Text></View>
            <Pressable onPress={() => { setEditName(user.name); setEditEmail(user.email); setEditMobile(user.mobile); setEditHousehold(user.householdSize); setEditColor(user.avatarColor); setEditing(true); }} className="mt-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:opacity-80">
              <Pencil size={15} color="#475569" /><Text className="font-semibold text-slate-700 text-sm">Edit Profile</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-5">
            <Text className="font-bold text-slate-900 mb-3">Account Overview</Text>
            <View className="flex-row gap-8">
              <View><Text className="text-2xl font-bold text-primary-600">{items.length}</Text><Text className="text-xs text-slate-500">Items Tracked</Text></View>
              <View><Text className="text-2xl font-bold text-primary-600">{user.householdSize}</Text><Text className="text-xs text-slate-500">Household Size</Text></View>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-2">
            <Text className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Preferences</Text>
            <View className="flex-row items-center gap-3 px-3 py-3">
              <View className="h-9 w-9 rounded-xl bg-primary-100 items-center justify-center"><Users size={18} color="#1d6fd1" /></View>
              <View className="flex-1"><Text className="font-medium text-slate-900 text-sm">Household Size</Text><Text className="text-xs text-slate-400">Used for smart suggestions</Text></View>
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => updateUser({ householdSize: Math.max(1, user.householdSize - 1) })} className="h-7 w-7 rounded-lg bg-slate-100 items-center justify-center active:opacity-70"><Text className="text-slate-600 font-bold">-</Text></Pressable>
                <Text className="w-6 text-center font-semibold">{user.householdSize}</Text>
                <Pressable onPress={() => updateUser({ householdSize: user.householdSize + 1 })} className="h-7 w-7 rounded-lg bg-slate-100 items-center justify-center active:opacity-70"><Text className="text-slate-600 font-bold">+</Text></Pressable>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-2">
            <Text className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Notifications</Text>
            <SettingRow icon={Bell} label="Push Notifications" desc="All alerts" bg="bg-primary-100" color="#1d6fd1"><Toggle checked={user.notificationsEnabled} onChange={(v) => updateUser({ notificationsEnabled: v })} /></SettingRow>
            <SettingRow icon={AlertTriangle} label="Expiry Alerts" desc="Items nearing expiry" bg="bg-warning-100" color="#b45309"><Toggle checked={user.expiryAlerts} onChange={(v) => updateUser({ expiryAlerts: v })} disabled={!user.notificationsEnabled} /></SettingRow>
            <SettingRow icon={AlertTriangle} label="Low Stock Alerts" desc="Items running low" bg="bg-warning-100" color="#d97706"><Toggle checked={user.lowStockAlerts} onChange={(v) => updateUser({ lowStockAlerts: v })} disabled={!user.notificationsEnabled} /></SettingRow>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-2">
            <Text className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Legal & Compliance</Text>
            <Pressable onPress={() => setLegal('terms')} className="flex-row items-center gap-3 px-3 py-3 active:opacity-60"><View className="h-9 w-9 rounded-xl bg-slate-100 items-center justify-center"><FileText size={18} color="#475569" /></View><Text className="flex-1 font-medium text-slate-900 text-sm">Terms & Conditions</Text><ChevronRight size={18} color="#cbd5e1" /></Pressable>
            <Pressable onPress={() => setLegal('privacy')} className="flex-row items-center gap-3 px-3 py-3 active:opacity-60"><View className="h-9 w-9 rounded-xl bg-slate-100 items-center justify-center"><Shield size={18} color="#475569" /></View><Text className="flex-1 font-medium text-slate-900 text-sm">Privacy Policy</Text><ChevronRight size={18} color="#cbd5e1" /></Pressable>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-2">
            <Text className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Account</Text>
            <Pressable onPress={handleClearCache} className="flex-row items-center gap-3 px-3 py-3 active:opacity-60"><View className="h-9 w-9 rounded-xl bg-slate-100 items-center justify-center"><FileText size={18} color="#475569" /></View><Text className="flex-1 font-medium text-slate-900 text-sm">Clear Cache</Text><ChevronRight size={18} color="#cbd5e1" /></Pressable>
            <Pressable onPress={handleLogout} className="flex-row items-center gap-3 px-3 py-3 active:opacity-60"><View className="h-9 w-9 rounded-xl bg-slate-100 items-center justify-center"><LogOut size={18} color="#475569" /></View><Text className="flex-1 font-medium text-slate-900 text-sm">Log Out</Text><ChevronRight size={18} color="#cbd5e1" /></Pressable>
            <Pressable onPress={() => setShowDelete(true)} className="flex-row items-center gap-3 px-3 py-3 active:opacity-60"><View className="h-9 w-9 rounded-xl bg-danger-100 items-center justify-center"><Trash2 size={18} color="#dc2626" /></View><Text className="flex-1 font-medium text-danger-600 text-sm">Delete Account</Text><ChevronRight size={18} color="#fca5a5" /></Pressable>
          </View>

          <Text className="text-center text-xs text-slate-400">StockSy v1.0 - Made with care</Text>
        </View>
      </ScrollView>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile" footer={
        <View className="flex-row gap-3">
          <Pressable onPress={() => setEditing(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 items-center"><Text className="font-semibold text-slate-700">Cancel</Text></Pressable>
          <Pressable onPress={saveProfile} className="flex-1 bg-primary-600 rounded-xl py-3.5 flex-row items-center justify-center gap-2 active:opacity-80"><Check size={18} color="#fff" /><Text className="font-semibold text-white">Save</Text></Pressable>
        </View>
      }>
        <View className="gap-4">
          <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Full Name</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={editName} onChangeText={setEditName} /></View>
          <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Email</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" /></View>
          <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Mobile Number</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={editMobile} onChangeText={setEditMobile} keyboardType="phone-pad" /></View>
          <View><Text className="text-sm font-medium text-slate-700 mb-1.5">Household Size</Text><TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" value={String(editHousehold)} onChangeText={(v) => setEditHousehold(Number(v) || 1)} keyboardType="number-pad" /></View>
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-2">Avatar Color</Text>
            <View className="flex-row gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <Pressable key={c} onPress={() => setEditColor(c)} className="h-9 w-9 rounded-full active:opacity-70" style={{ backgroundColor: c, borderWidth: editColor === c ? 2 : 0, borderColor: '#94a3b8' }} />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal open={showDelete} onClose={() => { setShowDelete(false); setDeleteConfirm(''); }} title="Delete Account" footer={
        <View className="flex-row gap-3">
          <Pressable onPress={() => { setShowDelete(false); setDeleteConfirm(''); }} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 items-center"><Text className="font-semibold text-slate-700">Cancel</Text></Pressable>
          <Pressable onPress={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'} className={`flex-1 bg-danger-500 rounded-xl py-3.5 items-center ${deleteConfirm !== 'DELETE' ? 'opacity-40' : ''}`}><Text className="font-semibold text-white">Delete Permanently</Text></Pressable>
        </View>
      }>
        <View className="gap-4">
          <View className="flex-row items-start gap-3 bg-danger-50 rounded-xl p-3"><AlertTriangle size={20} color="#dc2626" /><Text className="text-sm text-danger-700 flex-1">This will permanently delete your account, all inventory items, and preferences. This action cannot be undone.</Text></View>
          <Text className="text-sm text-slate-600">Type <Text className="font-bold text-danger-600">DELETE</Text> to confirm:</Text>
          <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" placeholder="DELETE" placeholderTextColor="#94a3b8" value={deleteConfirm} onChangeText={setDeleteConfirm} />
        </View>
      </Modal>

      <Modal open={legal === 'terms'} onClose={() => setLegal(null)} title="Terms & Conditions">
        <View className="gap-4">
          <Section title="1. Acceptance of Terms">By accessing and using StockSy, you accept and agree to be bound by these Terms. If you do not agree, please do not use the service.</Section>
          <Section title="2. Service Description">StockSy is a home inventory management application that helps you track groceries, supplies, expiry dates, and stock levels to reduce household waste.</Section>
          <Section title="3. User Responsibilities">You are responsible for the accuracy of the data you enter. StockSy provides tools for tracking but does not guarantee the correctness of user-submitted information.</Section>
          <Section title="4. Data & Privacy">We collect minimal data necessary to operate the service. Your inventory data is stored locally on your device. See our Privacy Policy for full details.</Section>
          <Section title="5. Account Deletion">You have the right to delete your account permanently at any time from the Settings page. Deletion removes all associated data and cannot be reversed.</Section>
          <Section title="6. Limitation of Liability">StockSy is provided "as is" without warranties. We are not liable for any damages arising from use of the service.</Section>
          <Text className="text-xs text-slate-400">Last updated: August 2026</Text>
        </View>
      </Modal>

      <Modal open={legal === 'privacy'} onClose={() => setLegal(null)} title="Privacy Policy">
        <View className="gap-4">
          <Section title="1. Data We Collect">StockSy collects only the information you provide: your name, contact details, and inventory items. We do not track your location or sell data to third parties.</Section>
          <Section title="2. Data Storage">Your inventory and preferences are stored locally on your device using secure device storage. No data is transmitted to external servers.</Section>
          <Section title="3. Data Security">We employ industry-standard practices to protect your data. Device storage is sandboxed and isolated from other applications.</Section>
          <Section title="4. Minimal Data Collection">We follow a minimal-data principle - we only ask for what is needed to provide inventory tracking and alerts.</Section>
          <Section title="5. Your Rights">You have the right to access, modify, and delete your data. Account deletion is permanent and removes all stored information immediately.</Section>
          <Section title="6. Third-Party Services">StockSy does not share your data with third parties. Social login buttons are simulated for demonstration purposes only.</Section>
          <Text className="text-xs text-slate-400">Last updated: August 2026</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingRow({ icon: Icon, label, desc, bg, color, children }: { icon: typeof Bell; label: string; desc: string; bg: string; color: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-3 px-3 py-3">
      <View className={`h-9 w-9 rounded-xl items-center justify-center ${bg}`}><Icon size={18} color={color} /></View>
      <View className="flex-1"><Text className="font-medium text-slate-900 text-sm">{label}</Text><Text className="text-xs text-slate-400">{desc}</Text></View>
      {children}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View><Text className="font-semibold text-slate-900 text-sm mb-1">{title}</Text><Text className="text-sm text-slate-600 leading-relaxed">{children}</Text></View>
  );
}
