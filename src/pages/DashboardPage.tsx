import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { SmartMatchCard } from '../components/matching/SmartMatchCard';
import { SendRequestDialog } from '../components/requests/SendRequestDialog';
import {
  Compass,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  Award,
  ArrowRightLeft,
  Mail,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MatchingService } from '../lib/matching/matching-service';
import { RequestsService } from '../lib/services/requestsService';
import { ExchangesService } from '../lib/services/exchangesService';
import { GamificationService } from '../lib/services/gamificationService';
import { SkillsService } from '../lib/services/skillsService';
import { ListingsService } from '../lib/services/listingsService';
import type { UserSkill, Listing, ConnectionRequest, Exchange, UserBadge } from '../types/database';
import type { SmartMatchCandidate } from '../lib/matching/types';

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [topMatches, setTopMatches] = useState<SmartMatchCandidate[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [activeExchanges, setActiveExchanges] = useState<Exchange[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Connect dialog
  const [selectedMatch, setSelectedMatch] = useState<SmartMatchCandidate | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [matches, received, exchanges, listings, skills, badges, points] = await Promise.all([
          MatchingService.getMatchesForUser(user.id),
          RequestsService.getReceivedRequests(user.id),
          ExchangesService.getExchanges(user.id),
          ListingsService.getMyListings(user.id),
          SkillsService.getUserSkills(user.id),
          GamificationService.getUserBadges(user.id),
          GamificationService.getUserPoints(user.id),
        ]);

        setTopMatches(matches.slice(0, 2));
        setPendingRequests(received.filter((r: ConnectionRequest) => r.status === 'pending'));
        setActiveExchanges(exchanges.filter((e: Exchange) => e.status === 'in_progress'));
        setMyListings(listings);
        setMySkills(skills);
        setEarnedBadges(badges);
        setPointsTotal(points.total);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const offeredCount = mySkills.filter((s) => s.direction === 'offer').length;
  const wantedCount = mySkills.filter((s) => s.direction === 'want').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4B3F72] via-[#5D4F8D] to-[#A78BFA] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#A7F3D0]" />
              <span className="font-medium tracking-wide">University Skill Sharing Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.display_name || 'Member'}!
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Your skills have value when shared. Connect with compatible peers, schedule collaborative sessions, and help each other grow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onNavigate('/listings/new')}
              className="bg-[#A7F3D0] hover:bg-[#86efac] text-[#065F46] font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Listing</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('/explore')}
              className="border-white/40 text-white hover:bg-white/10 text-xs h-10 px-4 rounded-xl"
            >
              Explore Community
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Attention Banners */}
      {pendingRequests.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900">
                You have {pendingRequests.length} pending connection proposal{pendingRequests.length > 1 ? 's' : ''}!
              </h4>
              <p className="text-[11px] text-amber-700">
                A peer wants to exchange skills with you. Review their proposal to start chatting.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate('/requests')}
            className="text-xs bg-amber-700 hover:bg-amber-800 text-white"
          >
            Review Requests
          </Button>
        </div>
      )}

      {/* Metrics & Quick Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-[#4B3F72]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Skills Offered</span>
              <span className="text-xl font-bold text-[#1F2937]">{offeredCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Learning Goals</span>
              <span className="text-xl font-bold text-[#1F2937]">{wantedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#047857]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Earned Points</span>
              <span className="text-xl font-bold text-[#1F2937]">{pointsTotal}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Active Exchanges</span>
              <span className="text-xl font-bold text-[#1F2937]">{activeExchanges.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Smart Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4B3F72]" />
            <h2 className="text-lg font-bold text-[#1F2937]">Smart Matches For You</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/explore')}
            className="text-xs text-[#4B3F72] hover:text-[#3d335d] flex items-center gap-1"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {topMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topMatches.map((cand) => (
              <SmartMatchCard
                key={cand.userId}
                match={cand}
                onViewProfile={(uname) => onNavigate(`/profile/${uname}`)}
                onConnect={(c) => setSelectedMatch(c)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-xs text-[#64748B] bg-white">
            <p>No matches calculated yet. Add skills to your profile to discover reciprocal matches!</p>
            <Button
              size="sm"
              onClick={() => onNavigate('/my-skills')}
              className="mt-3 bg-[#4B3F72] text-white text-xs"
            >
              Update Skills
            </Button>
          </div>
        )}
      </div>

      {/* Active Listings Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4B3F72]" />
            <h2 className="text-lg font-bold text-[#1F2937]">Your Active Listings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/my-listings')}
            className="text-xs text-[#4B3F72] hover:text-[#3d335d] flex items-center gap-1"
          >
            <span>Manage Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myListings.slice(0, 3).map((l) => (
              <div
                key={l.id}
                onClick={() => onNavigate(`/listings/${l.id}`)}
                className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#A78BFA] transition-all cursor-pointer shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-50 text-[#4B3F72]">
                    {l.session_format}
                  </span>
                  <span className="text-[10px] font-bold text-[#065F46] bg-[#A7F3D0]/60 px-2 py-0.5 rounded">
                    {l.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#1F2937] line-clamp-1">{l.title}</h4>
                <p className="text-[11px] text-[#64748B] line-clamp-2">{l.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-6 text-center text-xs text-[#64748B] bg-white">
            <p>You haven&apos;t published any listings yet.</p>
            <Button
              size="sm"
              onClick={() => onNavigate('/listings/new')}
              className="mt-2 bg-[#4B3F72] text-white text-xs"
            >
              Create Your First Listing
            </Button>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {selectedMatch && (
        <SendRequestDialog
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          recipientProfile={selectedMatch.profile}
          listing={selectedMatch.relevantListings[0] || null}
          onSuccess={() => {
            setSelectedMatch(null);
            onNavigate('/requests');
          }}
        />
      )}
    </div>
  );
};
