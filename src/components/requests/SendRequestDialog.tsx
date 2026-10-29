import React, { useState } from 'react';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Avatar } from '../ui/Avatar';
import type { Profile, Listing } from '../../types/database';
import { RequestsService } from '../../lib/services/requestsService';
import { useAuth } from '../../context/AuthContext';

interface SendRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientProfile: Profile;
  listing?: Listing | null;
  onSuccess?: () => void;
}

export const SendRequestDialog: React.FC<SendRequestDialogProps> = ({
  isOpen,
  onClose,
  recipientProfile,
  listing,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('You must be signed in to send a connection request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await RequestsService.sendRequest({
        requesterId: user.id,
        requesterProfile: profile,
        recipientId: recipientProfile.id,
        recipientProfile,
        listingId: listing?.id || null,
        listing: listing || null,
        message: message.trim() || null,
      });

      setMessage('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Connection Request"
      description={`Introduce yourself to ${recipientProfile.display_name} and propose a collaborative knowledge exchange.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Recipient summary card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
          <Avatar
            src={recipientProfile.avatar_url}
            fallback={recipientProfile.display_name}
            size="md"
          />
          <div>
            <h4 className="font-semibold text-sm text-[#1F2937]">
              {recipientProfile.display_name}
            </h4>
            <p className="text-xs text-[#64748B]">
              @{recipientProfile.username} &bull; <span className="capitalize">{recipientProfile.account_type}</span>
            </p>
            {recipientProfile.institution && (
              <p className="text-[11px] text-[#94A3B8]">{recipientProfile.institution}</p>
            )}
          </div>
        </div>

        {/* Linked Listing if present */}
        {listing && (
          <div className="p-3 rounded-xl bg-purple-50/60 border border-[#A78BFA]/30">
            <span className="text-[10px] font-semibold tracking-wider text-[#4B3F72] uppercase block">
              Regarding Listing
            </span>
            <p className="text-xs font-medium text-[#1F2937] mt-0.5">&ldquo;{listing.title}&rdquo;</p>
            <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{listing.description}</p>
          </div>
        )}

        {/* Intro message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937] flex items-center justify-between">
            <span>Introduction / Collaboration Proposal (Optional)</span>
            <span className="text-[10px] text-[#94A3B8] font-mono">{message.length}/1000</span>
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Hi! I saw you are looking for help with Graphic Design, and I would love to learn more English writing techniques in exchange. Let's connect!"
            className="text-xs"
          />
          <p className="text-[11px] text-[#94A3B8]">
            Be polite and specific about what you can teach and what you hope to learn.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
