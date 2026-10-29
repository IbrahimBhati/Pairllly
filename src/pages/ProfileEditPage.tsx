import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditSchema } from '../lib/validation/schemas';
import type { z } from 'zod';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { FormError } from '../components/auth/FormError';
import { ProfileService } from '../lib/services/profileService';
import { useAuth } from '../context/AuthContext';
import {
  User,
  AtSign,
  Building,
  GraduationCap,
  MapPin,
  Clock,
  Calendar,
  Lock,
  Globe,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { ProfileVisibility } from '../types/database';

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

export interface ProfileEditPageProps {
  onNavigate: (path: string) => void;
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || '',
      bio: profile?.bio || '',
      institution: profile?.institution || '',
      department: profile?.department || '',
      location: profile?.location || '',
      timezone: profile?.timezone || '',
      availability: profile?.availability || '',
      profile_visibility: profile?.profile_visibility || 'public',
    },
  });

  const previewAvatar = watch('avatar_url');
  const previewName = watch('display_name');

  const onSubmit = async (values: ProfileEditFormValues) => {
    if (!user) return;
    setServerError(null);
    setSuccessMessage(false);
    try {
      await ProfileService.updateProfile(user.id, values);
      await refreshProfile();
      setSuccessMessage(true);
      setTimeout(() => {
        onNavigate('/profile');
      }, 800);
    } catch (err) {
      setServerError((err as Error).message || 'Failed to update profile');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Edit Profile"
        description="Update your public profile, background details, and discovery visibility."
        breadcrumbs={[
          { label: 'Profile', onClick: () => onNavigate('/profile') },
          { label: 'Edit' },
        ]}
      />

      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-lg text-[#1F2937]">Profile Information</CardTitle>
          <CardDescription>
            Personalize your details. Administrative privileges and verification status cannot be self-edited.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormError message={serverError} />

            {successMessage && (
              <div className="p-4 rounded-xl bg-[#A7F3D0]/60 border border-[#6EE7B7] text-xs text-[#064E3B] font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
                <span>Profile updated successfully! Redirecting...</span>
              </div>
            )}

            {/* Avatar Preview & URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1F2937]">Profile Avatar</label>
              <div className="flex items-center gap-4">
                <Avatar
                  name={previewName || profile?.display_name || 'U'}
                  src={previewAvatar}
                  size="xl"
                  isVerified={profile?.verification_status === 'verified'}
                />
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="https://images.unsplash.com/... or image link"
                    error={errors.avatar_url?.message}
                    {...register('avatar_url')}
                  />
                  <p className="text-[11px] text-[#94A3B8]">
                    Paste a direct image URL for your profile photo
                  </p>
                </div>
              </div>
            </div>

            {/* Name and Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="display_name">
                  Full Display Name *
                </label>
                <Input
                  id="display_name"
                  placeholder="e.g. Jordan Miller"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.display_name?.message}
                  {...register('display_name')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="username">
                  Unique Username Handle *
                </label>
                <Input
                  id="username"
                  placeholder="e.g. jordan_m"
                  leftIcon={<AtSign className="w-4 h-4" />}
                  error={errors.username?.message}
                  {...register('username')}
                />
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F2937]" htmlFor="bio">
                Biography
              </label>
              <Textarea
                id="bio"
                placeholder="Share your interests, academic pursuits, and what you enjoy learning..."
                rows={3}
                error={errors.bio?.message}
                {...register('bio')}
              />
            </div>

            {/* Institution & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="institution">
                  Institution / Workplace
                </label>
                <Input
                  id="institution"
                  placeholder="e.g. State University"
                  leftIcon={<Building className="w-4 h-4" />}
                  error={errors.institution?.message}
                  {...register('institution')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="department">
                  Department / Major
                </label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Science"
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  error={errors.department?.message}
                  {...register('department')}
                />
              </div>
            </div>

            {/* Location & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="location">
                  City / Campus Location
                </label>
                <Input
                  id="location"
                  placeholder="e.g. Main Campus Library"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.location?.message}
                  {...register('location')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]" htmlFor="timezone">
                  Timezone
                </label>
                <Input
                  id="timezone"
                  placeholder="e.g. America/Los_Angeles"
                  leftIcon={<Clock className="w-4 h-4" />}
                  error={errors.timezone?.message}
                  {...register('timezone')}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F2937]" htmlFor="availability">
                General Availability Notes
              </label>
              <Input
                id="availability"
                placeholder="e.g. Weekday afternoons after 3 PM, weekends flexible"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.availability?.message}
                {...register('availability')}
              />
            </div>

            {/* Profile Visibility */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <label className="text-xs font-bold text-[#1F2937] block">Profile Visibility</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#CBD5E1] bg-white cursor-pointer hover:border-[#4B3F72]">
                  <input
                    type="radio"
                    value="public"
                    className="mt-0.5 text-[#4B3F72] focus:ring-[#4B3F72]"
                    {...register('profile_visibility')}
                  />
                  <div>
                    <span className="font-bold text-[#1F2937] flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#10B981]" /> Public Profile
                    </span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Discoverable in Explore, reciprocal matching, and search.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#CBD5E1] bg-white cursor-pointer hover:border-[#4B3F72]">
                  <input
                    type="radio"
                    value="private"
                    className="mt-0.5 text-[#4B3F72] focus:ring-[#4B3F72]"
                    {...register('profile_visibility')}
                  />
                  <div>
                    <span className="font-bold text-[#1F2937] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-[#64748B]" /> Private Profile
                    </span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Hidden from public exploration and direct unauthenticated access.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => onNavigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                rightIcon={<Save className="w-4 h-4" />}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
