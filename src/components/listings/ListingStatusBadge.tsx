import React from 'react';
import { cn } from '../../lib/utils';
import type { ListingStatus } from '../../types/database';

export interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const ListingStatusBadge: React.FC<ListingStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const configs: Record<ListingStatus, { label: string; style: string }> = {
    published: {
      label: 'Published',
      style: 'bg-[#A7F3D0]/60 text-[#064E3B] border-[#6EE7B7]',
    },
    draft: {
      label: 'Draft',
      style: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    },
    paused: {
      label: 'Paused',
      style: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    },
    closed: {
      label: 'Closed',
      style: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    },
  };

  const current = configs[status] || configs.draft;
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-bold uppercase tracking-wider select-none border',
        current.style,
        sizeClasses[size],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {current.label}
    </span>
  );
};
