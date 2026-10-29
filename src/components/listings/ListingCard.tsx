import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { ListingTypeBadge } from './ListingTypeBadge';
import { ListingStatusBadge } from './ListingStatusBadge';
import { SessionFormatBadge } from './SessionFormatBadge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Clock, Building, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Listing } from '../../types/database';

export interface ListingCardProps {
  listing: Listing;
  isOwner?: boolean;
  onViewDetails: (id: string) => void;
  onEdit?: (id: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isOwner = false,
  onViewDetails,
  actions,
  className,
}) => {
  const direction = listing.user_skill?.direction || 'offer';
  const skillName = listing.user_skill?.skill?.name || 'Exchange Skill';
  const skillCategory = listing.user_skill?.skill?.category;
  const proficiency = listing.user_skill?.proficiency;

  const ownerName = listing.owner?.display_name || 'Community Member';
  const ownerAvatar = listing.owner?.avatar_url;
  const ownerInstitution = listing.owner?.institution;
  const isVerified = listing.owner?.verification_status === 'verified';

  return (
    <Card
      hoverEffect
      className={cn('flex flex-col justify-between overflow-hidden border-[#E2E8F0]', className)}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="p-5 pb-3 flex items-start justify-between gap-2 border-b border-[#F8FAFC]">
          <div className="flex flex-wrap items-center gap-2">
            <ListingTypeBadge direction={direction} size="sm" />
            <span className="text-xs font-semibold text-[#4B3F72] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
              {skillName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && <ListingStatusBadge status={listing.status} size="sm" />}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 pt-3 space-y-3">
          <button
            type="button"
            onClick={() => onViewDetails(listing.id)}
            className="text-left group block w-full focus:outline-none"
          >
            <h3 className="text-base font-bold text-[#1F2937] group-hover:text-[#4B3F72] transition-colors line-clamp-2 leading-snug">
              {listing.title}
            </h3>
          </button>

          <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
            {listing.description}
          </p>

          {/* Format & Duration Meta */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#64748B]">
            <SessionFormatBadge
              format={listing.session_format}
              location={listing.location}
              size="sm"
            />
            {listing.duration_minutes && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E2E8F0]">
                <Clock className="w-3 h-3 text-[#94A3B8]" />
                <span>{listing.duration_minutes} mins</span>
              </span>
            )}
            {proficiency && direction === 'offer' && (
              <span className="text-[10px] uppercase font-bold text-[#4B3F72] bg-[#E0E7FF] px-2 py-0.5 rounded">
                {proficiency}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Owner preview & Action Footer */}
      <div className="p-5 pt-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Owner */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={ownerName} src={ownerAvatar} size="sm" isVerified={isVerified} />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#1F2937] truncate">
              {ownerName}
            </span>
            {ownerInstitution && (
              <span className="block text-[10px] text-[#64748B] truncate leading-none">
                {ownerInstitution}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {actions || (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(listing.id)}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              View
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
