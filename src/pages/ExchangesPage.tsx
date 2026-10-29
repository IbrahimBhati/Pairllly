import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle2, Clock, MessageSquare, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { ReviewForm } from '../components/reviews/ReviewForm';
import type { Exchange, Profile } from '../types/database';
import { ExchangesService } from '../lib/services/exchangesService';
import { ReviewsService } from '../lib/services/reviewsService';
import { useAuth } from '../context/AuthContext';

interface ExchangesPageProps {
  onNavigate: (path: string) => void;
}

export const ExchangesPage: React.FC<ExchangesPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [reviewsWritten, setReviewsWritten] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [reviewModalExchange, setReviewModalExchange] = useState<Exchange | null>(null);
  const [reviewModalPeer, setReviewModalPeer] = useState<Profile | null>(null);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await ExchangesService.getExchanges(user.id);
      setExchanges(list);

      // Check which exchanges already have reviews submitted by this user
      const reviewsStatus: Record<string, boolean> = {};
      await Promise.all(
        list.map(async (e) => {
          if (e.status === 'completed') {
            const exchReviews = await ReviewsService.getReviewsForExchange(e.id);
            reviewsStatus[e.id] = exchReviews.some((r) => r.reviewer_id === user.id);
          }
        })
      );
      setReviewsWritten(reviewsStatus);
    } catch (err) {
      setError((err as Error).message || 'Failed to load exchanges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConfirmCompletion = async (exchangeId: string) => {
    if (!user) return;
    setIsConfirmingId(exchangeId);
    try {
      await ExchangesService.confirmCompletion(exchangeId, user.id);
      await loadData();
    } catch (err) {
      setError((err as Error).message || 'Failed to confirm exchange completion');
    } finally {
      setIsConfirmingId(null);
    }
  };

  const getPeer = (exchange: Exchange): Profile | undefined => {
    if (!user || !exchange.connection_request) return undefined;
    const req = exchange.connection_request;
    return req.requester_id === user.id ? req.recipient : req.requester;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Knowledge Exchanges"
        description="Track active collaboration sessions and dual-confirm completed exchanges to earn points and badges."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : exchanges.length > 0 ? (
        <div className="space-y-4">
          {exchanges.map((exch) => {
            const peer = getPeer(exch);
            const isRequester = exch.connection_request?.requester_id === user?.id;
            const myConfirmed = isRequester
              ? Boolean(exch.requester_confirmed_at)
              : Boolean(exch.recipient_confirmed_at);
            const peerConfirmed = isRequester
              ? Boolean(exch.recipient_confirmed_at)
              : Boolean(exch.requester_confirmed_at);
            const isCompleted = exch.status === 'completed';
            const hasReviewed = reviewsWritten[exch.id] || false;

            return (
              <Card key={exch.id} className="border-[#E2E8F0]">
                <CardContent className="p-6 space-y-5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={peer?.avatar_url}
                        fallback={peer?.display_name || 'Peer'}
                        size="md"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-[#1F2937]">
                          Exchange with {peer?.display_name || 'Campus Peer'}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          @{peer?.username || 'member'} &bull; <span className="capitalize">{peer?.account_type || 'student'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isCompleted
                            ? 'bg-[#A7F3D0]/50 text-[#065F46] border-[#A7F3D0]'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>In Progress</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono mt-1">
                        Started {new Date(exch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Dual Confirmation Status Tracker */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="text-xs font-semibold text-[#1F2937] flex items-center justify-between">
                      <span>Completion Verification</span>
                      <span className="text-[11px] text-[#64748B] font-normal">
                        Both participants must confirm completion
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        myConfirmed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${myConfirmed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>You: {myConfirmed ? 'Confirmed' : 'Pending your confirmation'}</span>
                      </div>

                      <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        peerConfirmed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${peerConfirmed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>{peer?.display_name || 'Peer'}: {peerConfirmed ? 'Confirmed' : 'Pending confirmation'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('/chat')}
                      className="text-xs border-[#CBD5E1] flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      {!myConfirmed && !isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmCompletion(exch.id)}
                          disabled={isConfirmingId === exch.id}
                          className="text-xs bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isConfirmingId === exch.id ? 'Confirming...' : 'Confirm My Completion'}</span>
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          size="sm"
                          disabled={hasReviewed}
                          onClick={() => {
                            if (peer) {
                              setReviewModalExchange(exch);
                              setReviewModalPeer(peer);
                            }
                          }}
                          className={`text-xs flex items-center gap-1.5 ${
                            hasReviewed
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>{hasReviewed ? 'Review Submitted' : 'Write Review'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ArrowRightLeft}
          title="No Active Exchanges"
          description="When you and a peer accept a connection request, an ongoing collaborative exchange will be created here."
          actionLabel="View Connection Requests"
          onAction={() => onNavigate('/requests')}
        />
      )}

      {/* Review Modal */}
      {reviewModalExchange && reviewModalPeer && (
        <ReviewForm
          isOpen={Boolean(reviewModalExchange)}
          onClose={() => {
            setReviewModalExchange(null);
            setReviewModalPeer(null);
          }}
          exchange={reviewModalExchange}
          reviewee={reviewModalPeer}
          onSuccess={() => {
            setReviewModalExchange(null);
            setReviewModalPeer(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
