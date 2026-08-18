import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { InventoryItem, User } from '@/types';
import { storage } from '@/utils/storage';

interface AppState {
  items: InventoryItem[]; user: User; isAuthed: boolean; hasOnboarded: boolean; loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithProvider: (provider: 'Google' | 'Apple' | 'Mobile OTP') => Promise<void>;
  logout: () => Promise<void>; completeOnboarding: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  deleteItem: (id: string) => void; adjustQuantity: (id: string, delta: number) => void;
  updateUser: (patch: Partial<User>) => void; clearCache: () => Promise<void>; deleteAccount: () => Promise<void>;
}

const defaultUser: User = { name: 'Rajesh Prajapati', email: 'rkpsap184@gmail.com', mobile: '9876578654', avatarColor: '#1d6fd1', householdSize: 4, notificationsEnabled: true, expiryAlerts: true, lowStockAlerts: true };
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [user, setUser] = useState<User>(defaultUser);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const [onboarded, authed, savedUser, savedItems] = await Promise.all([storage.hasOnboarded(), storage.getAuth(), storage.getUser(), storage.getItems()]);
    setHasOnboarded(onboarded); setIsAuthed(authed); setUser(savedUser ?? defaultUser); setItems(savedItems); setLoading(false);
  })(); }, []);

  const finishLogin = useCallback(async (identity?: string) => {
    const nextUser = identity ? { ...user, email: identity.includes('@') ? identity : user.email, mobile: identity.includes('@') ? user.mobile : identity, name: user.name || 'Rajesh Prajapati' } : user;
    setUser(nextUser); setIsAuthed(true); await storage.setUser(nextUser); await storage.setAuth(true);
  }, [user]);
  const signIn = useCallback(async (email: string, password: string) => { if (!email || password.length < 4) return { error: 'Enter a valid email and password.' }; await finishLogin(email); return { error: null }; }, [finishLogin]);
  const signUp = useCallback(async (email: string, password: string) => { if (!email || password.length < 4) return { error: 'Enter an email and a password with 4+ characters.' }; await finishLogin(email); return { error: null }; }, [finishLogin]);
  const loginWithProvider = useCallback(async (provider: 'Google' | 'Apple' | 'Mobile OTP') => { await finishLogin(provider === 'Mobile OTP' ? user.mobile : undefined); }, [finishLogin, user.mobile]);
  const logout = useCallback(async () => { setIsAuthed(false); await storage.setAuth(false); }, []);
  const completeOnboarding = useCallback(async () => { await storage.setOnboarded(); setHasOnboarded(true); }, []);
  const persist = useCallback((next: InventoryItem[]) => { setItems(next); void storage.setItems(next); }, []);
  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt'>) => { persist([{ ...item, id: `item-${Date.now()}`, createdAt: new Date().toISOString() }, ...items]); }, [items, persist]);
  const updateItem = useCallback((id: string, item: Omit<InventoryItem, 'id' | 'createdAt'>) => { persist(items.map((current) => current.id === id ? { ...item, id, createdAt: current.createdAt } : current)); }, [items, persist]);
  const deleteItem = useCallback((id: string) => persist(items.filter((item) => item.id !== id)), [items, persist]);
  const adjustQuantity = useCallback((id: string, delta: number) => persist(items.map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)), [items, persist]);
  const updateUser = useCallback((patch: Partial<User>) => { setUser((current) => { const next = { ...current, ...patch }; void storage.setUser(next); return next; }); }, []);
  const clearCache = useCallback(async () => { setItems([]); await storage.setItems([]); }, []);
  const deleteAccount = useCallback(async () => { setUser(defaultUser); setItems([]); setIsAuthed(false); await storage.clearData(); }, []);
  const value = useMemo(() => ({ items, user, isAuthed, hasOnboarded, loading, signUp, signIn, loginWithProvider, logout, completeOnboarding, addItem, updateItem, deleteItem, adjustQuantity, updateUser, clearCache, deleteAccount }), [items, user, isAuthed, hasOnboarded, loading, signUp, signIn, loginWithProvider, logout, completeOnboarding, addItem, updateItem, deleteItem, adjustQuantity, updateUser, clearCache, deleteAccount]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(): AppState { const ctx = useContext(AppContext); if (!ctx) throw new Error('useApp must be used within AppProvider'); return ctx; }
