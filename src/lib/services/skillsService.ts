import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { UserSkill, Skill, SkillProficiency } from '../../types/database';

export const SEED_SKILLS: Skill[] = [
  { id: '1', name: 'Programming', slug: 'programming', category: 'Technology', description: 'Web development, mobile apps, algorithms, software engineering, and clean code.', is_active: true, created_at: '2026-10-29' },
  { id: '2', name: 'Graphic Design', slug: 'graphic-design', category: 'Creative & Design', description: 'Visual identity, logo design, illustration, layout, and brand assets.', is_active: true, created_at: '2026-10-29' },
  { id: '3', name: 'Photography', slug: 'photography', category: 'Creative & Design', description: 'Camera composition, lighting, photo editing, and portrait or landscape capture.', is_active: true, created_at: '2026-10-29' },
  { id: '4', name: 'Video Editing', slug: 'video-editing', category: 'Creative & Design', description: 'Post-production, pacing, color grading, sound design, and motion cuts.', is_active: true, created_at: '2026-10-29' },
  { id: '5', name: 'Writing', slug: 'writing', category: 'Communication', description: 'Essay composition, storytelling, copywriting, academic papers, and technical docs.', is_active: true, created_at: '2026-10-29' },
  { id: '6', name: 'English', slug: 'english', category: 'Languages', description: 'Grammar, conversational fluency, pronunciation, and academic literature.', is_active: true, created_at: '2026-10-29' },
  { id: '7', name: 'Mathematics', slug: 'mathematics', category: 'Academics', description: 'Calculus, linear algebra, discrete math, statistics, and applied problem solving.', is_active: true, created_at: '2026-10-29' },
  { id: '8', name: 'Public Speaking', slug: 'public-speaking', category: 'Communication', description: 'Stage presence, speech crafting, presentation delivery, and debate technique.', is_active: true, created_at: '2026-10-29' },
  { id: '9', name: 'UI/UX Design', slug: 'ui-ux-design', category: 'Creative & Design', description: 'User research, wireframing, Figma prototyping, and design system building.', is_active: true, created_at: '2026-10-29' },
  { id: '10', name: 'Digital Marketing', slug: 'digital-marketing', category: 'Business', description: 'SEO, social media growth, email campaigns, and analytics tracking.', is_active: true, created_at: '2026-10-29' },
  { id: '11', name: 'Excel', slug: 'excel', category: 'Business', description: 'Data cleaning, advanced formulas, pivot tables, lookup models, and dashboards.', is_active: true, created_at: '2026-10-29' },
  { id: '12', name: 'Research', slug: 'research', category: 'Academics', description: 'Literature review, empirical methodology, qualitative analysis, and citations.', is_active: true, created_at: '2026-10-29' },
  { id: '13', name: 'Tutoring', slug: 'tutoring', category: 'Academics', description: 'Study planning, peer mentoring, concept mastery, and exam preparation.', is_active: true, created_at: '2026-10-29' },
  { id: '14', name: 'Career Guidance', slug: 'career-guidance', category: 'Professional', description: 'Resume review, interview practice, portfolio curation, and networking strategies.', is_active: true, created_at: '2026-10-29' },
  { id: '15', name: 'Content Creation', slug: 'content-creation', category: 'Media', description: 'Short-form video, scriptwriting, community building, and creative storytelling.', is_active: true, created_at: '2026-10-29' },
];

const LOCAL_STORAGE_KEY_USER_SKILLS = 'pairly_dev_user_skills_list';

