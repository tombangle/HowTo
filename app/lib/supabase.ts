// lib/supabase.ts
import 'react-native-url-polyfill/auto'; // needed for URL in RN/Expo
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Use env if you have them, else fall back to your literals
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wvkdljqkbcbflzyyffom.supabase.co';

// Supabase now issues "publishable" client keys that start with sb_publishable_…
// That's OK to use in the client.
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2rAxcJ_Aq7NGpbikeBgkxA_DSluvC8K';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: AsyncStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});