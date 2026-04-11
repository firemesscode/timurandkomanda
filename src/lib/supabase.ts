import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Remove quotes and whitespace in case they were accidentally included in the secrets
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

// Use a simple fetch wrapper. The wrapper issue might be related to 'this' context.
const customFetch = (...args: Parameters<typeof fetch>) => {
  return window.fetch(...args);
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch,
      }
    }) 
  : null as any;
