import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type {
  Report,
  ReportReason,
  UserBlock,
  VerificationRequest,
  VerificationMethod,
  Profile,
} from '../../types/database';

const LOCAL_KEY_BLOCKS = 'pairly_dev_user_blocks';
const LOCAL_KEY_REPORTS = 'pairly_dev_reports';
const LOCAL_KEY_VERIFICATIONS = 'pairly_dev_verifications';

export class SafetyService {
  /**
   * Reports a user or listing for policy violation.
   */
  static async submitReport(params: {
    reporterId: string;
    reportedUserId?: string | null;
    listingId?: string | null;
    reason: ReportReason;
    details?: string | null;
  }): Promise<Report> {
    if (!params.reportedUserId && !params.listingId) {
      throw new Error('Please specify a user or a listing to report.');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('reports') as any)
        .insert({
          reporter_id: params.reporterId,
          reported_user_id: params.reportedUserId || null,
          listing_id: params.listingId || null,
          reason: params.reason,
          details: params.details || null,
          status: 'pending',
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as Report;
    }

    // Local Preview Storage fallback
    const raw = localStorage.getItem(LOCAL_KEY_REPORTS);
    const list: Report[] = raw ? JSON.parse(raw) : [];

    const newReport: Report = {
      id: 'rep-' + Math.random().toString(36).substring(2, 9),
      reporter_id: params.reporterId,
      reported_user_id: params.reportedUserId || null,
      listing_id: params.listingId || null,
      reason: params.reason,
      details: params.details || null,
      status: 'pending',
      moderator_note: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    list.unshift(newReport);
    localStorage.setItem(LOCAL_KEY_REPORTS, JSON.stringify(list));
    return newReport;
  }

  /**
   * Blocks a user.
   */
  static async blockUser(blockerId: string, blockedId: string, blockedProfile?: Profile): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('You cannot block yourself.');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('user_blocks') as any).upsert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

      if (error) throw new Error(error.message);
      return;
    }

    const raw = localStorage.getItem(LOCAL_KEY_BLOCKS);
    const list: UserBlock[] = raw ? JSON.parse(raw) : [];

    if (!list.some((b) => b.blocker_id === blockerId && b.blocked_id === blockedId)) {
      list.push({
        id: 'blk-' + Math.random().toString(36).substring(2, 9),
        blocker_id: blockerId,
        blocked_id: blockedId,
        created_at: new Date().toISOString(),
        blocked_user: blockedProfile,
      });
      localStorage.setItem(LOCAL_KEY_BLOCKS, JSON.stringify(list));
    }
  }

  /**
   * Unblocks a previously blocked user.
   */
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('user_blocks') as any)
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

      if (error) throw new Error(error.message);
      return;
    }

    const raw = localStorage.getItem(LOCAL_KEY_BLOCKS);
    if (!raw) return;
    const list: UserBlock[] = JSON.parse(raw);
    const updated = list.filter((b) => !(b.blocker_id === blockerId && b.blocked_id === blockedId));
    localStorage.setItem(LOCAL_KEY_BLOCKS, JSON.stringify(updated));
  }

  /**
   * Retrieves all users blocked by the specified user.
   */
  static async getBlockedUsers(blockerId: string): Promise<UserBlock[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('user_blocks') as any)
        .select('*, blocked_user:profiles!user_blocks_blocked_id_fkey(*)')
        .eq('blocker_id', blockerId);

      if (!error && data) return data as UserBlock[];
    }

    const raw = localStorage.getItem(LOCAL_KEY_BLOCKS);
    if (!raw) return [];
    try {
      return JSON.parse(raw).filter((b: UserBlock) => b.blocker_id === blockerId);
    } catch {
      return [];
    }
  }

  /**
   * Submits university verification evidence or request.
   */
  static async submitVerificationRequest(params: {
    userId: string;
    method: VerificationMethod;
    evidenceUrl?: string;
    notes?: string;
  }): Promise<VerificationRequest> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('verification_requests') as any)
        .insert({
          user_id: params.userId,
          method: params.method,
          status: 'pending',
          private_evidence_path: params.evidenceUrl || null,
          reviewer_note: params.notes || null,
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as VerificationRequest;
    }

    const raw = localStorage.getItem(LOCAL_KEY_VERIFICATIONS);
    const list: VerificationRequest[] = raw ? JSON.parse(raw) : [];

    const newReq: VerificationRequest = {
      id: 'vr-' + Math.random().toString(36).substring(2, 9),
      user_id: params.userId,
      method: params.method,
      status: 'pending',
      private_evidence_path: params.evidenceUrl || null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      reviewer_note: params.notes || null,
    };

    list.unshift(newReq);
    localStorage.setItem(LOCAL_KEY_VERIFICATIONS, JSON.stringify(list));
    return newReq;
  }

  /**
   * Gets current verification request status for user.
   */
  static async getLatestVerificationRequest(userId: string): Promise<VerificationRequest | null> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data } = await (supabase.from('verification_requests') as any)
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data as VerificationRequest | null;
    }

    const raw = localStorage.getItem(LOCAL_KEY_VERIFICATIONS);
    if (!raw) return null;
    const list: VerificationRequest[] = JSON.parse(raw);
    return list.find((v) => v.user_id === userId) || null;
  }
}
