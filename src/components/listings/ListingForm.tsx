import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingFormSchema } from '../../lib/validation/schemas';
import type { z } from 'zod';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { FormError } from '../auth/FormError';
import { ListingTypeBadge } from './ListingTypeBadge';
import { Globe, MapPin, Shuffle, Clock, ArrowRight, Save, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { UserSkill, ListingFormData, Listing, SessionFormat, ListingStatus } from '../../types/database';

type ListingFormValues = z.infer<typeof listingFormSchema>;

export interface ListingFormProps {
  userSkills: UserSkill[];
  initialData?: Listing | null;
  onSubmit: (data: ListingFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ListingForm: React.FC<ListingFormProps> = ({
  userSkills,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultSkillId = initialData?.user_skill_id || (userSkills.length > 0 ? userSkills[0].id : '');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema) as any,
    defaultValues: {
      user_skill_id: defaultSkillId,
      title: initialData?.title || '',
      description: initialData?.description || '',
      session_format: initialData?.session_format || 'online',
      location: initialData?.location || '',
      duration_minutes: initialData?.duration_minutes || 60,
      status: initialData?.status || 'draft',
    },
  });

  const selectedSkillId = watch('user_skill_id');
  const selectedFormat = watch('session_format');
  const selectedSkill = userSkills.find((s) => s.id === selectedSkillId);

  const handleFormSubmit = async (values: ListingFormValues) => {
    setServerError(null);
    try {
      await onSubmit({
        user_skill_id: values.user_skill_id,
        title: values.title.trim(),
        description: values.description.trim(),
        session_format: values.session_format,
        location: values.location?.trim() || undefined,
        duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : undefined,
        status: values.status,
      });
    } catch (err) {
      setServerError((err as Error).message || 'Failed to save listing');
    }
  };

  if (userSkills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center space-y-3 bg-white">
        <h4 className="text-base font-bold text-[#1F2937]">No Profile Skills Available</h4>
        <p className="text-xs text-[#64748B] max-w-md mx-auto">
          Every Pairly listing must link directly to an offered or wanted skill on your profile. Please add at least one skill in My Skills first.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onCancel}>
            Return to Skills Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <FormError message={serverError} />

      {/* 1. Skill Link Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1F2937] block">
          Linked Skill from Your Profile *
        </label>
        <p className="text-xs text-[#64748B]">
          Listing type is automatically derived from the direction (Offer or Request) of your skill.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
          {userSkills.map((usk) => {
            const isSelected = selectedSkillId === usk.id;
            return (
              <label
                key={usk.id}
                className={cn(
                  'flex items-start justify-between p-3 rounded-xl border text-left cursor-pointer transition-all',
                  isSelected
                    ? 'border-[#4B3F72] bg-[#4B3F72]/5 ring-1 ring-[#4B3F72] shadow-2xs'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                )}
              >
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-[#1F2937]">
                    {usk.skill?.name || 'Skill'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ListingTypeBadge direction={usk.direction} size="sm" />
                    {usk.proficiency && (
                      <span className="text-[10px] text-[#64748B] font-mono">
                        · {usk.proficiency}
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="radio"
                  value={usk.id}
                  className="sr-only"
                  {...register('user_skill_id')}
                />
              </label>
            );
          })}
        </div>
        {errors.user_skill_id && (
          <p className="text-xs text-[#EF4444] font-medium">{errors.user_skill_id.message}</p>
        )}
      </div>

      {/* 2. Listing Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#1F2937]" htmlFor="listing-title">
          Listing Headline *
        </label>
        <Input
          id="listing-title"
          placeholder="e.g. 1-on-1 Introduction to Modern Web Development in React"
          error={errors.title?.message}
          {...register('title')}
        />
      </div>

      {/* 3. Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#1F2937]" htmlFor="listing-description">
          Detailed Description *
        </label>
        <Textarea
          id="listing-description"
          placeholder="Explain what topics you will cover, prerequisite expectations, format pacing, and what mutual exchange you would appreciate in return..."
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />
        <p className="text-[11px] text-[#94A3B8]">
          Be clear and specific so compatible peers can assess reciprocal fit.
        </p>
      </div>

      {/* 4. Session Format & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Session Format */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1F2937]">Session Format *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'online', label: 'Online', icon: <Globe className="w-3.5 h-3.5" /> },
              { id: 'in_person', label: 'In-Person', icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: 'hybrid', label: 'Hybrid', icon: <Shuffle className="w-3.5 h-3.5" /> },
            ].map((f) => {
              const isSelected = selectedFormat === f.id;
              return (
                <label
                  key={f.id}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all',
                    isSelected
                      ? 'border-[#4B3F72] bg-[#4B3F72]/5 text-[#4B3F72] font-bold shadow-2xs'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'
                  )}
                >
                  <span className="mb-1">{f.icon}</span>
                  <span className="text-xs">{f.label}</span>
                  <input
                    type="radio"
                    value={f.id}
                    className="sr-only"
                    {...register('session_format')}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1F2937]" htmlFor="duration_minutes">
            Approximate Duration (Minutes)
          </label>
          <Input
            id="duration_minutes"
            type="number"
            placeholder="60"
            min={15}
            max={360}
            leftIcon={<Clock className="w-4 h-4" />}
            error={errors.duration_minutes?.message}
            {...register('duration_minutes', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Location (if in_person or hybrid) */}
      {(selectedFormat === 'in_person' || selectedFormat === 'hybrid') && (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <label className="text-xs font-bold text-[#1F2937]" htmlFor="listing-location">
            Meeting Location / Campus Hub
          </label>
          <Input
            id="listing-location"
            placeholder="e.g. Science Library Room 204 or Campus Student Center"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.location?.message}
            {...register('location')}
          />
        </div>
      )}

      {/* 5. Publication Status Selector */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
        <label className="text-xs font-bold text-[#1F2937] block">Publication State</label>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="draft"
              className="text-[#4B3F72] focus:ring-[#4B3F72]"
              {...register('status')}
            />
            <span className="font-semibold text-[#64748B]">Save as Draft (Private to you)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="published"
              className="text-[#10B981] focus:ring-[#10B981]"
              {...register('status')}
            />
            <span className="font-semibold text-[#064E3B]">Publish Immediately (Visible to campus)</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          rightIcon={<Save className="w-4 h-4" />}
        >
          {initialData ? 'Update Listing' : 'Save Listing'}
        </Button>
      </div>
    </form>
  );
};
