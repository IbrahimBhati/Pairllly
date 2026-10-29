import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';
import type { Database } from '../../types/database';

let supabaseInstance: SupabaseClient<Database> | null = null;

export class SupabaseConfigurationError extends Error {
  constructor(message = 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.') {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

/**
 * Returns the singleton Supabase client or null if not yet configured.
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (supabaseInstance) return supabaseInstance;

  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Strict getter that throws if Supabase is unconfigured, for use in operational endpoints.
 */
export function requireSupabase(): SupabaseClient<Database> {
  const client = getSupabase();
  if (!client) {
    throw new SupabaseConfigurationError();
  }
  return client;
}
