import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !/^https?:\/\/.+\..+/.test(url)) {
  throw new Error(`Supabase URL is invalid or missing: "${url ?? ''}"`);
}
if (!key || key.length < 20) {
  throw new Error(`Supabase anon key is invalid or missing (len=${key?.length ?? 0})`);
}

export const supabase = createClient(url, key);