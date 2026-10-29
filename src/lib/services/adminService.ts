import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type {
  Profile,
  Listing,
  Report,
  VerificationRequest,
  Badge,
  AdminAuditLog,
} from '../../types/database';
import { STARTER_BADGES } from './gamificationService';

export interface AdminMetrics {
  totalUsers: number;
  onboardedUsers: number;
  publishedListings: number;
  pendingRequests: number;
  completedExchanges: number;
  pendingReports: number;
  pendingVerifications: number;
}

export class AdminService {
  /**
   * Checks whether the current user holds administrative privileges.
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('admin_users') as any)
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      return !error && Boolean(data);
    }

    // Local Preview fallback: allow admin access for demonstration/superadmin testing
    const devProfile = localStorage.getItem('pairly_dev_profile');
    if (devProfile) {
      const p = JSON.parse(devProfile);
      if (p.username?.includes('admin') || p.account_type === 'teacher' || localStorage.getItem('pairly_dev_is_admin') === 'true') {
        return true;
      }
    }
    return true; // Enable admin access in preview environment
  }

  /**
   * Retrieves real metrics derived from platform database records.
   */
  static async getPlatformMetrics(): Promise<AdminMetrics> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const [
        { count: totalUsers },
        { count: onboardedUsers },
        { count: publishedListings },
        { count: pendingRequests },
        { count: completedExchanges },
        { count: pendingReports },
        { count: pendingVerifications },
      ] = await Promise.all([
        (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
        (supabase.from('listings') as any).select('*', { count: 'exact', head: true }).eq('status', 'published'),
        (supabase.from('connection_requests') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        (supabase.from('exchanges') as any).select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        (supabase.from('reports') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        (supabase.from('verification_requests') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalUsers: totalUsers || 0,
        onboardedUsers: onboardedUsers || 0,
        publishedListings: publishedListings || 0,
        pendingRequests: pendingRequests || 0,
        completedExchanges: completedExchanges || 0,
        pendingReports: pendingReports || 0,
        pendingVerifications: pendingVerifications || 0,
      };
    }

    // Local Preview Storage counts
    const devListings = localStorage.getItem('pairly_dev_listings_list');
    const listingsCount = devListings ? JSON.parse(devListings).filter((l: any) => l.status === 'published').length : 3;

    const devRequests = localStorage.getItem('pairly_dev_connection_requests');
    const reqsCount = devRequests ? JSON.parse(devRequests).filter((r: any) => r.status === 'pending').length : 0;

    const devExchanges = localStorage.getItem('pairly_dev_exchanges');
    const exchsCount = devExchanges ? JSON.parse(devExchanges).filter((e: any) => e.status === 'completed').length : 0;

    const devReports = localStorage.getItem('pairly_dev_reports');
    const reportsCount = devReports ? JSON.parse(devReports).filter((r: any) => r.status === 'pending').length : 0;

    const devVerifs = localStorage.getItem('pairly_dev_verifications');
    const verifsCount = devVerifs ? JSON.parse(devVerifs).filter((v: any) => v.status === 'pending').length : 0;

    return {
      totalUsers: 4,
      onboardedUsers: 4,
      publishedListings: listingsCount,
      pendingRequests: reqsCount,
      completedExchanges: exchsCount,
      pendingReports: reportsCount,
      pendingVerifications: verifsCount,
    };
  }

  /**
   * Retrieves all content reports for moderation.
   */
  static async getAllReports(): Promise<Report[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('reports') as any)
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(*),
          reported_user:profiles!reports_reported_user_id_fkey(*),
          listing:listings(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as Report[];
    }

    const raw = localStorage.getItem('pairly_dev_reports');
    return raw ? JSON.parse(raw) : [];
  }

  /**
   * Updates report status with moderator note.
   */
  static async moderateReport(
    reportId: string,
    newStatus: 'in_review' | 'resolved' | 'dismissed',
    moderatorNote: string,
    adminId: string
  ): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.rpc as any)('admin_moderate_report', {
        p_report_id: reportId,
        p_status: newStatus,
        p_note: moderatorNote,
      });

      if (error) throw new Error(error.message);
      return;
    }

    const raw = localStorage.getItem('pairly_dev_reports');
    if (!raw) return;
    const list: Report[] = JSON.parse(raw);
    const r = list.find((rep) => rep.id === reportId);
    if (r) {
      r.status = newStatus;
      r.moderator_note = moderatorNote;
      r.reviewed_by = adminId;
      r.updated_at = new Date().toISOString();
      localStorage.setItem('pairly_dev_reports', JSON.stringify(list));
    }
  }

  /**
   * Retrieves all verification requests for administrator review.
   */
  static async getAllVerifications(): Promise<VerificationRequest[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('verification_requests') as any)
        .select('*, user:profiles(*)')
        .order('submitted_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as VerificationRequest[];
    }

    const raw = localStorage.getItem('pairly_dev_verifications');
    return raw ? JSON.parse(raw) : [];
  }

  /**
   * Moderates a verification request.
   */
  static async reviewVerification(
    requestId: string,
    newStatus: 'approved' | 'rejected',
    reviewerNote: string,
    adminId: string
  ): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.rpc as any)('admin_review_verification', {
        p_request_id: requestId,
        p_status: newStatus,
        p_note: reviewerNote,
      });

      if (error) throw new Error(error.message);
      return;
    }

    const raw = localStorage.getItem('pairly_dev_verifications');
    if (!raw) return;
    const list: VerificationRequest[] = JSON.parse(raw);
    const v = list.find((req) => req.id === requestId);
    if (v) {
      v.status = newStatus;
      v.reviewer_note = reviewerNote;
      v.reviewed_by = adminId;
      v.reviewed_at = new Date().toISOString();
      localStorage.setItem('pairly_dev_verifications', JSON.stringify(list));

      // Update local profile verification status if matches current user
      const devProfile = localStorage.getItem('pairly_dev_profile');
      if (devProfile) {
        const p: Profile = JSON.parse(devProfile);
        if (p.id === v.user_id) {
          p.verification_status = newStatus === 'approved' ? 'verified' : 'rejected';
          localStorage.setItem('pairly_dev_profile', JSON.stringify(p));
        }
      }
    }
  }

  /**
   * Toggles listing status (e.g., pausing an infringing listing).
   */
  static async updateListingStatus(
    listingId: string,
    status: 'published' | 'paused' | 'closed'
  ): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('listings') as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw new Error(error.message);
      return;
    }

    const raw = localStorage.getItem('pairly_dev_listings_list');
    if (!raw) return;
    const list: Listing[] = JSON.parse(raw);
    const item = list.find((l) => l.id === listingId);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      localStorage.setItem('pairly_dev_listings_list', JSON.stringify(list));
    }
  }
}
