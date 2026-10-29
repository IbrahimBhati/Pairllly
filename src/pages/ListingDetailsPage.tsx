import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ListingTypeBadge } from '../components/listings/ListingTypeBadge';
import { ListingStatusBadge } from '../components/listings/ListingStatusBadge';
import { SessionFormatBadge } from '../components/listings/SessionFormatBadge';
import { ErrorState } from '../components/ui/ErrorState';
import { ListingsService } from '../lib/services/listingsService';
import { useAuth } from '../context/AuthContext';
import { Clock, Building, Calendar, ArrowLeft, Edit3, UserCheck, MessageSquare } from 'lucide-react';
import type { Listing } from '../types/database';

export interface ListingDetailsPageProps {
  listingId: string;
  onNavigate: (path: string) => void;
}

export const ListingDetailsPage: React.FC<ListingDetailsPageProps> = ({
  listingId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ListingsService.getListingById(listingId, user?.id);
        if (!data) {
          setError('Listing not found or is private.');
        } else {
          setListing(data);
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    }
    loadListing();
  }, [listingId, user]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
        <div className="h-8 bg-slate-100 rounded-xl w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorState
          title="Listing Unavailable"
          description={error || 'This listing does not exist or has been removed.'}
          onRetry={() => onNavigate('/explore')}
        />
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_id;
  const direction = listing.user_skill?.direction || 'offer';
  const skillName = listing.user_skill?.skill?.name || 'Skill';
  const ownerName = listing.owner?.display_name || 'Community Member';
  const ownerUsername = listing.owner?.username || 'member';
  const isVerified = listing.owner?.verification_status === 'verified';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(-1 as any)}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        className="mb-2"
      >
        Back
      </Button>

      {/* Main Listing Header Card */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="border-b border-[#F8FAFC] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ListingTypeBadge direction={direction} size="md" />
              <span className="text-xs font-bold text-[#4B3F72] bg-[#E0E7FF] px-2.5 py-1 rounded-lg">
                {skillName}
              </span>
              {listing.user_skill?.proficiency && direction === 'offer' && (
                <span className="text-xs font-semibold text-[#064E3B] bg-[#A7F3D0]/60 px-2.5 py-1 rounded-lg">
                  Proficiency: {listing.user_skill.proficiency}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwner && <ListingStatusBadge status={listing.status} size="md" />}
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(`/listings/${listing.id}/edit`)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Listing
                </Button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mt-3">
            {listing.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#64748B]">
            <SessionFormatBadge
              format={listing.session_format}
              location={listing.location}
              size="md"
            />
            {listing.duration_minutes && (
              <span className="inline-flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[#1F2937]">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                <span>{listing.duration_minutes} minutes per session</span>
              </span>
            )}
            <span className="text-[#94A3B8] font-mono">
              Listed {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              About This Exchange
            </h3>
            <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-line bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
              {listing.description}
            </div>
          </div>

          {/* Owner Profile Preview Box */}
          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  name={ownerName}
                  src={listing.owner?.avatar_url}
                  size="lg"
                  isVerified={isVerified}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[#1F2937]">{ownerName}</h4>
                    <span className="text-xs text-[#64748B] font-mono">@{ownerUsername}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#4B3F72] uppercase tracking-wide block">
                    {listing.owner?.account_type || 'Member'}
                  </span>
                  {listing.owner?.institution && (
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{listing.owner.institution}</span>
                      {listing.owner.department && <span>· {listing.owner.department}</span>}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(`/profile/${ownerUsername}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>

            {listing.owner?.bio && (
              <p className="text-xs text-[#64748B] border-t border-[#F1F5F9] pt-3 leading-relaxed">
                {listing.owner.bio}
              </p>
            )}

            {listing.owner?.availability && (
              <div className="flex items-center gap-2 text-xs text-[#4B3F72] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <Calendar className="w-4 h-4 text-[#4B3F72] shrink-0" />
                <span>
                  <strong>Availability:</strong> {listing.owner.availability}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
