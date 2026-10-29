import { z } from 'zod';

export const accountTypeSchema = z.enum([
  'student',
  'teacher',
  'professional',
  'community',
]);

export const profileVisibilitySchema = z.enum(['public', 'private']);

export const skillProficiencySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const sessionFormatSchema = z.enum(['online', 'in_person', 'hybrid']);

export const listingStatusSchema = z.enum(['draft', 'published', 'paused', 'closed']);

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers, and underscores');

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  avatar_url: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').nullable().optional(),
  account_type: accountTypeSchema,
  institution: z.string().max(100).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  availability: z.string().max(100).nullable().optional(),
  profile_visibility: profileVisibilitySchema.default('public'),
});

export const profileEditSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(60),
  username: usernameSchema,
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
  institution: z.string().max(100).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  timezone: z.string().max(50).optional().or(z.literal('')),
  availability: z.string().max(100).optional().or(z.literal('')),
  profile_visibility: profileVisibilitySchema,
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid university or personal email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  username: usernameSchema,
  account_type: accountTypeSchema,
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter the email associated with your account'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// Onboarding Step 1
export const onboardingStep1Schema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(60),
  username: usernameSchema,
  account_type: accountTypeSchema,
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
});

// Onboarding Step 2
export const onboardingStep2Schema = z.object({
  institution: z.string().max(100).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  timezone: z.string().max(50).optional().or(z.literal('')),
  availability: z.string().max(100).optional().or(z.literal('')),
});

// Onboarding Step 3: Skills
export const offeredSkillInputSchema = z.object({
  skill_id: z.string().min(1, 'Please select a skill'),
  proficiency: skillProficiencySchema,
  notes: z.string().max(200).optional(),
});

export const wantedSkillInputSchema = z.object({
  skill_id: z.string().min(1, 'Please select a skill'),
  notes: z.string().max(200).optional(),
});

export const onboardingStep3Schema = z.object({
  offered_skills: z.array(offeredSkillInputSchema).min(1, 'Please select at least one skill you can teach or offer'),
  wanted_skills: z.array(wantedSkillInputSchema).min(1, 'Please select at least one skill you want to learn'),
});

export const skillCatalogItemSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  category: z.string().min(2).max(50),
  description: z.string().max(200).nullable().optional(),
});

// Listing creation / editing schema
export const listingFormSchema = z.object({
  user_skill_id: z.string().min(1, 'Please select a skill from your profile'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Please provide a clear description (at least 20 characters)').max(2000, 'Description cannot exceed 2000 characters'),
  session_format: sessionFormatSchema,
  location: z.string().max(100).optional().or(z.literal('')),
  duration_minutes: z.number().min(15, 'Session duration should be at least 15 minutes').max(360, 'Maximum duration is 6 hours').optional(),
  status: listingStatusSchema,
});

// Phase 5: Connection Request & Chat Schemas
export const connectionRequestSchema = z.object({
  recipient_id: z.string().min(1, 'Recipient is required'),
  listing_id: z.string().optional().nullable(),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional().nullable(),
});

export const messageSchema = z.object({
  conversation_id: z.string().min(1, 'Conversation is required'),
  content: z.string().trim().min(1, 'Message cannot be empty').max(3000, 'Message cannot exceed 3000 characters'),
});

// Phase 6: Reviews, Reports & Verification Schemas
export const reviewSchema = z.object({
  exchange_id: z.string().min(1, 'Exchange is required'),
  reviewee_id: z.string().min(1, 'Reviewee is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  feedback: z.string().trim().min(5, 'Feedback must be at least 5 characters').max(1000, 'Feedback cannot exceed 1000 characters'),
});

export const reportSchema = z.object({
  reported_user_id: z.string().optional().nullable(),
  listing_id: z.string().optional().nullable(),
  reason: z.enum([
    'harassment',
    'spam',
    'scam',
    'misleading_listing',
    'inappropriate_content',
    'impersonation',
    'other',
  ]),
  details: z.string().max(1000, 'Details cannot exceed 1000 characters').optional().nullable(),
}).refine((data) => Boolean(data.reported_user_id || data.listing_id), {
  message: 'Please provide either a user or a listing to report',
  path: ['reported_user_id'],
});

export const verificationRequestSchema = z.object({
  method: z.enum(['institutional_email', 'manual_review']),
  evidence_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Phase 7: Settings & Badges Schemas
export const userSettingsSchema = z.object({
  email_notifications: z.boolean(),
  request_notifications: z.boolean(),
  message_notifications: z.boolean(),
  exchange_reminders: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
});

export const badgeSchema = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9_]+$/, 'Slug must be alphanumeric with underscores'),
  name: z.string().min(2).max(50),
  description: z.string().min(5).max(200),
  icon_name: z.string().min(2).max(50),
  criteria_type: z.string().min(2).max(50),
  criteria_value: z.number().int().positive(),
  is_active: z.boolean().default(true),
});
