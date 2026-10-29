import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Layers,
  Inbox,
  ArrowRightLeft,
  AlertTriangle,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { AdminService, AdminMetrics } from '../../lib/services/adminService';
import { ListingsService } from '../../lib/services/listingsService';
import { useAuth } from '../../context/AuthContext';
import type { Report, VerificationRequest, Listing } from '../../types/database';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'verifications' | 'listings'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation action modal state
  const [moderatingReport, setModeratingReport] = useState<Report | null>(null);
  const [reportAction, setReportAction] = useState<'resolved' | 'dismissed'>('resolved');
  const [moderatorNote, setModeratorNote] = useState('');
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);

  // Verification modal state
  const [reviewingVerification, setReviewingVerification] = useState<VerificationRequest | null>(null);
  const [verifAction, setVerifAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewerNote, setReviewerNote] = useState('');

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const adminAuthorized = await AdminService.isUserAdmin(user.id);
      setIsAdmin(adminAuthorized);

      if (!adminAuthorized) {
        setIsLoading(false);
        return;
      }

      const [m, r, v, l] = await Promise.all([
        AdminService.getPlatformMetrics(),
        AdminService.getAllReports(),
        AdminService.getAllVerifications(),
        ListingsService.getPublicListings(),
      ]);

      setMetrics(m);
      setReports(r);
      setVerifications(v);
      setListings(l);
    } catch (err) {
      setError((err as Error).message || 'Failed to load administration data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleModerateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingReport || !user) return;
    setIsSubmittingMod(true);
    try {
      await AdminService.moderateReport(
        moderatingReport.id,
        reportAction,
        moderatorNote.trim() || 'Reviewed by admin.',
        user.id
      );
      setModeratingReport(null);
      setModeratorNote('');
      await loadData();
    } catch (err) {
      setError((err as Error).message || 'Failed to moderate report');
    } finally {
      setIsSubmittingMod(false);
    }
  };

  const handleReviewVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingVerification || !user) return;
    setIsSubmittingMod(true);
    try {
      await AdminService.reviewVerification(
        reviewingVerification.id,
        verifAction,
        reviewerNote.trim() || 'Verification decision rendered.',
        user.id
      );
      setReviewingVerification(null);
      setReviewerNote('');
      await loadData();
    } catch (err) {
      setError((err as Error).message || 'Failed to update verification request');
    } finally {
      setIsSubmittingMod(false);
    }
  };

  const handleListingStatusToggle = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'paused' : 'published';
    try {
      await AdminService.updateListingStatus(listingId, nextStatus);
      await loadData();
    } catch (err) {
      setError((err as Error).message || 'Failed to update listing status');
    }
  };

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#1F2937]">Access Denied</h2>
        <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
          You do not hold authorized administrator privileges to access this console.
        </p>
        <Button
          onClick={() => onNavigate('/dashboard')}
          className="mt-6 bg-[#4B3F72] text-white text-xs"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Administration & Safety Console"
        description="Monitor university platform metrics, review content reports, and verify academic credentials."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          Platform Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <span>Safety Reports</span>
          {metrics && metrics.pendingReports > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
              {metrics.pendingReports}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'verifications'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <span>Verifications</span>
          {metrics && metrics.pendingVerifications > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {metrics.pendingVerifications}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'listings'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          Listings Moderation
        </button>
      </div>

      {/* Tab: Overview Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="border-[#E2E8F0]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-[#4B3F72] rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] font-semibold uppercase">Total Members</span>
                  <h3 className="text-xl font-bold text-[#1F2937] mt-0.5">{metrics?.totalUsers || 0}</h3>
                  <span className="text-[10px] text-[#94A3B8]">{metrics?.onboardedUsers || 0} onboarded</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] font-semibold uppercase">Published Listings</span>
                  <h3 className="text-xl font-bold text-[#1F2937] mt-0.5">{metrics?.publishedListings || 0}</h3>
                  <span className="text-[10px] text-[#94A3B8]">Active campus listings</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-[#047857] rounded-xl">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] font-semibold uppercase">Completed Exchanges</span>
                  <h3 className="text-xl font-bold text-[#1F2937] mt-0.5">{metrics?.completedExchanges || 0}</h3>
                  <span className="text-[10px] text-[#94A3B8]">Dual-verified sessions</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] font-semibold uppercase">Pending Requests</span>
                  <h3 className="text-xl font-bold text-[#1F2937] mt-0.5">{metrics?.pendingRequests || 0}</h3>
                  <span className="text-[10px] text-[#94A3B8]">Awaiting response</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3 border-b border-[#F1F5F9]">
              <CardTitle className="text-sm text-[#1F2937]">Platform Trust & Verification Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-[#1F2937]">Pending Safety Reports Requiring Action:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  (metrics?.pendingReports || 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {metrics?.pendingReports || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-[#1F2937]">Academic Verification Inquiries:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  (metrics?.pendingVerifications || 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {metrics?.pendingVerifications || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((rep) => (
              <Card key={rep.id} className="border-[#E2E8F0]">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                          {rep.reason.replace('_', ' ')}
                        </span>
                        <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 font-mono">
                        Reported on {new Date(rep.created_at).toLocaleString()}
                      </p>
                    </div>

                    {rep.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setModeratingReport(rep);
                          setReportAction('resolved');
                        }}
                        className="text-xs bg-[#4B3F72] hover:bg-[#3d335d] text-white"
                      >
                        Take Action
                      </Button>
                    )}
                  </div>

                  {rep.details && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-[#334155] border border-slate-100">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-0.5">
                        Reporter Statement:
                      </span>
                      &ldquo;{rep.details}&rdquo;
                    </div>
                  )}

                  {rep.moderator_note && (
                    <div className="p-2.5 bg-purple-50 rounded-lg text-xs text-[#4B3F72] border border-[#A78BFA]/30">
                      <span className="font-semibold block">Moderator Note:</span>
                      {rep.moderator_note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Shield}
              title="No Pending Reports"
              description="Community safety is currently clear. Any member or listing reports will appear here."
            />
          )}
        </div>
      )}

      {/* Tab: Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.length > 0 ? (
            verifications.map((ver) => (
              <Card key={ver.id} className="border-[#E2E8F0]">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1F2937]">
                        Verification for User: {ver.user?.display_name || ver.user_id}
                      </h4>
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ver.method.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Submitted: {new Date(ver.submitted_at).toLocaleDateString()}
                    </p>
                    {ver.private_evidence_path && (
                      <p className="text-xs text-[#4B3F72] mt-0.5 font-mono">
                        Evidence link provided
                      </p>
                    )}
                  </div>

                  {ver.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setReviewingVerification(ver);
                          setVerifAction('approved');
                        }}
                        className="text-xs bg-[#047857] hover:bg-[#065F46] text-white flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewingVerification(ver);
                          setVerifAction('rejected');
                        }}
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold uppercase font-mono px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {ver.status}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="No Pending Verifications"
              description="All university student and teacher verification requests have been processed."
            />
          )}
        </div>
      )}

      {/* Tab: Listings Moderation */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.map((l) => (
            <Card key={l.id} className="border-[#E2E8F0]">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#1F2937]">{l.title}</h4>
                  <p className="text-xs text-[#64748B] line-clamp-1">{l.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-50 text-[#4B3F72]">
                      {l.session_format}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Status: {l.status}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleListingStatusToggle(l.id, l.status)}
                  className={`text-xs ${
                    l.status === 'published'
                      ? 'text-amber-700 border-amber-300 hover:bg-amber-50'
                      : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {l.status === 'published' ? 'Pause Listing' : 'Publish Listing'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation Action Modal */}
      {moderatingReport && (
        <Modal
          isOpen={Boolean(moderatingReport)}
          onClose={() => setModeratingReport(null)}
          title="Resolve Safety Report"
          description={`Render a moderation decision on report ${moderatingReport.id}`}
        >
          <form onSubmit={handleModerateReportSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2937]">Action Decision</label>
              <select
                value={reportAction}
                onChange={(e) => setReportAction(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value="resolved">Mark Resolved (Action Taken)</option>
                <option value="dismissed">Dismiss Report (No Violation Found)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2937]">Moderator Internal Note</label>
              <Textarea
                value={moderatorNote}
                onChange={(e) => setModeratorNote(e.target.value)}
                rows={3}
                placeholder="Reasoning for audit trail..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModeratingReport(null)}
                disabled={isSubmittingMod}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingMod}
                className="bg-[#4B3F72] text-white"
              >
                Save Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Verification Decision Modal */}
      {reviewingVerification && (
        <Modal
          isOpen={Boolean(reviewingVerification)}
          onClose={() => setReviewingVerification(null)}
          title="Academic Verification Decision"
          description={`Update university credential verification status.`}
        >
          <form onSubmit={handleReviewVerificationSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2937]">Status</label>
              <select
                value={verifAction}
                onChange={(e) => setVerifAction(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value="approved">Approve & Grant Verified Badge</option>
                <option value="rejected">Reject Request</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2937]">Reviewer Note</label>
              <Textarea
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                rows={3}
                placeholder="Notes for member..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewingVerification(null)}
                disabled={isSubmittingMod}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingMod}
                className="bg-[#4B3F72] text-white"
              >
                Confirm Verification Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
