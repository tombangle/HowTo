import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    `❌ Missing Supabase envs in bundle.
     url_set=${!!url}, key_len=${key?.length ?? 0}.
     Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in GitHub repo secrets.`
  );
}

export const supabase = createClient(url, key);