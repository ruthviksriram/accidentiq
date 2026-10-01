import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://odiwqvhjrrtchzsojfjp.supabase.co';
const defaultKey = 'sb_publishable_BrNGi_9GXVaaNCNTzBL0NQ_tGMPnfIi';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || defaultUrl;
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  defaultKey;

export const supabase = createClient(
  supabaseUrl || '',
  supabasePublishableKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

export default supabase;
