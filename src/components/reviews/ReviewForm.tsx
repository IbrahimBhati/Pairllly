import React, { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { RatingInput } from './RatingInput';
import type { Exchange, Profile } from '../../types/database';
import { ReviewsService } from '../../lib/services/reviewsService';
import { useAuth } from '../../context/AuthContext';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: Exchange;
  reviewee: Profile;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  isOpen,
  onClose,
  exchange,
  reviewee,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (feedback.trim().length < 5) {
      setError('Please provide feedback of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ReviewsService.submitReview({
        exchangeId: exchange.id,
        reviewerId: user.id,
        reviewerProfile: profile || undefined,
        revieweeId: reviewee.id,
        revieweeProfile: reviewee,
        rating,
        feedback: feedback.trim(),
      });

      setFeedback('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Exchange with ${reviewee.display_name}`}
      description="Help maintain a supportive and trustworthy university learning community with an honest review."
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Rating stars */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#1F2937] block">
            Overall Experience Rating
          </label>
          <div className="flex items-center gap-3">
            <RatingInput value={rating} onChange={setRating} size="lg" />
            <span className="text-sm font-bold text-[#4B3F72]">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Constructive feedback */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937] flex items-center justify-between">
            <span>Written Feedback & Praise</span>
            <span className="text-[10px] text-[#94A3B8] font-mono">{feedback.length}/1000</span>
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="How did the exchange go? Was the peer punctual, helpful, and clear in their explanations?"
            className="text-xs"
          />
        </div>

        {/* Actions */}
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
            className="bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
