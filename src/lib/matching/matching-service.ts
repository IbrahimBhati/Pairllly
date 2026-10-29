import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import { calculateMatchScore } from './scoring';
import type { SmartMatchCandidate } from './types';
import type { Profile, Skill, Listing, UserSkill } from '../../types/database';
import { SkillsService, SEED_SKILLS } from '../services/skillsService';
import { ListingsService } from '../services/listingsService';

export class MatchingService {
  /**
   * Computes deterministic Smart Matches for the given authenticated user against discoverable peers.
   */
  static async getMatchesForUser(currentUserId: string): Promise<SmartMatchCandidate[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    // 1. Get current user's skills
    const mySkills = await SkillsService.getUserSkills(currentUserId);
    const myOffers = mySkills
      .filter((s) => s.direction === 'offer' && s.skill)
      .map((s) => s.skill as Skill);
    const myWants = mySkills
      .filter((s) => s.direction === 'want' && s.skill)
      .map((s) => s.skill as Skill);

    if (myOffers.length === 0 && myWants.length === 0) {
      return [];
    }

    let candidateProfiles: Profile[] = [];
    let peerSkillsByUser: Record<string, { offers: Skill[]; wants: Skill[] }> = {};
    let allPublishedListings: Listing[] = [];

    if (supabase && env.isConfigured) {
      // Query blocked users
      const { data: blocks } = await (supabase.from('user_blocks') as any)
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      const blockedIds = new Set<string>();
      (blocks || []).forEach((b: { blocker_id: string; blocked_id: string }) => {
        blockedIds.add(b.blocker_id);
        blockedIds.add(b.blocked_id);
      });

      // Query public discoverable peers
      const { data: peers, error: peersErr } = await (supabase.from('profiles') as any)
        .select('*')
        .neq('id', currentUserId)
        .eq('profile_visibility', 'public')
        .eq('onboarding_completed', true)
        .limit(100);

      if (!peersErr && peers) {
        candidateProfiles = (peers as Profile[]).filter((p) => !blockedIds.has(p.id));
      }

      // Query skills for these candidates
      if (candidateProfiles.length > 0) {
        const candidateIds = candidateProfiles.map((p) => p.id);
        const { data: uSkills } = await (supabase.from('user_skills') as any)
          .select('*, skill:skills(*)')
          .in('user_id', candidateIds);

        (uSkills || []).forEach((us: UserSkill) => {
          if (!peerSkillsByUser[us.user_id]) {
            peerSkillsByUser[us.user_id] = { offers: [], wants: [] };
          }
          if (us.skill) {
            if (us.direction === 'offer') {
              peerSkillsByUser[us.user_id].offers.push(us.skill);
            } else {
              peerSkillsByUser[us.user_id].wants.push(us.skill);
            }
          }
        });
      }

      allPublishedListings = await ListingsService.getPublicListings();
    } else {
      // Local preview fallback peers
      const devProfileStr = localStorage.getItem('pairly_dev_profile');
      const devProfile: Profile | null = devProfileStr ? JSON.parse(devProfileStr) : null;

      const PEER_PROFILES: Profile[] = [
        {
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
        {
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
          created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'peer-user-004',
          username: 'elena_rodriguez',
          display_name: 'Elena Rodriguez',
          avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
          bio: 'Computer Science sophomore. Python developer looking to practice Spanish conversation.',
          account_type: 'student',
          institution: 'State University',
          department: 'Computer Science',
          location: 'Engineering Building Room 204',
          timezone: 'America/New_York',
          availability: 'Weekends & Tuesday evenings',
          profile_visibility: 'public',
          onboarding_completed: true,
          verification_status: 'unverified',
          created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ];

      // Exclude self if ID matches
      candidateProfiles = PEER_PROFILES.filter((p) => p.id !== currentUserId && p.id !== devProfile?.id);

      // Peer skills
      peerSkillsByUser['peer-user-002'] = {
        offers: [SEED_SKILLS.find((s) => s.id === '2')!].filter(Boolean), // Graphic Design
        wants: [SEED_SKILLS.find((s) => s.id === '6')!, SEED_SKILLS.find((s) => s.id === '1')!].filter(Boolean), // English, Python
      };
      peerSkillsByUser['peer-user-003'] = {
        offers: [SEED_SKILLS.find((s) => s.id === '6')!].filter(Boolean), // English
        wants: [SEED_SKILLS.find((s) => s.id === '2')!, SEED_SKILLS.find((s) => s.id === '3')!].filter(Boolean), // Graphic Design, Web Dev
      };
      peerSkillsByUser['peer-user-004'] = {
        offers: [SEED_SKILLS.find((s) => s.id === '1')!, SEED_SKILLS.find((s) => s.id === '3')!].filter(Boolean), // Python, Web Dev
        wants: [SEED_SKILLS.find((s) => s.id === '7')!, SEED_SKILLS.find((s) => s.id === '2')!].filter(Boolean), // Spanish, Graphic Design
      };

      allPublishedListings = await ListingsService.getPublicListings();
    }

    // 2. Score candidates
    const results: SmartMatchCandidate[] = [];

    for (const peer of candidateProfiles) {
      const skills = peerSkillsByUser[peer.id] || { offers: [], wants: [] };
      if (skills.offers.length === 0 && skills.wants.length === 0) continue;

      const scoreDetails = calculateMatchScore(
        peer.display_name,
        myOffers,
        myWants,
        skills.offers,
        skills.wants
      );

      // Only include candidates with at least some compatibility (or reciprocal match)
      if (scoreDetails.matchPercentage > 0 || scoreDetails.isReciprocal) {
        const relevantListings = allPublishedListings.filter((l) => l.owner_id === peer.id);
        results.push({
          userId: peer.id,
          profile: peer,
          scoreDetails,
          relevantListings,
        });
      }
    }

    // Sort: reciprocal matches first, then matchPercentage descending
    return results.sort((a, b) => {
      if (a.scoreDetails.isReciprocal && !b.scoreDetails.isReciprocal) return -1;
      if (!a.scoreDetails.isReciprocal && b.scoreDetails.isReciprocal) return 1;
      return b.scoreDetails.matchPercentage - a.scoreDetails.matchPercentage;
    });
  }
}
