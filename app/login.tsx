import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import {
  PackageCheck, Search, BellRing, ShieldCheck,
  Mail, Phone, ArrowRight, ChevronLeft,
} from 'lucide-react-native';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';

export default function LoginScreen() {
  const { signIn, signUp, completeOnboarding, hasOnboarded, loginWithProvider } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(!hasOnboarded);
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const slides = [
    { icon: PackageCheck, title: 'Track Everything', desc: 'Manage groceries, supplies, and household items in one place.' },
    { icon: Search, title: 'Find Instantly', desc: 'Search and filter across all rooms and categories in seconds.' },
    { icon: BellRing, title: 'Smart Alerts', desc: 'Get notified before items expire or run out of stock.' },
    { icon: ShieldCheck, title: 'Zero Waste', desc: 'Reduce food waste with timely expiry tracking.' },
  ];

  function finishOnboarding() { completeOnboarding(); setShowOnboarding(false); }
  function nextSlide() { if (slide < slides.length - 1) setSlide(slide + 1); else finishOnboarding(); }

  async function handleEmail() {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setLoading(true);
    const { error: authError } = isSignup ? await signUp(email, password) : await signIn(email, password);
    if (authError) setError(authError); else router.replace('/(tabs)/dashboard');
    setLoading(false);
  }

  async function handleProvider(provider: 'Google' | 'Apple' | 'Mobile OTP') {
    setLoading(true);
    await loginWithProvider(provider);
    router.replace('/(tabs)/dashboard');
    setLoading(false);
  }

  if (showOnboarding) {
    const Current = slides[slide].icon;
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-5 pt-14">
          <Pressable onPress={() => slide > 0 ? setSlide(slide - 1) : null} className="p-1">
            {slide > 0 && <ChevronLeft size={22} color="#64748b" />}
          </Pressable>
          {slide < slides.length - 1 ? (
            <Pressable onPress={finishOnboarding}><Text className="text-sm font-medium text-slate-400">Skip</Text></Pressable>
          ) : <View />}
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="items-center">
            <View className="h-28 w-28 rounded-3xl bg-primary-100 items-center justify-center mb-8">
              <Current size={56} strokeWidth={1.5} color="#1d6fd1" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">{slides[slide].title}</Text>
            <Text className="text-slate-500 text-center leading-relaxed max-w-[280px]">{slides[slide].desc}</Text>
          </View>
        </View>

        <View className="px-8 pb-12">
          <View className="flex-row justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <View key={i} className={`h-1.5 rounded-full ${i === slide ? 'w-6 bg-primary-500' : 'w-1.5 bg-slate-300'}`} />
            ))}
          </View>
          <Pressable onPress={nextSlide} className="bg-primary-600 rounded-xl py-4 flex-row items-center justify-center gap-2 active:opacity-80">
            <Text className="text-white font-semibold">{slide < slides.length - 1 ? 'Continue' : 'Get Started'}</Text>
            <ArrowRight size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-10 max-w-md w-full mx-auto">
          <View className="items-center mb-8">
            <View className="h-16 w-16 rounded-2xl bg-primary-600 items-center justify-center mb-3">
              <Text className="text-white font-bold text-2xl">S</Text>
            </View>
            <Text className="font-bold text-2xl text-slate-900">StockSy</Text>
            <Text className="text-slate-400 text-sm mt-1">Smart home inventory tracker</Text>
          </View>

          <Text className="text-xl font-bold text-slate-900 mb-1">{isSignup ? 'Create your account' : 'Welcome back'}</Text>
          <Text className="text-slate-500 mb-6">{isSignup ? 'Start managing your home inventory.' : 'Sign in to manage your inventory.'}</Text>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Email Address</Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5">
                <Mail size={18} color="#94a3b8" />
                <TextInput className="flex-1 px-2.5 py-3.5 text-base text-slate-900" placeholder="you@example.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Password</Text>
              <TextInput className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900" placeholder="••••••••" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            {!!error && <Text className="text-sm text-danger-600">{error}</Text>}
            <Pressable onPress={handleEmail} disabled={loading} className="bg-primary-600 rounded-xl py-4 flex-row items-center justify-center gap-2 active:opacity-80">
              {loading ? <ActivityIndicator color="#fff" /> : (<>
                <Text className="text-white font-semibold">{isSignup ? 'Create Account' : 'Sign In'}</Text>
                <ArrowRight size={18} color="#fff" />
              </>)}
            </Pressable>
          </View>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="px-3 text-xs text-slate-400 font-medium">OR CONTINUE WITH</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <View className="gap-3">
            <Pressable onPress={() => handleProvider('Mobile OTP')} className="flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 active:opacity-80">
              <Phone size={18} color="#1d6fd1" />
              <Text className="font-semibold text-slate-700">Mobile Number (OTP)</Text>
            </Pressable>
            <View className="flex-row gap-3">
              <Pressable onPress={() => handleProvider('Google')} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 active:opacity-80">
                <Text className="font-semibold text-slate-700">Google</Text>
              </Pressable>
              <Pressable onPress={() => handleProvider('Apple')} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 active:opacity-80">
                <Text className="font-semibold text-slate-700">Apple</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => { setIsSignup(!isSignup); setError(''); }} className="mt-8 self-center">
            <Text className="text-sm text-slate-500">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="font-semibold text-primary-600">{isSignup ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
