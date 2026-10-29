import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { ListingCard } from '../components/listings/ListingCard';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { SendRequestDialog } from '../components/requests/SendRequestDialog';
import { ReportDialog } from '../components/safety/ReportDialog';
import { BlockUserDialog } from '../components/safety/BlockUserDialog';
import { ProfileService } from '../lib/services/profileService';
import { SkillsService } from '../lib/services/skillsService';
import { ListingsService } from '../lib/services/listingsService';
import { ReviewsService } from '../lib/services/reviewsService';
import { GamificationService } from '../lib/services/gamificationService';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  GraduationCap,
  MapPin,
  Clock,
  Calendar,
  Lock,
  Edit2,
  CheckCircle2,
  BookOpen,
  Layers,
  Award,
  Star,
  ShieldAlert,
  Send,
} from 'lucide-react';
import type { Profile, UserSkill, Listing, Review, UserBadge } from '../types/database';

export interface ProfileViewPageProps {
  username?: string;
  onNavigate: (path: string) => void;
}

export const ProfileViewPage: React.FC<ProfileViewPageProps> = ({ username, onNavigate }) => {
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal dialog states
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const targetUsername = username || currentUserProfile?.username;
  const isOwner = Boolean(currentUserProfile && profile && currentUserProfile.id === profile.id);

  useEffect(() => {
    async function loadProfile() {
      if (!targetUsername) return;
      setIsLoading(true);
      setError(null);
      try {
        const p = await ProfileService.getProfileByUsername(targetUsername, user?.id);
        if (!p) {
          setError('Profile not found or is set to private.');
          return;
        }
        setProfile(p);

        // Fetch skills, listings, real reviews & badges in parallel
        const [skills, allListings, userReviews, userBadges] = await Promise.all([
          SkillsService.getUserSkills(p.id),
          ListingsService.getPublicListings(),
          ReviewsService.getReviewsForUser(p.id),
          GamificationService.getUserBadges(p.id),
        ]);

        setUserSkills(skills);
        setListings(allListings.filter((l: Listing) => l.owner_id === p.id));
        setReviews(userReviews);
        setBadges(userBadges);
      } catch (err) {
        setError((err as Error).message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [targetUsername, user]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
        <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorState
          title="Profile Unavailable"
          description={error || 'This user profile cannot be displayed.'}
          onAction={() => onNavigate('/explore')}
          actionLabel="Explore Community"
        />
      </div>
    );
  }

  const offeredSkills = userSkills.filter((s) => s.direction === 'offer');
  const wantedSkills = userSkills.filter((s) => s.direction === 'want');

  // Compute real review metrics (strictly no fabrication)
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#4B3F72] via-[#5d4f8d] to-[#A78BFA]" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                src={profile.avatar_url}
                fallback={profile.display_name}
                size="xl"
                className="ring-4 ring-white shadow-md bg-white"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
                    {profile.display_name}
                  </h1>
                  {profile.verification_status === 'verified' && (
                    <span
                      title="Verified University Member"
                      className="inline-flex items-center text-[#4B3F72]"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-[#A7F3D0] text-[#4B3F72]" />
                    </span>
                  )}
                  {profile.profile_visibility === 'private' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-[#64748B] px-2 py-0.5 rounded-md font-mono">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium">
                  @{profile.username} &bull; <span className="capitalize">{profile.account_type}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isOwner ? (
                <Button
                  size="sm"
                  onClick={() => onNavigate('/profile/edit')}
                  className="bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => setShowConnectDialog(true)}
                    className="bg-[#4B3F72] hover:bg-[#3d335d] text-white flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportDialog(true)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    title="Report Member"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed max-w-2xl mt-2 mb-4">
              {profile.bio}
            </p>
          )}

          {/* Institutional & Context Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
            {profile.institution && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#4B3F72] shrink-0" />
                <span className="truncate">{profile.institution}</span>
              </div>
            )}
            {profile.department && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#4B3F72] shrink-0" />
                <span className="truncate">{profile.department}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4B3F72] shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.timezone && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#4B3F72] shrink-0" />
                <span className="truncate">{profile.timezone}</span>
              </div>
            )}
            {profile.availability && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#4B3F72] shrink-0" />
                <span className="truncate">{profile.availability}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real Statistics / Trust Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center">
          <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
            Offered Skills
          </span>
          <span className="text-xl font-bold text-[#4B3F72] mt-1 block">
            {offeredSkills.length}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center">
          <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
            Learning Goals
          </span>
          <span className="text-xl font-bold text-[#4B3F72] mt-1 block">
            {wantedSkills.length}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center">
          <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
            Member Rating
          </span>
          <div className="flex items-center justify-center gap-1 mt-1">
            {averageRating ? (
              <>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xl font-bold text-[#1F2937]">{averageRating}</span>
                <span className="text-[10px] text-[#94A3B8]">({reviews.length})</span>
              </>
            ) : (
              <span className="text-xs text-[#94A3B8] italic">New Member</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center">
          <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
            Earned Badges
          </span>
          <span className="text-xl font-bold text-[#047857] mt-1 block">
            {badges.length}
          </span>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <CardTitle className="text-base text-[#1F2937] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#4B3F72]" />
              <span>Earned Community Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((ub) => (
                <div
                  key={ub.id}
                  className="p-3 rounded-xl bg-purple-50/50 border border-[#A78BFA]/30 flex items-start gap-3"
                >
                  <div className="p-2 bg-white rounded-lg border border-[#A78BFA]/20 text-[#4B3F72]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F2937]">{ub.badge?.name}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{ub.badge?.description}</p>
                    <span className="text-[10px] text-[#94A3B8] font-mono block mt-1">
                      Awarded {new Date(ub.awarded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offered Skills */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1F2937] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4B3F72]" />
                <span>Skills Offered (Can Teach)</span>
              </CardTitle>
              <span className="text-xs font-mono text-[#64748B]">{offeredSkills.length}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {offeredSkills.length > 0 ? (
              <div className="space-y-2.5">
                {offeredSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1F2937] block">
                        {s.skill?.name || 'Skill'}
                      </span>
                      {s.notes && (
                        <p className="text-[11px] text-[#64748B] mt-0.5 italic">&ldquo;{s.notes}&rdquo;</p>
                      )}
                    </div>
                    {s.proficiency && (
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#A7F3D0]/60 text-[#065F46]">
                        {s.proficiency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic p-3">No skills listed yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Wanted Skills */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1F2937] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4B3F72]" />
                <span>Skills Wanted (Wants to Learn)</span>
              </CardTitle>
              <span className="text-xs font-mono text-[#64748B]">{wantedSkills.length}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {wantedSkills.length > 0 ? (
              <div className="space-y-2.5">
                {wantedSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1F2937] block">
                        {s.skill?.name || 'Skill'}
                      </span>
                      {s.notes && (
                        <p className="text-[11px] text-[#64748B] mt-0.5 italic">&ldquo;{s.notes}&rdquo;</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">Learning Goal</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic p-3">No learning goals listed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Published Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#1F2937]">Published Listings</h2>
          <span className="text-xs text-[#64748B]">{listings.length} Available</span>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isOwner={isOwner}
                onViewDetails={(id) => onNavigate(`/listings/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-xs text-[#64748B] bg-white">
            <p>No active public listings currently published by this member.</p>
          </div>
        )}
      </div>

      {/* Reviews & Testimonials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#1F2937]">Peer Reviews</h2>
          <span className="text-xs text-[#64748B]">{reviews.length} Verified</span>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                onViewProfile={(uname) => onNavigate(`/profile/${uname}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-xs text-[#64748B] bg-white">
            <p>No reviews yet. Reviews are submitted following dual-confirmed skill exchanges.</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {!isOwner && profile && (
        <>
          <SendRequestDialog
            isOpen={showConnectDialog}
            onClose={() => setShowConnectDialog(false)}
            recipientProfile={profile}
            onSuccess={() => {
              setShowConnectDialog(false);
              onNavigate('/requests');
            }}
          />
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            reportedUser={profile}
            onSuccess={() => setShowReportDialog(false)}
          />
          <BlockUserDialog
            isOpen={showBlockDialog}
            onClose={() => setShowBlockDialog(false)}
            userToBlock={profile}
            onSuccess={() => {
              setShowBlockDialog(false);
              onNavigate('/explore');
            }}
          />
        </>
      )}
    </div>
  );
};
