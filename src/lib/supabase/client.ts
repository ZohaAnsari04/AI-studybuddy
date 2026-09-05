import { createClient } from '@supabase/supabase-js';

const env: Record<string, string | undefined> = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? (import.meta.env as unknown as Record<string, string | undefined>) 
  : (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'));

// Fallback mock client wrapper if environment variables are not yet provided
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
