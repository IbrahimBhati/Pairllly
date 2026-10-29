import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { UserSettings } from '../../types/database';

const DEFAULT_SETTINGS: UserSettings = {
  user_id: '',
  email_notifications: true,
  request_notifications: true,
  message_notifications: true,
  exchange_reminders: true,
  theme: 'system',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export class SettingsService {
  /**
   * Retrieves preferences for the given user.
   */
  static async getUserSettings(userId: string): Promise<UserSettings> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('user_settings') as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) return data as UserSettings;
    }

    const key = `pairly_settings_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    return { ...DEFAULT_SETTINGS, user_id: userId };
  }

  /**
   * Updates notification and privacy preferences.
   */
  static async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('user_settings') as any)
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as UserSettings;
    }

    const current = await this.getUserSettings(userId);
    const updated: UserSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(`pairly_settings_${userId}`, JSON.stringify(updated));
    return updated;
  }

  /**
   * Completely deletes the user's account and associated data.
   */
  static async deleteAccount(userId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      // In Supabase, deleting profile cascades via foreign keys to listings, user_skills, requests, etc.
      const { error } = await (supabase.from('profiles') as any).delete().eq('id', userId);
      if (error) throw new Error(error.message);
      await supabase.auth.signOut();
      return;
    }

    // Clear dev preview local storage keys
    localStorage.removeItem('pairly_dev_profile');
    localStorage.removeItem('pairly_dev_session');
    localStorage.removeItem(`pairly_dev_user_skills_${userId}`);
    localStorage.removeItem(`pairly_settings_${userId}`);
  }
}
