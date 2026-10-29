import React from 'react';
import { BookOpen, HelpCircle, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ListingTypeBadgeProps {
  direction?: 'offer' | 'want';
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Derives badge directly from the linked user_skills.direction field.
 * Guarantees no contradiction between listing presentation and underlying skill data.
 */
export const ListingTypeBadge: React.FC<ListingTypeBadgeProps> = ({
  direction = 'offer',
  className,
  size = 'md',
}) => {
  const isOffer = direction === 'offer';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-bold uppercase tracking-wider select-none border',
        isOffer
          ? 'bg-[#A7F3D0]/60 text-[#064E3B] border-[#6EE7B7]'
          : 'bg-[#E0E7FF] text-[#4B3F72] border-[#C7D2FE]',
        sizeClasses[size],
        className
      )}
    >
      {isOffer ? (
        <>
          <BookOpen className="w-3.5 h-3.5 text-[#064E3B]" />
          <span>Skill Offer</span>
        </>
      ) : (
        <>
          <Layers className="w-3.5 h-3.5 text-[#4B3F72]" />
          <span>Skill Request</span>
        </>
      )}
    </span>
  );
};
