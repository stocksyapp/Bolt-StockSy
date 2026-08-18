import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, ChefHat, Search, Clock, Users, Star, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';

interface Recipe {
  id: string; name: string; category: string; cookTime: string; servings: number; rating: number; ingredients: string[]; steps: string[]; saved: boolean;
}

const SAMPLE_RECIPES: Recipe[] = [
  { id: '1', name: 'Vegetable Biryani', category: 'Lunch', cookTime: '45 min', servings: 4, rating: 4.8, ingredients: ['2 cups Basmati Rice', 'Mixed vegetables', 'Biryani masala', 'Yogurt', 'Onions', 'Saffron'], steps: ['Soak rice for 30 min', 'Cook vegetables with spices', 'Layer rice and vegetables', 'Steam on low heat for 20 min'], saved: false },
  { id: '2', name: 'Paneer Butter Masala', category: 'Dinner', cookTime: '30 min', servings: 3, rating: 4.9, ingredients: ['200g Paneer', 'Butter', 'Tomato puree', 'Cream', 'Garam masala', 'Kasuri methi'], steps: ['Saute tomatoes and spices', 'Blend into smooth gravy', 'Add paneer cubes', 'Simmer and add cream'], saved: true },
  { id: '3', name: 'Masala Dosa', category: 'Breakfast', cookTime: '60 min', servings: 4, rating: 4.7, ingredients: ['Rice batter', 'Potato filling', 'Dosa masala', 'Curry leaves'], steps: ['Prepare batter overnight', 'Cook potato masala filling', 'Spread batter on pan', 'Add filling and fold'], saved: false },
  { id: '4', name: 'Mango Lassi', category: 'Beverage', cookTime: '10 min', servings: 2, rating: 4.6, ingredients: ['1 cup Yogurt', 'Ripe mango', 'Sugar', 'Cardamom'], steps: ['Blend yogurt and mango', 'Add sugar and cardamom', 'Serve chilled'], saved: false },
  { id: '5', name: 'Aloo Paratha', category: 'Breakfast', cookTime: '40 min', servings: 3, rating: 4.9, ingredients: ['Wheat flour', 'Potato', 'Spices', 'Butter'], steps: ['Make potato filling', 'Roll dough balls', 'Stuff and roll', 'Cook with butter'], saved: true },
  { id: '6', name: 'Chicken Curry', category: 'Dinner', cookTime: '50 min', servings: 4, rating: 4.8, ingredients: ['500g Chicken', 'Onions', 'Tomato', 'Curry masala', 'Ginger-garlic paste'], steps: ['Saute onions and spices', 'Add chicken pieces', 'Cook with tomato gravy', 'Simmer until tender'], saved: false },
];

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Beverage'];

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = recipes.filter((r) => {
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (category !== 'All' && r.category !== category) return false;
    return true;
  });

  function toggleSave(id: string) {
    setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, saved: !r.saved } : r));
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <Pressable onPress={() => router.push('/(tabs)/more')} className="p-1.5"><ArrowLeft size={22} color="#475569" /></Pressable>
        <View className="flex-1"><Text className="text-lg font-bold text-slate-900">Recipes</Text><Text className="text-xs text-slate-400">Discover and save recipes</Text></View>
        <ChefHat size={22} color="#059669" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, padding: 20, gap: 16 }}>
        <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5">
          <Search size={18} color="#94a3b8" />
          <TextInput className="flex-1 px-2.5 py-3.5 text-base text-slate-900" placeholder="Search recipes…" placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} className={`px-3 py-1.5 rounded-full ${category === c ? 'bg-primary-600' : 'bg-white border border-slate-200'}`}>
              <Text className={`text-sm font-medium ${category === c ? 'text-white' : 'text-slate-600'}`}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((recipe) => (
          <View key={recipe.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ shadowColor: '#1d6fd1', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
            <Pressable onPress={() => setExpanded(expanded === recipe.id ? null : recipe.id)} className="p-4 active:opacity-80">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="font-bold text-slate-900 text-base">{recipe.name}</Text>
                  <View className="flex-row items-center gap-3 mt-2">
                    <View className="flex-row items-center gap-1"><Clock size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{recipe.cookTime}</Text></View>
                    <View className="flex-row items-center gap-1"><Users size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{recipe.servings} servings</Text></View>
                    <View className="flex-row items-center gap-1"><Star size={13} color="#f59e0b" /><Text className="text-xs text-slate-500">{recipe.rating}</Text></View>
                  </View>
                  <View className="mt-2"><View className="bg-accent-100 rounded-full px-2.5 py-0.5 self-start"><Text className="text-xs font-medium text-accent-700">{recipe.category}</Text></View></View>
                </View>
                <Pressable onPress={() => toggleSave(recipe.id)} className="p-2">
                  {recipe.saved ? <BookmarkCheck size={22} color="#1d6fd1" /> : <Bookmark size={22} color="#cbd5e1" />}
                </Pressable>
              </View>
            </Pressable>

            {expanded === recipe.id && (
              <View className="px-4 pb-4 gap-4 border-t border-slate-100 pt-4">
                <View>
                  <Text className="font-semibold text-slate-900 text-sm mb-2">Ingredients</Text>
                  {recipe.ingredients.map((ing, i) => <View key={i} className="flex-row items-center gap-2 py-0.5"><View className="h-1.5 w-1.5 rounded-full bg-primary-400" /><Text className="text-sm text-slate-600">{ing}</Text></View>)}
                </View>
                <View>
                  <Text className="font-semibold text-slate-900 text-sm mb-2">Steps</Text>
                  {recipe.steps.map((step, i) => <View key={i} className="flex-row gap-3 py-1"><View className="h-6 w-6 rounded-full bg-primary-100 items-center justify-center"><Text className="text-xs font-bold text-primary-700">{i + 1}</Text></View><Text className="text-sm text-slate-600 flex-1 mt-0.5">{step}</Text></View>)}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
