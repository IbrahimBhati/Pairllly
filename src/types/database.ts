export type AccountType = 'student' | 'teacher' | 'professional' | 'community';
export type ProfileVisibility = 'public' | 'private';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SessionFormat = 'online' | 'in_person' | 'hybrid';
export type ListingStatus = 'draft' | 'published' | 'paused' | 'closed';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  account_type: AccountType;
  institution: string | null;
  department: string | null;
  location: string | null;
  timezone: string | null;
  availability: string | null;
  profile_visibility: ProfileVisibility;
  onboarding_completed: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  direction: 'offer' | 'want';
  proficiency?: SkillProficiency | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  skill?: Skill;
}

export interface Listing {
  id: string;
  owner_id: string;
  user_skill_id: string;
  title: string;
  description: string;
  session_format: SessionFormat;
  location: string | null;
  duration_minutes: number | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  user_skill?: UserSkill;
  owner?: Profile;
}

export interface ListingFormData {
  user_skill_id: string;
  title: string;
  description: string;
  session_format: SessionFormat;
  location?: string;
  duration_minutes?: number;
  status: ListingStatus;
}

export interface OfferedSkillInput {
  skill_id: string;
  proficiency: SkillProficiency;
  notes?: string;
}

export interface WantedSkillInput {
  skill_id: string;
  notes?: string;
}

export interface OnboardingFormData {
  display_name: string;
  username: string;
  account_type: AccountType;
  avatar_url?: string;
  bio?: string;
  institution?: string;
  department?: string;
  location?: string;
  timezone?: string;
  availability?: string;
  offered_skills: OfferedSkillInput[];
  wanted_skills: WantedSkillInput[];
}

// ------------------------------------------------------------------------------
// Phase 4: Smart Matching Types
// ------------------------------------------------------------------------------
export interface SmartMatchResult {
  user_id: string;
  profile: Profile;
  match_percentage: number;
  my_wants_coverage: number;
  their_wants_coverage: number;
  skills_i_offer_they_want: Skill[];
  skills_they_offer_i_want: Skill[];
  explanation: string;
  is_reciprocal: boolean;
  relevant_listings?: Listing[];
}

// ------------------------------------------------------------------------------
// Phase 5: Connection Requests & Realtime Chat Types
// ------------------------------------------------------------------------------
export type ConnectionRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  listing_id: string | null;
  message: string | null;
  status: ConnectionRequestStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  recipient?: Profile;
  listing?: Listing;
}

export interface Conversation {
  id: string;
  connection_request_id: string;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
  last_message_at: string | null;
  participant_one?: Profile;
  participant_two?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: Profile;
}

// ------------------------------------------------------------------------------
// Phase 6: Exchanges, Reviews, Gamification & Trust Types
// ------------------------------------------------------------------------------
export type ExchangeStatus = 'in_progress' | 'completed' | 'cancelled';

export interface Exchange {
  id: string;
  connection_request_id: string;
  status: ExchangeStatus;
  requester_confirmed_at: string | null;
  recipient_confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  connection_request?: ConnectionRequest;
}

export interface Review {
  id: string;
  exchange_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // 1-5
  feedback: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: Profile;
  reviewee?: Profile;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  criteria_type: string;
  criteria_value: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface PointsEntry {
  id: string;
  user_id: string;
  event_key: string;
  event_type: string;
  points: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocked_user?: Profile;
}

export type ReportReason =
  | 'harassment'
  | 'spam'
  | 'scam'
  | 'misleading_listing'
  | 'inappropriate_content'
  | 'impersonation'
  | 'other';

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  listing_id: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  moderator_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  reported_user?: Profile;
  listing?: Listing;
}

export type VerificationMethod = 'institutional_email' | 'manual_review';
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  method: VerificationMethod;
  status: VerificationRequestStatus;
  private_evidence_path: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_note: string | null;
  user?: Profile;
}

// ------------------------------------------------------------------------------
// Phase 7: Admin & Settings Types
// ------------------------------------------------------------------------------
export interface AdminUser {
  user_id: string;
  role: 'admin' | 'superadmin' | 'moderator';
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  email_notifications: boolean;
  request_notifications: boolean;
  message_notifications: boolean;
  exchange_reminders: boolean;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Skill, 'id' | 'created_at'>>;
      };
      user_skills: {
        Row: UserSkill;
        Insert: Omit<UserSkill, 'id' | 'created_at' | 'updated_at' | 'skill'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserSkill, 'id' | 'created_at' | 'updated_at' | 'skill'>>;
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'user_skill' | 'owner'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'user_skill' | 'owner'>>;
      };
      connection_requests: {
        Row: ConnectionRequest;
        Insert: Omit<ConnectionRequest, 'id' | 'created_at' | 'updated_at' | 'requester' | 'recipient' | 'listing'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ConnectionRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'participant_one' | 'participant_two' | 'last_message'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'sender'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      exchanges: {
        Row: Exchange;
        Insert: Omit<Exchange, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Exchange, 'id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'reviewer' | 'reviewee'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Badge, 'id' | 'created_at'>>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, 'id' | 'awarded_at' | 'badge'> & {
          id?: string;
          awarded_at?: string;
        };
        Update: Partial<Omit<UserBadge, 'id' | 'awarded_at'>>;
      };
      points_ledger: {
        Row: PointsEntry;
        Insert: Omit<PointsEntry, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PointsEntry, 'id' | 'created_at'>>;
      };
      user_blocks: {
        Row: UserBlock;
        Insert: Omit<UserBlock, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserBlock, 'id' | 'created_at'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'reporter' | 'reported_user' | 'listing'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at'>>;
      };
      verification_requests: {
        Row: VerificationRequest;
        Insert: Omit<VerificationRequest, 'id' | 'submitted_at' | 'reviewed_at' | 'reviewed_by' | 'user'> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<VerificationRequest, 'id' | 'submitted_at'>>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: AdminUser;
        Update: Partial<AdminUser>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      complete_user_onboarding: {
        Args: {
          p_display_name: string;
          p_username: string;
          p_account_type: string;
          p_bio: string | null;
          p_institution: string | null;
          p_department: string | null;
          p_location: string | null;
          p_timezone: string | null;
          p_availability: string | null;
          p_offered_skills: OfferedSkillInput[];
          p_wanted_skills: WantedSkillInput[];
        };
        Returns: { success: boolean; user_id: string };
      };
      accept_connection_request: {
        Args: { p_request_id: string };
        Returns: { success: boolean; conversation_id: string; request_id: string };
      };
      confirm_exchange_completion: {
        Args: { p_exchange_id: string };
        Returns: { success: boolean; status: string; both_confirmed: boolean };
      };
      is_current_user_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
