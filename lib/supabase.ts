// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
// Use AsyncStorage only on the client (browser/native)
let AsyncStorage: any = undefined;
const isServer = typeof window === 'undefined';

if (!isServer) {
  // Dynamically require to avoid touching window during SSR
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wvkdljqkbcbflzyyffom.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2rAxcJ_Aq7NGpbikeBgkxA_DSluvC8K';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // On the server (static export), do not use storage or auto refresh
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: !isServer,
    storage: isServer ? undefined : AsyncStorage,
  },
});