import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { Badge, UserBadge, PointsEntry } from '../../types/database';

export const STARTER_BADGES: Badge[] = [
  {
    id: 'badge-1',
    slug: 'first_exchange',
    name: 'First Exchange',
    description: 'Completed your very first reciprocal skill exchange session.',
    icon_name: 'Award',
    criteria_type: 'exchange_count',
    criteria_value: 1,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'badge-2',
    slug: 'helpful_member',
    name: 'Helpful Member',
    description: 'Completed 3 successful skill exchanges on campus.',
    icon_name: 'HeartHandshake',
    criteria_type: 'exchange_count',
    criteria_value: 3,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'badge-3',
    slug: 'knowledge_sharer',
    name: 'Knowledge Sharer',
    description: 'Shared knowledge across 5 distinct completed sessions.',
    icon_name: 'BookOpen',
    criteria_type: 'exchange_count',
    criteria_value: 5,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'badge-4',
    slug: 'consistent_collaborator',
    name: 'Consistent Collaborator',
    description: 'Earned stellar reviews with an average rating of 4.8 or higher.',
    icon_name: 'Star',
    criteria_type: 'rating_average',
    criteria_value: 48,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'badge-5',
    slug: 'community_builder',
    name: 'Community Builder',
    description: 'Completed 10 collaborative skill sessions on campus.',
    icon_name: 'Users',
    criteria_type: 'exchange_count',
    criteria_value: 10,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const LOCAL_KEY_USER_BADGES = 'pairly_dev_user_badges';
const LOCAL_KEY_POINTS = 'pairly_dev_points_ledger';

export class GamificationService {
  /**
   * Retrieves all active badges catalog.
   */
  static async getBadgesCatalog(): Promise<Badge[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('badges') as any)
        .select('*')
        .eq('is_active', true)
        .order('criteria_value', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Badge[];
      }
    }

    return STARTER_BADGES;
  }

  /**
   * Retrieves user's awarded badges.
   */
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('user_badges') as any)
        .select('*, badge:badges(*)')
        .eq('user_id', userId);

      if (!error && data) return data as UserBadge[];
    }

    const raw = localStorage.getItem(LOCAL_KEY_USER_BADGES);
    if (!raw) return [];
    try {
      const all: UserBadge[] = JSON.parse(raw);
      return all.filter((ub) => ub.user_id === userId);
    } catch {
      return [];
    }
  }

  /**
   * Retrieves user's total points and ledger entries.
   */
  static async getUserPoints(userId: string): Promise<{ total: number; entries: PointsEntry[] }> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('points_ledger') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const entries = data as PointsEntry[];
        const total = entries.reduce((acc, curr) => acc + (curr.points || 0), 0);
        return { total, entries };
      }
    }

    const raw = localStorage.getItem(LOCAL_KEY_POINTS);
    const entries: PointsEntry[] = raw ? JSON.parse(raw).filter((p: PointsEntry) => p.user_id === userId) : [];
    const total = entries.reduce((acc, curr) => acc + curr.points, 0);
    return { total, entries };
  }

  /**
   * Internal helper to record exchange completion and check for new badges.
   */
  static async recordExchangeCompletion(userId: string, exchangeId: string): Promise<void> {
    const eventKey = `exch_${exchangeId}_${userId}`;
    const raw = localStorage.getItem(LOCAL_KEY_POINTS);
    const list: PointsEntry[] = raw ? JSON.parse(raw) : [];

    if (!list.some((p) => p.user_id === userId && p.event_key === eventKey)) {
      list.push({
        id: 'pts-' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        event_key: eventKey,
        event_type: 'exchange_completed',
        points: 50,
        metadata: { exchange_id: exchangeId },
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_KEY_POINTS, JSON.stringify(list));
    }

    // Check count of completed exchanges
    const completedCount = list.filter(
      (p) => p.user_id === userId && p.event_type === 'exchange_completed'
    ).length;

    // Check and award badges
    const userBadgesRaw = localStorage.getItem(LOCAL_KEY_USER_BADGES);
    const userBadges: UserBadge[] = userBadgesRaw ? JSON.parse(userBadgesRaw) : [];

    const awardIfEligible = (slug: string, reqCount: number) => {
      const badge = STARTER_BADGES.find((b) => b.slug === slug);
      if (badge && completedCount >= reqCount) {
        const alreadyHas = userBadges.some(
          (ub) => ub.user_id === userId && (ub.badge_id === badge.id || ub.badge?.slug === slug)
        );
        if (!alreadyHas) {
          userBadges.push({
            id: 'ub-' + Math.random().toString(36).substring(2, 9),
            user_id: userId,
            badge_id: badge.id,
            awarded_at: new Date().toISOString(),
            badge,
          });
        }
      }
    };

    awardIfEligible('first_exchange', 1);
    awardIfEligible('helpful_member', 3);
    awardIfEligible('knowledge_sharer', 5);
    awardIfEligible('community_builder', 10);

    localStorage.setItem(LOCAL_KEY_USER_BADGES, JSON.stringify(userBadges));
  }
}
