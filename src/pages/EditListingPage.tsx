import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ListingForm } from '../components/listings/ListingForm';
import { ErrorState } from '../components/ui/ErrorState';
import { SkillsService } from '../lib/services/skillsService';
import { ListingsService } from '../lib/services/listingsService';
import { useAuth } from '../context/AuthContext';
import type { UserSkill, Listing, ListingFormData } from '../types/database';

export interface EditListingPageProps {
  listingId: string;
  onNavigate: (path: string) => void;
}

export const EditListingPage: React.FC<EditListingPageProps> = ({ listingId, onNavigate }) => {
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [l, skills] = await Promise.all([
          ListingsService.getListingById(listingId, user.id),
          SkillsService.getUserSkills(user.id),
        ]);

        if (!l) {
          setError('Listing not found or you do not have permission to edit it.');
          return;
        }

        if (l.owner_id !== user.id) {
          setError('You are not authorized to edit this listing.');
          return;
        }

        setListing(l);
        setUserSkills(skills);
      } catch (err) {
        setError((err as Error).message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [listingId, user]);

  const handleSubmit = async (data: ListingFormData) => {
    if (!user || !listing) return;
    setIsSubmitting(true);
    try {
      await ListingsService.updateListing({
        listingId: listing.id,
        ownerId: user.id,
        data,
      });
      onNavigate('/my-listings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          title="Cannot Edit Listing"
          description={error}
          onRetry={() => onNavigate('/my-listings')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Edit Listing"
        description="Update session format, title, description, or publication state."
        breadcrumbs={[
          { label: 'My Listings', onClick: () => onNavigate('/my-listings') },
          { label: 'Edit Listing' },
        ]}
      />

      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-lg text-[#1F2937]">Edit Details</CardTitle>
          <CardDescription>
            Changes are saved to your listing immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <ListingForm
              userSkills={userSkills}
              initialData={listing}
              onSubmit={handleSubmit}
              onCancel={() => onNavigate('/my-listings')}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
