import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Remove quotes and whitespace in case they were accidentally included in the secrets
let supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, '').trim();

// Если URL начинается с '/', значит мы используем прокси (Vercel или Vite)
// Добавляем текущий домен, так как Supabase JS требует абсолютный URL
if (supabaseUrl.startsWith('/')) {
  supabaseUrl = window.location.origin + supabaseUrl;
}

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