export class SkillsService {
  static async getCatalog(): Promise<Skill[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();
    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw new Error(error.message);
      return data as Skill[];
    }
    return SEED_SKILLS;
  }

  static async getUserSkills(userId: string): Promise<UserSkill[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();
    if (supabase && env.isConfigured) {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return data as UserSkill[];
    }

    // Local Preview Storage
    return this.getLocalUserSkills(userId);
  }

  static async addSkill(params: {
    userId: string;
    skillId: string;
    direction: 'offer' | 'want';
    proficiency?: SkillProficiency;
    notes?: string;
  }): Promise<UserSkill> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('user_skills') as any)
        .insert({
          user_id: params.userId,
          skill_id: params.skillId,
          direction: params.direction,
          proficiency: params.direction === 'offer' ? (params.proficiency || 'intermediate') : null,
          notes: params.notes || null,
        })
        .select('*, skill:skills(*)')
        .single();

      if (error) throw new Error(error.message);
      return data as UserSkill;
    }

    // Local Preview fallback
    const list = this.getLocalUserSkills(params.userId);
    const existing = list.find(
      (s) => s.skill_id === params.skillId && s.direction === params.direction
    );
    if (existing) {
      throw new Error(`You have already added this skill under ${params.direction.toUpperCase()}`);
    }

    const skillObj = SEED_SKILLS.find((s) => s.id === params.skillId);
    const newEntry: UserSkill = {
      id: 'usk-' + Math.random().toString(36).substring(2, 9),
      user_id: params.userId,
      skill_id: params.skillId,
      direction: params.direction,
      proficiency: params.direction === 'offer' ? (params.proficiency || 'intermediate') : null,
      notes: params.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      skill: skillObj,
    };

    list.push(newEntry);
    this.saveLocalUserSkills(list);
    return newEntry;
  }

  static async updateSkill(params: {
    userSkillId: string;
    proficiency?: SkillProficiency;
    notes?: string;
  }): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('user_skills') as any)
        .update({
          proficiency: params.proficiency,
          notes: params.notes,
        })
        .eq('id', params.userSkillId);

      if (error) throw new Error(error.message);
      return;
    }

    const list = this.getLocalUserSkills();
    const idx = list.findIndex((s) => s.id === params.userSkillId);
    if (idx >= 0) {
      list[idx].proficiency = params.proficiency || list[idx].proficiency;
      list[idx].notes = params.notes !== undefined ? params.notes : list[idx].notes;
      list[idx].updated_at = new Date().toISOString();
      this.saveLocalUserSkills(list);
    }
  }

  static async removeSkill(userSkillId: string, userId: string): Promise<void> {
    // Check if any listing references this user_skill before deletion
    const { ListingsService } = await import('./listingsService');
    const referencingListings = await ListingsService.getListingsBySkill(userSkillId);
    if (referencingListings.length > 0) {
      throw new Error(
        `Cannot remove this skill because it is linked to an existing listing ("${referencingListings[0].title}"). Please close or delete the listing first.`
      );
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', userSkillId)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return;
    }

    const list = this.getLocalUserSkills();
    const filtered = list.filter((s) => s.id !== userSkillId);
    this.saveLocalUserSkills(filtered);
  }

  private static getLocalUserSkills(userId?: string): UserSkill[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USER_SKILLS);
      if (stored) {
        const parsed: UserSkill[] = JSON.parse(stored);
        if (userId) return parsed.filter((s) => s.user_id === userId);
        return parsed;
      }

      // Initialize from onboarding defaults if available
      const legacy = localStorage.getItem('pairly_dev_user_skills');
      if (legacy) {
        const { offered = [], wanted = [] } = JSON.parse(legacy);
        const seeded: UserSkill[] = [];
        const uId = userId || 'dev-user-001';

        offered.forEach((o: any) => {
          seeded.push({
            id: 'usk-off-' + o.skill_id,
            user_id: uId,
            skill_id: o.skill_id,
            direction: 'offer',
            proficiency: o.proficiency || 'intermediate',
            notes: o.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skill: SEED_SKILLS.find((s) => s.id === o.skill_id),
          });
        });

        wanted.forEach((w: any) => {
          seeded.push({
            id: 'usk-wnt-' + w.skill_id,
            user_id: uId,
            skill_id: w.skill_id,
            direction: 'want',
            proficiency: null,
            notes: w.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skill: SEED_SKILLS.find((s) => s.id === w.skill_id),
          });
        });

        localStorage.setItem(LOCAL_STORAGE_KEY_USER_SKILLS, JSON.stringify(seeded));
        return seeded;
      }
    } catch (e) {
      console.warn('Error reading local user skills:', e);
    }
    return [];
  }

  private static saveLocalUserSkills(list: UserSkill[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER_SKILLS, JSON.stringify(list));
  }
}
