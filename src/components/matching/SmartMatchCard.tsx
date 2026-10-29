import React from 'react';
import { Sparkles, ArrowRightLeft, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import type { SmartMatchCandidate } from '../../lib/matching/types';

interface SmartMatchCardProps {
  match: SmartMatchCandidate;
  onViewProfile: (username: string) => void;
  onConnect: (candidate: SmartMatchCandidate) => void;
}

export const SmartMatchCard: React.FC<SmartMatchCardProps> = ({
  match,
  onViewProfile,
  onConnect,
}) => {
  const { profile, scoreDetails, relevantListings } = match;
  const isHighMatch = scoreDetails.matchPercentage >= 75;

  return (
    <Card className={`border transition-all duration-200 hover:shadow-md ${
      scoreDetails.isReciprocal 
        ? 'border-[#A78BFA]/50 bg-gradient-to-b from-[#F8FAFC] to-[#F5F3FF]' 
        : 'border-[#E2E8F0] bg-white'
    }`}>
      <CardContent className="p-6 space-y-5">
        {/* Header: User Info & Match Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={profile.avatar_url}
              fallback={profile.display_name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[#1F2937] text-base leading-tight">
                  {profile.display_name}
                </h3>
                {profile.verification_status === 'verified' && (
                  <CheckCircle2 className="w-4 h-4 text-[#4B3F72]" />
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                @{profile.username} &bull; <span className="capitalize">{profile.account_type}</span>
              </p>
              {profile.institution && (
                <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">
                  {profile.institution}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm ${
              scoreDetails.isReciprocal
                ? 'bg-[#4B3F72] text-white shadow-sm'
                : isHighMatch
                ? 'bg-[#A78BFA]/20 text-[#4B3F72]'
                : 'bg-slate-100 text-[#64748B]'
            }`}>
              {scoreDetails.isReciprocal ? (
                <ArrowRightLeft className="w-4 h-4 text-[#A7F3D0]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              )}
              <span>{scoreDetails.matchPercentage}% Match</span>
            </div>
            {scoreDetails.isReciprocal && (
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#4B3F72] mt-1 bg-[#A7F3D0]/40 px-2 py-0.5 rounded-md">
                Reciprocal Fit
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Explanation */}
        <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]/80 text-xs text-[#475569] leading-relaxed">
          <p>{scoreDetails.explanation}</p>
        </div>

        {/* 2-Way Skills Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* You offer -> They want */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4B3F72] mb-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>You Can Teach</span>
            </div>
            {scoreDetails.skillsIOfferTheyWant.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {scoreDetails.skillsIOfferTheyWant.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[#A78BFA]/15 text-[#4B3F72] font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#94A3B8] italic">No direct match to their requests</p>
            )}
          </div>

          {/* They offer -> You want */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#047857] mb-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>They Can Teach You</span>
            </div>
            {scoreDetails.skillsTheyOfferIWant.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {scoreDetails.skillsTheyOfferIWant.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[#A7F3D0]/60 text-[#065F46] font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#94A3B8] italic">No direct match to your wants</p>
            )}
          </div>
        </div>

        {/* Relevant Listing snippet if present */}
        {relevantListings.length > 0 && (
          <div className="text-xs text-[#64748B] bg-slate-50 p-2.5 rounded-xl border border-dashed border-[#CBD5E1]">
            <span className="font-semibold text-[#1F2937]">Active Listing: </span>
            <span>&ldquo;{relevantListings[0].title}&rdquo;</span>
            <span className="ml-2 font-mono text-[10px] text-[#64748B]">
              ({relevantListings[0].session_format} &bull; {relevantListings[0].duration_minutes || 60}m)
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(profile.username)}
            className="text-xs border-[#CBD5E1] hover:bg-slate-50"
          >
            View Profile
          </Button>

          <Button
            size="sm"
            onClick={() => onConnect(match)}
            className="text-xs bg-[#4B3F72] hover:bg-[#3d335d] text-white"
          >
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
