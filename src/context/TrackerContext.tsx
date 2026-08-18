import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MilkConfig {
  ratePerKg: number; milkPerDay: number; milkmanName: string; milkmanMobile: string;
}
export interface MilkDayEntry { date: string; qty: number; present: boolean; }
export interface MilkMonthData { entries: MilkDayEntry[]; paidOn: string; }
export interface MaidConfig {
  id: string; name: string; role: string; ratePerMonth: number; arrivalTime: string; mobile: string;
}
export interface MaidDayEntry { date: string; present: boolean; }
export interface MaidMonthData { entries: MaidDayEntry[]; paidOn: string; }

interface TrackerState {
  milkConfig: MilkConfig;
  milkData: Record<string, MilkMonthData>;
  maids: MaidConfig[];
  maidData: Record<string, Record<string, MaidMonthData>>;
  updateMilkConfig: (patch: Partial<MilkConfig>) => void;
  getMilkMonth: (year: number, month: number) => MilkMonthData;
  setMilkEntry: (monthKey: string, date: string, present: boolean, qty?: number) => void;
  setMilkPaidOn: (monthKey: string, paidOn: string) => void;
  addMaid: (maid: MaidConfig) => void;
  updateMaid: (id: string, patch: Partial<MaidConfig>) => void;
  removeMaid: (id: string) => void;
  setMaidEntry: (maidId: string, monthKey: string, date: string, present: boolean) => void;
  setMaidPaidOn: (maidId: string, monthKey: string, paidOn: string) => void;
}

const STORAGE_KEY = 'stocksy.tracker';

const defaultMilkConfig: MilkConfig = { ratePerKg: 80, milkPerDay: 2, milkmanName: 'Jitendra', milkmanMobile: '9876578654' };
const defaultMaids: MaidConfig[] = [
  { id: 'maid-1', name: 'Sunita', role: 'Cleaning Maid', ratePerMonth: 2500, arrivalTime: '11 AM & 5 PM', mobile: '9876543210' },
  { id: 'maid-2', name: 'Geeta', role: 'Cooking Maid', ratePerMonth: 2000, arrivalTime: '7 PM', mobile: '9876512345' },
];

function monthKey(year: number, month: number) { return `${year}-${String(month + 1).padStart(2, '0')}`; }

function ensureEntries<T extends { date: string }>(year: number, month: number, make: (dateStr: string) => T, existing?: T[]): T[] {
  const days = new Date(year, month + 1, 0).getDate();
  const map = new Map(existing?.map((e) => [e.date, e]));
  const out: T[] = [];
  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    out.push(map.get(dateStr) ?? make(dateStr));
  }
  return out;
}

const TrackerContext = createContext<TrackerState | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [milkConfig, setMilkConfig] = useState<MilkConfig>(defaultMilkConfig);
  const [milkData, setMilkData] = useState<Record<string, MilkMonthData>>({});
  const [maids, setMaids] = useState<MaidConfig[]>(defaultMaids);
  const [maidData, setMaidData] = useState<Record<string, Record<string, MaidMonthData>>>({});

  useEffect(() => { (async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setMilkConfig(parsed.milkConfig ?? defaultMilkConfig);
      setMilkData(parsed.milkData ?? {});
      setMaids(parsed.maids ?? defaultMaids);
      setMaidData(parsed.maidData ?? {});
    }
  })(); }, []);

  const persist = useCallback((next: Partial<TrackerState>) => {
    setMilkConfig((prev) => {
      const merged = { ...prev, ...next };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged.milkConfig ?? prev;
    });
  }, []);

  const saveAll = useCallback((data: { milkConfig?: MilkConfig; milkData?: Record<string, MilkMonthData>; maids?: MaidConfig[]; maidData?: Record<string, Record<string, MaidMonthData>> }) => {
    const merged = { milkConfig, milkData, maids, maidData, ...data };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, [milkConfig, milkData, maids, maidData]);

  const updateMilkConfig = useCallback((patch: Partial<MilkConfig>) => {
    setMilkConfig((prev) => { const next = { ...prev, ...patch }; saveAll({ milkConfig: next }); return next; });
  }, [saveAll]);

  const getMilkMonth = useCallback((year: number, month: number): MilkMonthData => {
    const key = monthKey(year, month);
    const existing = milkData[key];
    return { entries: ensureEntries(year, month, (d) => ({ date: d, qty: milkConfig.milkPerDay, present: true }), existing?.entries), paidOn: existing?.paidOn ?? '' };
  }, [milkData, milkConfig.milkPerDay]);

  const setMilkEntry = useCallback((key: string, date: string, present: boolean, qty?: number) => {
    setMilkData((prev) => {
      const month = prev[key] ?? { entries: [], paidOn: '' };
      const entries = month.entries.map((e) => e.date === date ? { date, present, qty: present ? (qty ?? e.qty) : 0 } : e);
      const next = { ...prev, [key]: { ...month, entries } };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ milkConfig, milkData: next, maids, maidData }));
      return next;
    });
  }, [milkConfig, maids, maidData]);

  const setMilkPaidOn = useCallback((key: string, paidOn: string) => {
    setMilkData((prev) => {
      const month = prev[key] ?? { entries: [], paidOn: '' };
      const next = { ...prev, [key]: { ...month, paidOn } };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ milkConfig, milkData: next, maids, maidData }));
      return next;
    });
  }, [milkConfig, maids, maidData]);

  const addMaid = useCallback((maid: MaidConfig) => { setMaids((prev) => { const next = [...prev, maid]; saveAll({ maids: next }); return next; }); }, [saveAll]);
  const updateMaid = useCallback((id: string, patch: Partial<MaidConfig>) => { setMaids((prev) => { const next = prev.map((m) => m.id === id ? { ...m, ...patch } : m); saveAll({ maids: next }); return next; }); }, [saveAll]);
  const removeMaid = useCallback((id: string) => { setMaids((prev) => { const next = prev.filter((m) => m.id !== id); saveAll({ maids: next }); return next; }); }, [saveAll]);

  const setMaidEntry = useCallback((maidId: string, key: string, date: string, present: boolean) => {
    setMaidData((prev) => {
      const maidMonths = prev[maidId] ?? {};
      const month = maidMonths[key] ?? { entries: [], paidOn: '' };
      const entries = month.entries.map((e) => e.date === date ? { date, present } : e);
      const next = { ...prev, [maidId]: { ...maidMonths, [key]: { ...month, entries } } };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ milkConfig, milkData, maids, maidData: next }));
      return next;
    });
  }, [milkConfig, milkData, maids]);

  const setMaidPaidOn = useCallback((maidId: string, key: string, paidOn: string) => {
    setMaidData((prev) => {
      const maidMonths = prev[maidId] ?? {};
      const month = maidMonths[key] ?? { entries: [], paidOn: '' };
      const next = { ...prev, [maidId]: { ...maidMonths, [key]: { ...month, paidOn } } };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ milkConfig, milkData, maids, maidData: next }));
      return next;
    });
  }, [milkConfig, milkData, maids]);

  const value = useMemo<TrackerState>(() => ({ milkConfig, milkData, maids, maidData, updateMilkConfig, setMilkEntry, setMilkPaidOn, addMaid, updateMaid, removeMaid, setMaidEntry, setMaidPaidOn, getMilkMonth }), [milkConfig, milkData, maids, maidData, updateMilkConfig, setMilkEntry, setMilkPaidOn, addMaid, updateMaid, removeMaid, setMaidEntry, setMaidPaidOn, getMilkMonth]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerState {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}

export { monthKey };
