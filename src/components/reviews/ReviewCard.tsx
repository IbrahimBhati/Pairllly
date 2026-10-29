import React from 'react';
import { Star } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import type { Review } from '../../types/database';

interface ReviewCardProps {
  review: Review;
  onViewProfile?: (username: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onViewProfile }) => {
  return (
    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={review.reviewer?.avatar_url}
            fallback={review.reviewer?.display_name || 'Reviewer'}
            size="sm"
          />
          <div>
            <button
              type="button"
              onClick={() => review.reviewer?.username && onViewProfile?.(review.reviewer.username)}
              className="font-bold text-xs text-[#1F2937] hover:text-[#4B3F72] text-left"
            >
              {review.reviewer?.display_name || 'Campus Peer'}
            </button>
            <p className="text-[10px] text-[#94A3B8]">
              {new Date(review.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {review.feedback && (
        <p className="text-xs text-[#475569] leading-relaxed italic">
          &ldquo;{review.feedback}&rdquo;
        </p>
      )}
    </div>
  );
};
