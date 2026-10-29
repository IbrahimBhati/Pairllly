/**
 * Server-side Supabase client pattern.
 * In a server context (Next.js SSR or Express), this helper provides access using
 * either user-scoped tokens or privileged service keys only when genuinely required.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import { getSupabaseEnv } from './env';

export function createServerSupabaseClient(accessToken?: string): SupabaseClient<Database> | null {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}
