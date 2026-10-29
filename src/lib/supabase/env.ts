/**
 * Environment configuration and validation for Supabase.
 * Supports both Vite (import.meta.env.VITE_*) and Next.js (process.env.NEXT_PUBLIC_*).
 */

export interface SupabaseEnvConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  isConfigured: boolean;
}

export function getSupabaseEnv(): SupabaseEnvConfig {
  const url = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    null;

  const key = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    null;

  const isConfigured = Boolean(
    url && 
    key && 
    url !== 'https://your-project.supabase.co' && 
    key !== 'your-anon-key' &&
    url.startsWith('https://')
  );

  return {
    supabaseUrl: url,
    supabaseAnonKey: key,
    isConfigured,
  };
}
