import React from 'react';
import { Check, X, MessageSquare, Ban, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { RequestStatusBadge } from './RequestStatusBadge';
import type { ConnectionRequest } from '../../types/database';

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  currentUserId: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onOpenChat?: (req: ConnectionRequest) => void;
  onViewProfile?: (username: string) => void;
  isProcessing?: boolean;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onOpenChat,
  onViewProfile,
  isProcessing = false,
}) => {
  const isReceived = request.recipient_id === currentUserId;
  const targetUser = isReceived ? request.requester : request.recipient;

  return (
    <Card className="border-[#E2E8F0] hover:shadow-sm transition-all duration-200">
      <CardContent className="p-5 space-y-4">
        {/* Header: User and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={targetUser?.avatar_url}
              fallback={targetUser?.display_name || 'User'}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => targetUser?.username && onViewProfile?.(targetUser.username)}
                  className="font-bold text-sm text-[#1F2937] hover:text-[#4B3F72] text-left transition-colors"
                >
                  {targetUser?.display_name || 'Community Peer'}
                </button>
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-[#64748B]">
                {targetUser ? `@${targetUser.username} • ` : ''}
                {isReceived ? 'Wants to connect with you' : 'You sent a request'}
              </p>
              <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5 font-mono">
                <Clock className="w-3 h-3" />
                {new Date(request.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-[#334155] leading-relaxed">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
              Introduction
            </span>
            &ldquo;{request.message}&rdquo;
          </div>
        )}

        {/* Linked Listing if attached */}
        {request.listing && (
          <div className="p-2.5 rounded-xl bg-purple-50/50 border border-[#A78BFA]/20 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#4B3F72] block">
                Listing Reference
              </span>
              <p className="font-medium text-[#1F2937]">{request.listing.title}</p>
            </div>
            <span className="text-[11px] font-mono text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {request.listing.session_format}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
          {request.status === 'pending' && isReceived && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(request.id)}
                disabled={isProcessing}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept?.(request.id)}
                disabled={isProcessing}
                className="text-xs bg-[#4B3F72] hover:bg-[#3d335d] text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Accept & Start Chat
              </Button>
            </>
          )}

          {request.status === 'pending' && !isReceived && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(request.id)}
              disabled={isProcessing}
              className="text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Cancel Request
            </Button>
          )}

          {request.status === 'accepted' && (
            <Button
              size="sm"
              onClick={() => onOpenChat?.(request)}
              className="text-xs bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open Conversation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
