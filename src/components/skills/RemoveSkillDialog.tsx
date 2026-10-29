import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { FormError } from '../auth/FormError';
import { AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { ListingsService } from '../../lib/services/listingsService';
import type { UserSkill, Listing } from '../../types/database';

export interface RemoveSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userSkill: UserSkill | null;
  onConfirmRemove: (userSkillId: string) => Promise<void>;
  onNavigateToListings?: () => void;
}

export const RemoveSkillDialog: React.FC<RemoveSkillDialogProps> = ({
  isOpen,
  onClose,
  userSkill,
  onConfirmRemove,
  onNavigateToListings,
}) => {
  const [checking, setChecking] = useState(true);
  const [referencingListings, setReferencingListings] = useState<Listing[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userSkill) return;

    setChecking(true);
    setError(null);

    ListingsService.getListingsBySkill(userSkill.id)
      .then((listings) => {
        setReferencingListings(listings);
      })
      .catch((err) => {
        console.error('Error checking referencing listings:', err);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [isOpen, userSkill]);

  if (!userSkill) return null;

  const hasBlockingListings = referencingListings.length > 0;

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirmRemove(userSkill.id);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to remove skill');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Profile Skill"
      description={`Are you sure you want to remove "${userSkill.skill?.name}" from your ${userSkill.direction.toUpperCase()} skills?`}
    >
      <div className="space-y-4 pt-2">
        <FormError message={error} />

        {checking ? (
          <p className="text-xs text-[#64748B]">Verifying dependent listing references...</p>
        ) : hasBlockingListings ? (
          <div className="p-4 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/40 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#92400E]">Skill is Referenced by Active Listings</h4>
                <p className="text-xs text-[#B45309] mt-1 leading-relaxed">
                  You cannot delete this skill relationship while it is linked to the following listing(s):
                </p>
              </div>
            </div>

            <ul className="text-xs font-semibold text-[#1F2937] list-disc list-inside space-y-1 pl-2">
              {referencingListings.map((l) => (
                <li key={l.id}>{l.title}</li>
              ))}
            </ul>

            <p className="text-xs text-[#64748B]">
              Please close or delete the referencing listing(s) in <strong>My Listings</strong> before removing this skill.
            </p>

            {onNavigateToListings && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onNavigateToListings();
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Manage My Listings
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#64748B]">
            This will remove the skill relationship from your profile and will update your reciprocal smart matching criteria.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          {!hasBlockingListings && !checking && (
            <Button
              variant="destructive"
              size="md"
              onClick={handleConfirm}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Remove Skill
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
