import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import type { Profile, Listing, ReportReason } from '../../types/database';
import { SafetyService } from '../../lib/services/safetyService';
import { useAuth } from '../../context/AuthContext';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUser?: Profile | null;
  listing?: Listing | null;
  onSuccess?: () => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  reportedUser,
  listing,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>('harassment');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await SafetyService.submitReport({
        reporterId: user.id,
        reportedUserId: reportedUser?.id || null,
        listingId: listing?.id || null,
        reason,
        details: details.trim() || null,
      });

      setDetails('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = reportedUser
    ? `Report @${reportedUser.username}`
    : listing
    ? `Report Listing: ${listing.title}`
    : 'Report Policy Violation';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Pairly takes safety and academic integrity seriously. Reports are confidential and reviewed by moderators."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937]">Reason for Report</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          >
            <option value="harassment">Harassment or abusive conduct</option>
            <option value="spam">Spam or unwanted advertising</option>
            <option value="scam">Scam or financial solicitation</option>
            <option value="misleading_listing">Misleading listing or skill misrepresentation</option>
            <option value="inappropriate_content">Inappropriate or offensive content</option>
            <option value="impersonation">Impersonation of student or faculty</option>
            <option value="other">Other violation</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937]">Additional Details</label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Please describe what occurred to assist our safety team..."
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
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
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
