import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Play, Pause, XCircle, Trash2, Edit3, CheckCircle } from 'lucide-react';
import type { Listing, ListingStatus } from '../../types/database';

export interface ListingActionsProps {
  listing: Listing;
  onStatusChange: (status: ListingStatus) => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export const ListingActions: React.FC<ListingActionsProps> = ({
  listing,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatus = async (status: ListingStatus) => {
    setStatusLoading(true);
    try {
      await onStatusChange(status);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>

        {listing.status === 'draft' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatus('published')}
            isLoading={statusLoading}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Publish
          </Button>
        )}

        {listing.status === 'published' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatus('paused')}
            isLoading={statusLoading}
            leftIcon={<Pause className="w-3.5 h-3.5" />}
          >
            Pause
          </Button>
        )}

        {listing.status === 'paused' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatus('published')}
            isLoading={statusLoading}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Resume
          </Button>
        )}

        {listing.status !== 'closed' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatus('closed')}
            isLoading={statusLoading}
            leftIcon={<XCircle className="w-3.5 h-3.5 text-[#64748B]" />}
          >
            Close
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteConfirmOpen(true)}
          className="text-[#EF4444] hover:bg-[#FEF2F2]"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#64748B]">
            Listing: <strong className="text-[#1F2937]">{listing.title}</strong>
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Listing
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
