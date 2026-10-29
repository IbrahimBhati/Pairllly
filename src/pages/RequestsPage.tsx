import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConnectionRequestCard } from '../components/requests/ConnectionRequestCard';
import type { ConnectionRequest } from '../types/database';
import { RequestsService } from '../lib/services/requestsService';
import { useAuth } from '../context/AuthContext';

interface RequestsPageProps {
  onNavigate: (path: string) => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [received, sent] = await Promise.all([
        RequestsService.getReceivedRequests(user.id),
        RequestsService.getSentRequests(user.id),
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (err) {
      setError((err as Error).message || 'Failed to load connection requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleAccept = async (requestId: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const { conversationId } = await RequestsService.acceptRequest(requestId, user.id);
      await loadRequests();
      onNavigate(`/chat/${conversationId}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to accept request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await RequestsService.rejectRequest(requestId, user.id);
      await loadRequests();
    } catch (err) {
      setError((err as Error).message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await RequestsService.cancelRequest(requestId, user.id);
      await loadRequests();
    } catch (err) {
      setError((err as Error).message || 'Failed to cancel request');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'pending').length;
  const currentList = tab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Connection Requests"
        description="Review collaboration proposals and requests from fellow university peers."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setTab('received')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'received'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Received</span>
          {pendingReceivedCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              tab === 'received' ? 'bg-[#A7F3D0] text-[#065F46]' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingReceivedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'sent'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Sent</span>
          <span className="text-[11px] opacity-80">({sentRequests.length})</span>
        </button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((req) => (
            <ConnectionRequestCard
              key={req.id}
              request={req}
              currentUserId={user?.id || ''}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
              onOpenChat={() => onNavigate('/chat')}
              onViewProfile={(uname) => onNavigate(`/profile/${uname}`)}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title={tab === 'received' ? 'No Received Requests' : 'No Sent Requests'}
          description={
            tab === 'received'
              ? 'When other students or teachers want to exchange skills with you, their requests will appear here.'
              : "You haven't sent any connection proposals yet. Discover compatible peers on the Explore or Matches page!"
          }
          actionLabel="Explore People & Skills"
          onAction={() => onNavigate('/explore')}
        />
      )}
    </div>
  );
};
