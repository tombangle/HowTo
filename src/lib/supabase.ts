import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // This will print on GitHub Pages if secrets weren't injected at build time
  console.error("❌ Supabase envs missing in bundle", {
    url_set: !!url,
    key_len: key?.length ?? 0,
  });
}

export const supabase = createClient(url ?? "", key ?? "");