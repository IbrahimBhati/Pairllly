import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ListingForm } from '../components/listings/ListingForm';
import { SkillsService } from '../lib/services/skillsService';
import { ListingsService } from '../lib/services/listingsService';
import { useAuth } from '../context/AuthContext';
import type { UserSkill, ListingFormData } from '../types/database';

export interface NewListingPageProps {
  onNavigate: (path: string) => void;
}

export const NewListingPage: React.FC<NewListingPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSkills() {
      if (!user) return;
      try {
        const skills = await SkillsService.getUserSkills(user.id);
        setUserSkills(skills);
      } catch (err) {
        console.error('Failed to load user skills:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSkills();
  }, [user]);

  const handleSubmit = async (data: ListingFormData) => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      await ListingsService.createListing({
        ownerId: user.id,
        ownerProfile: profile,
        data,
      });
      onNavigate('/my-listings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Create New Listing"
        description="Craft a clear offer or request listing. Specify session format, duration, and collaborative goals."
        breadcrumbs={[
          { label: 'My Listings', onClick: () => onNavigate('/my-listings') },
          { label: 'New Listing' },
        ]}
      />

      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-lg text-[#1F2937]">Listing Details</CardTitle>
          <CardDescription>
            Link this listing to an existing skill from your profile.
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
