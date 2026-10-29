import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ListingCard } from '../components/listings/ListingCard';
import { SmartMatchCard } from '../components/matching/SmartMatchCard';
import { SendRequestDialog } from '../components/requests/SendRequestDialog';
import { ListingsService } from '../lib/services/listingsService';
import { MatchingService } from '../lib/matching/matching-service';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Compass,
  BookOpen,
  Layers,
  Users,
  Sparkles,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import type { Skill, Listing, Profile } from '../types/database';
import type { SmartMatchCandidate } from '../lib/matching/types';

export interface ExplorePageProps {
  onNavigate: (path: string) => void;
}

const SEED_SKILLS: Skill[] = [
  { id: '1', name: 'Programming', slug: 'programming', category: 'Technology', description: 'Web development, mobile apps, algorithms, software engineering, and clean code.', is_active: true, created_at: '2026-10-29' },
  { id: '2', name: 'Graphic Design', slug: 'graphic-design', category: 'Creative & Design', description: 'Visual identity, logo design, illustration, layout, and brand assets.', is_active: true, created_at: '2026-10-29' },
  { id: '3', name: 'Photography', slug: 'photography', category: 'Creative & Design', description: 'Camera composition, lighting, photo editing, and portrait or landscape capture.', is_active: true, created_at: '2026-10-29' },
  { id: '4', name: 'Video Editing', slug: 'video-editing', category: 'Creative & Design', description: 'Post-production, pacing, color grading, sound design, and motion cuts.', is_active: true, created_at: '2026-10-29' },
  { id: '5', name: 'Writing', slug: 'writing', category: 'Communication', description: 'Essay composition, storytelling, copywriting, academic papers, and technical docs.', is_active: true, created_at: '2026-10-29' },
  { id: '6', name: 'English', slug: 'english', category: 'Languages', description: 'Grammar, conversational fluency, pronunciation, and academic literature.', is_active: true, created_at: '2026-10-29' },
  { id: '7', name: 'Mathematics', slug: 'mathematics', category: 'Academics', description: 'Calculus, linear algebra, discrete math, statistics, and applied problem solving.', is_active: true, created_at: '2026-10-29' },
  { id: '8', name: 'Public Speaking', slug: 'public-speaking', category: 'Communication', description: 'Stage presence, speech crafting, presentation delivery, and debate technique.', is_active: true, created_at: '2026-10-29' },
  { id: '9', name: 'UI/UX Design', slug: 'ui-ux-design', category: 'Creative & Design', description: 'User research, wireframing, Figma prototyping, and design system building.', is_active: true, created_at: '2026-10-29' },
  { id: '10', name: 'Digital Marketing', slug: 'digital-marketing', category: 'Business', description: 'SEO, social media growth, email campaigns, and analytics tracking.', is_active: true, created_at: '2026-10-29' },
  { id: '11', name: 'Excel', slug: 'excel', category: 'Business', description: 'Data cleaning, advanced formulas, pivot tables, lookup models, and dashboards.', is_active: true, created_at: '2026-10-29' },
  { id: '12', name: 'Research', slug: 'research', category: 'Academics', description: 'Literature review, empirical methodology, qualitative analysis, and citations.', is_active: true, created_at: '2026-10-29' },
  { id: '13', name: 'Tutoring', slug: 'tutoring', category: 'Academics', description: 'Study planning, peer mentoring, concept mastery, and exam preparation.', is_active: true, created_at: '2026-10-29' },
  { id: '14', name: 'Career Guidance', slug: 'career-guidance', category: 'Professional', description: 'Resume review, interview practice, portfolio curation, and networking strategies.', is_active: true, created_at: '2026-10-29' },
  { id: '15', name: 'Content Creation', slug: 'content-creation', category: 'Media', description: 'Short-form video, scriptwriting, community building, and creative storytelling.', is_active: true, created_at: '2026-10-29' },
];

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'people' | 'skills'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'online' | 'in_person' | 'hybrid'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'offer' | 'want'>('all');

  // People / Smart Matching Filters
  const [reciprocalOnly, setReciprocalOnly] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState<number>(0);

  const [listings, setListings] = useState<Listing[]>([]);
  const [matches, setMatches] = useState<SmartMatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Connect dialog state
  const [selectedCandidate, setSelectedCandidate] = useState<SmartMatchCandidate | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [pubListings, smartMatches] = await Promise.all([
          ListingsService.getPublicListings(),
          MatchingService.getMatchesForUser(user?.id || 'guest-user'),
        ]);
        setListings(pubListings);
        setMatches(smartMatches);
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set(SEED_SKILLS.map((s) => s.category));
    return Array.from(set).sort();
  }, []);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesDesc = l.description.toLowerCase().includes(q);
        const matchesSkill = l.user_skill?.skill?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSkill) return false;
      }

      if (selectedCategory !== 'all') {
        const skillCat = l.user_skill?.skill?.category;
        if (skillCat !== selectedCategory) return false;
      }

      if (formatFilter !== 'all' && l.session_format !== formatFilter) {
        return false;
      }

      if (directionFilter !== 'all') {
        const dir = l.user_skill?.direction;
        if (dir !== directionFilter) return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedCategory, formatFilter, directionFilter]);

  // Filtered Smart Match Candidates
  const filteredCandidates = useMemo(() => {
    return matches.filter((c) => {
      if (reciprocalOnly && !c.scoreDetails.isReciprocal) {
        return false;
      }
      if (c.scoreDetails.matchPercentage < minMatchScore) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.profile.display_name.toLowerCase().includes(q);
        const matchesBio = c.profile.bio?.toLowerCase().includes(q) || false;
        const matchesTeach = c.scoreDetails.skillsTheyOfferIWant.some((s) => s.name.toLowerCase().includes(q));
        const matchesLearn = c.scoreDetails.skillsIOfferTheyWant.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesTeach && !matchesLearn) return false;
      }
      return true;
    });
  }, [matches, reciprocalOnly, minMatchScore, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Explore Campus Community"
        description="Discover peers with complementary knowledge, explore reciprocal matches, and browse active listings."
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'listings'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Listings</span>
          <span className="text-[11px] opacity-80">({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'people'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Matching</span>
          <span className="text-[11px] opacity-80">({matches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'skills'
              ? 'bg-[#4B3F72] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Skills Catalog</span>
          <span className="text-[11px] opacity-80">({SEED_SKILLS.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'people'
                  ? 'Search by peer name, skill offered, or learning goal...'
                  : activeTab === 'skills'
                  ? 'Search skill catalog...'
                  : 'Search listings by title, skill, description...'
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-[#1F2937]"
            />
          </div>

          {activeTab === 'listings' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value="all">All Types</option>
                <option value="offer">Offers Only</option>
                <option value="want">Requests Only</option>
              </select>

              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value="all">All Formats</option>
                <option value="online">Online</option>
                <option value="in_person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="flex items-center gap-1.5 text-xs text-[#1F2937] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={reciprocalOnly}
                  onChange={(e) => setReciprocalOnly(e.target.checked)}
                  className="rounded text-[#4B3F72] focus:ring-[#A78BFA] w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#047857]" />
                  Reciprocal Only
                </span>
              </label>

              <select
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
              >
                <option value={0}>Any Match %</option>
                <option value={50}>50% and above</option>
                <option value={75}>75% and above</option>
                <option value={100}>100% Perfect Match</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : activeTab === 'listings' ? (
        filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isOwner={l.owner_id === user?.id}
                onViewDetails={(id) => onNavigate(`/listings/${id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="No Listings Found"
            description="Try adjusting your filters or search terms to explore other peer offerings."
          />
        )
      ) : activeTab === 'people' ? (
        filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCandidates.map((cand) => (
              <SmartMatchCard
                key={cand.userId}
                match={cand}
                onViewProfile={(uname) => onNavigate(`/profile/${uname}`)}
                onConnect={(c) => setSelectedCandidate(c)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No Matching Peers Found"
            description="Ensure you have added both skills you can teach and skills you want to learn in your profile to generate reciprocal compatibility!"
            actionLabel="Manage My Skills"
            onAction={() => onNavigate('/my-skills')}
          />
        )
      ) : (
        /* Skills Catalog Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEED_SKILLS.map((s) => (
            <Card key={s.id} className="border-[#E2E8F0] hover:border-[#A78BFA] transition-colors p-4">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">{s.category}</span>
              <h4 className="font-bold text-sm text-[#1F2937] mt-0.5">{s.name}</h4>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{s.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Dialog */}
      {selectedCandidate && (
        <SendRequestDialog
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          recipientProfile={selectedCandidate.profile}
          listing={selectedCandidate.relevantListings[0] || null}
          onSuccess={() => {
            setSelectedCandidate(null);
            onNavigate('/requests');
          }}
        />
      )}
    </div>
  );
};
