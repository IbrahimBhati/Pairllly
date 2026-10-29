import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import { SkillsService, SEED_SKILLS } from './skillsService';
import type { Listing, ListingFormData, ListingStatus, SessionFormat, UserSkill, Profile } from '../../types/database';

const LOCAL_STORAGE_KEY_LISTINGS = 'pairly_dev_listings_list';

// Sample demonstration listings from other campus community peers
const INITIAL_COMMUNITY_LISTINGS: Listing[] = [
  {
    id: 'list-001',
    owner_id: 'peer-user-002',
    user_skill_id: 'usk-peer-001',
    title: 'Figma Prototyping & Design Systems Crash Course',
    description: '1-on-1 practical walkthrough of design system setup, component variants, auto-layout tricks, and clean developer handoff. Seeking academic English writing in return!',
    session_format: 'online',
    location: null,
    duration_minutes: 60,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    user_skill: {
      id: 'usk-peer-001',
      user_id: 'peer-user-002',
      skill_id: '2', // Graphic Design
      direction: 'offer',
      proficiency: 'advanced',
      notes: 'Figma specialist',
      skill: SEED_SKILLS.find((s) => s.id === '2'),
    },
    owner: {
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
  },
  {
    id: 'list-002',
    owner_id: 'peer-user-003',
    user_skill_id: 'usk-peer-002',
    title: 'English Academic Paper & Essay Editing',
    description: 'Graduate teaching assistant helping non-native writers polish clarity, structural pacing, literature citations, and grammar for journal or class submissions.',
    session_format: 'hybrid',
    location: 'Campus Main Library, 3rd Floor',
    duration_minutes: 45,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    user_skill: {
      id: 'usk-peer-002',
      user_id: 'peer-user-003',
      skill_id: '6', // English
      direction: 'offer',
      proficiency: 'expert',
      notes: 'Native English literature TA',
      skill: SEED_SKILLS.find((s) => s.id === '6'),
    },
    owner: {
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
  },
  {
    id: 'list-003',
    owner_id: 'peer-user-004',
    user_skill_id: 'usk-peer-003',
    title: 'Looking for Python / React Debugging Peer',
    description: 'Building my first web application and looking to exchange 1-on-1 tutoring. In exchange, I can provide digital marketing, SEO, and social growth consulting.',
    session_format: 'online',
    location: null,
    duration_minutes: 60,
    status: 'published',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_skill: {
      id: 'usk-peer-003',
      user_id: 'peer-user-004',
      skill_id: '1', // Programming
      direction: 'want',
      proficiency: null,
      notes: 'Goal: React & Python API',
      skill: SEED_SKILLS.find((s) => s.id === '1'),
    },
    owner: {
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
  },
];

export class ListingsService {
  /**
   * Retrieves discoverable published listings from public profiles.
   */
  static async getPublicListings(): Promise<Listing[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user_skill:user_skills(*, skill:skills(*)),
          owner:profiles(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as Listing[];
    }

    const localList = this.getLocalListings();
    return localList.filter(
      (l) => l.status === 'published' && l.owner?.profile_visibility !== 'private'
    );
  }

  /**
   * Retrieves all listings owned by a specific user (including drafts, paused, closed).
   */
  static async getMyListings(userId: string): Promise<Listing[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user_skill:user_skills(*, skill:skills(*)),
          owner:profiles(*)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as Listing[];
    }

    const localList = this.getLocalListings();
    return localList.filter((l) => l.owner_id === userId);
  }

  /**
   * Retrieves single listing by ID, enforcing privacy for non-owners.
   */
  static async getListingById(id: string, currentUserId?: string): Promise<Listing | null> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user_skill:user_skills(*, skill:skills(*)),
          owner:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) return null;
      return data as Listing;
    }

    const localList = this.getLocalListings();
    const match = localList.find((l) => l.id === id);
    if (!match) return null;

    // Do not expose drafts or non-public listings to unauthorized users
    if (match.status !== 'published' && match.owner_id !== currentUserId) {
      return null;
    }

    return match;
  }

  /**
   * Creates a new listing linked to a verified user_skill.
   */
  static async createListing(params: {
    ownerId: string;
    ownerProfile: Profile;
    data: ListingFormData;
  }): Promise<Listing> {
    // 1. Verify user_skill exists and belongs to the owner
    const userSkills = await SkillsService.getUserSkills(params.ownerId);
    const linkedSkill = userSkills.find((s) => s.id === params.data.user_skill_id);

    if (!linkedSkill) {
      throw new Error('You must link this listing to a skill from your profile.');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('listings') as any)
        .insert({
          owner_id: params.ownerId,
          user_skill_id: params.data.user_skill_id,
          title: params.data.title.trim(),
          description: params.data.description.trim(),
          session_format: params.data.session_format,
          location: params.data.location?.trim() || null,
          duration_minutes: params.data.duration_minutes || null,
          status: params.data.status,
        })
        .select(`
          *,
          user_skill:user_skills(*, skill:skills(*)),
          owner:profiles(*)
        `)
        .single();

      if (error) throw new Error(error.message);
      return data as Listing;
    }

    // Local Preview storage
    const localList = this.getLocalListings();
    const newListing: Listing = {
      id: 'list-' + Math.random().toString(36).substring(2, 9),
      owner_id: params.ownerId,
      user_skill_id: params.data.user_skill_id,
      title: params.data.title.trim(),
      description: params.data.description.trim(),
      session_format: params.data.session_format,
      location: params.data.location?.trim() || null,
      duration_minutes: params.data.duration_minutes || null,
      status: params.data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_skill: linkedSkill,
      owner: params.ownerProfile,
    };

    localList.unshift(newListing);
    this.saveLocalListings(localList);
    return newListing;
  }

  /**
   * Updates an existing listing.
   */
  static async updateListing(params: {
    listingId: string;
    ownerId: string;
    data: ListingFormData;
  }): Promise<Listing> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('listings') as any)
        .update({
          user_skill_id: params.data.user_skill_id,
          title: params.data.title.trim(),
          description: params.data.description.trim(),
          session_format: params.data.session_format,
          location: params.data.location?.trim() || null,
          duration_minutes: params.data.duration_minutes || null,
          status: params.data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.listingId)
        .eq('owner_id', params.ownerId)
        .select(`
          *,
          user_skill:user_skills(*, skill:skills(*)),
          owner:profiles(*)
        `)
        .single();

      if (error) throw new Error(error.message);
      return data as Listing;
    }

    const localList = this.getLocalListings();
    const idx = localList.findIndex((l) => l.id === params.listingId);
    if (idx < 0) throw new Error('Listing not found');
    if (localList[idx].owner_id !== params.ownerId) throw new Error('Unauthorized');

    const userSkills = await SkillsService.getUserSkills(params.ownerId);
    const linkedSkill = userSkills.find((s) => s.id === params.data.user_skill_id);

    localList[idx] = {
      ...localList[idx],
      user_skill_id: params.data.user_skill_id,
      title: params.data.title.trim(),
      description: params.data.description.trim(),
      session_format: params.data.session_format,
      location: params.data.location?.trim() || null,
      duration_minutes: params.data.duration_minutes || null,
      status: params.data.status,
      updated_at: new Date().toISOString(),
      user_skill: linkedSkill || localList[idx].user_skill,
    };

    this.saveLocalListings(localList);
    return localList[idx];
  }

  /**
   * Updates listing publication status (draft, published, paused, closed).
   */
  static async setListingStatus(
    listingId: string,
    ownerId: string,
    status: ListingStatus
  ): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('listings') as any)
        .update({ status })
        .eq('id', listingId)
        .eq('owner_id', ownerId);

      if (error) throw new Error(error.message);
      return;
    }

    const localList = this.getLocalListings();
    const idx = localList.findIndex((l) => l.id === listingId);
    if (idx >= 0 && localList[idx].owner_id === ownerId) {
      localList[idx].status = status;
      localList[idx].updated_at = new Date().toISOString();
      this.saveLocalListings(localList);
    }
  }

  /**
   * Deletes a listing.
   */
  static async deleteListing(listingId: string, ownerId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('owner_id', ownerId);

      if (error) throw new Error(error.message);
      return;
    }

    const localList = this.getLocalListings();
    const filtered = localList.filter((l) => l.id !== listingId || l.owner_id !== ownerId);
    this.saveLocalListings(filtered);
  }

  /**
   * Helper used by SkillsService to prevent deleting skills referenced by listings.
   */
  static async getListingsBySkill(userSkillId: string): Promise<Listing[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('user_skill_id', userSkillId);
      return (data || []) as Listing[];
    }

    const localList = this.getLocalListings();
    return localList.filter((l) => l.user_skill_id === userSkillId);
  }

  private static getLocalListings(): Listing[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_LISTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(
        LOCAL_STORAGE_KEY_LISTINGS,
        JSON.stringify(INITIAL_COMMUNITY_LISTINGS)
      );
      return INITIAL_COMMUNITY_LISTINGS;
    } catch (e) {
      console.warn('Error reading local listings:', e);
      return INITIAL_COMMUNITY_LISTINGS;
    }
  }

  private static saveLocalListings(list: Listing[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_LISTINGS, JSON.stringify(list));
  }
}
