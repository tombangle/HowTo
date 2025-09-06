import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://wvkdljqkbcbflzyyffom.supabase.co';
const supabaseKey = 'sb_publishable_2rAxcJ_Aq7NGpbikeBgkxA_DSluvC8K';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };