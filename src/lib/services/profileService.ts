import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { Profile } from '../../types/database';

export class ProfileService {
  /**
   * Retrieves public profile by username handle.
   */
  static async getProfileByUsername(
    username: string,
    currentUserId?: string
  ): Promise<Profile | null> {
    const cleanHandle = username.toLowerCase().trim();
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanHandle)
        .single();

      if (error) return null;
      const profile = data as Profile;

      // If private and not viewed by owner, block access
      if (profile.profile_visibility === 'private' && profile.id !== currentUserId) {
        return null;
      }
      return profile;
    }

    // Local Preview Storage
    const stored = localStorage.getItem('pairly_dev_profile');
    if (stored) {
      const p: Profile = JSON.parse(stored);
      if (p.username.toLowerCase() === cleanHandle) {
        return p;
      }
    }

    // Check peers
    const peers: Record<string, Profile> = {
      maya_lin: {
        id: 'peer-user-002',
        username: 'maya_lin',
        display_name: 'Maya Lin',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        bio: 'Third-year Interaction Design student passionate about accessible design.',
        account_type: 'student',
        institution: 'University College of Art & Design',
        department: 'Interaction Design',
        location: 'Campus Studio A',
        timezone: 'America/New_York',
        availability: 'Wednesdays & Fridays after 2 PM',
        profile_visibility: 'public',
        onboarding_completed: true,
        verification_status: 'verified',
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      david_miller: {
        id: 'peer-user-003',
        username: 'david_miller',
        display_name: 'David Miller',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        bio: 'English Literature TA. Helping peers master academic essays.',
        account_type: 'teacher',
        institution: 'State University',
        department: 'Humanities & Literature',
        location: 'North Campus',
        timezone: 'America/New_York',
        availability: 'Flexible weekday afternoons',
        profile_visibility: 'public',
        onboarding_completed: true,
        verification_status: 'verified',
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      sam_growth: {
        id: 'peer-user-004',
        username: 'sam_growth',
        display_name: 'Samantha Vance',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        bio: 'Digital marketing strategist looking to transition into software engineering.',
        account_type: 'professional',
        institution: 'Independent Consultant',
        department: 'Marketing & Tech',
        location: 'Remote',
        timezone: 'America/Chicago',
        availability: 'Evenings and Saturday mornings',
        profile_visibility: 'public',
        onboarding_completed: true,
        verification_status: 'unverified',
        created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    };

    const peer = peers[cleanHandle];
    if (peer) {
      if (peer.profile_visibility === 'private' && peer.id !== currentUserId) {
        return null;
      }
      return peer;
    }

    return null;
  }

  /**
   * Updates allowed profile attributes without escalating verification_status or roles.
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile> {
    // Explicitly omit privileged fields
    const safeUpdates: Partial<Profile> = {
      display_name: updates.display_name?.trim(),
      username: updates.username?.toLowerCase().trim(),
      avatar_url: updates.avatar_url?.trim() || null,
      bio: updates.bio?.trim() || null,
      institution: updates.institution?.trim() || null,
      department: updates.department?.trim() || null,
      location: updates.location?.trim() || null,
      timezone: updates.timezone?.trim() || null,
      availability: updates.availability?.trim() || null,
      profile_visibility: updates.profile_visibility,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('profiles') as any)
        .update(safeUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    }

    // Local Preview storage
    const stored = localStorage.getItem('pairly_dev_profile');
    const current = stored ? JSON.parse(stored) : {};
    const updated = {
      ...current,
      ...safeUpdates,
      id: userId,
    };
    localStorage.setItem('pairly_dev_profile', JSON.stringify(updated));
    return updated as Profile;
  }
}
