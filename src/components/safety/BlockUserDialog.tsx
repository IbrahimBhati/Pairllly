import React, { useState } from 'react';
import { Ban, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Profile } from '../../types/database';
import { SafetyService } from '../../lib/services/safetyService';
import { useAuth } from '../../context/AuthContext';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToBlock: Profile;
  onSuccess?: () => void;
}

export const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  isOpen,
  onClose,
  userToBlock,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await SafetyService.blockUser(user.id, userToBlock.id, userToBlock);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to block user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Block ${userToBlock.display_name}?`}
      description="Blocking this user will prevent them from sending connection requests, messages, or appearing in your Smart Matches."
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            You will no longer receive communications from @{userToBlock.username}. You can review and manage your blocked list anytime in Settings.
          </span>
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
            type="button"
            size="sm"
            onClick={handleBlock}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Blocking...' : 'Block User'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
