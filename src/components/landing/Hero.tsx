import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, BookOpen, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

export interface HeroProps {
  onFindMatch: () => void;
  onOfferSkill: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onFindMatch, onOfferSkill }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background radial accents using Pairly palette */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#A78BFA]/15 via-[#F8FAFC]/5 to-transparent blur-3xl -z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4B3F72] bg-white px-3.5 py-1.5 rounded-full border border-[#E2E8F0] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>University-Level Peer-to-Peer Skill Sharing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2937] tracking-tight leading-[1.15]">
              Your Skills Have More{' '}
              <span className="text-[#4B3F72] relative inline-block">
                Value
                <svg
                  className="absolute left-0 -bottom-1 w-full h-3 text-[#A78BFA]/40 -z-10"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="6" fill="none" />
                </svg>
              </span>{' '}
              When Shared.
            </h1>

            <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Pairly connects students, teachers, professionals, and community members who want to exchange knowledge, learn from one another, and grow together through reciprocal matching.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Button
                variant="primary"
                size="lg"
                onClick={onFindMatch}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-base"
              >
                Find Your Match
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onOfferSkill}
                className="w-full sm:w-auto text-base bg-white"
              >
                Offer a Skill
              </Button>
            </div>

            {/* Quiet metadata indicators */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Deterministic Smart Matching</span>
              </div>
              <span className="text-[#CBD5E1]">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Zero Subscription Fees</span>
              </div>
              <span className="text-[#CBD5E1]">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Reciprocal Exchange</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column: Bespoke Two-Person Skill Exchange Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl border border-[#E2E8F0]">
              {/* Header Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-bold text-[#1F2937]">Reciprocal Match Simulation</span>
                </div>
                <span className="text-xs font-bold text-[#4B3F72] bg-[#A7F3D0]/50 px-2 py-0.5 rounded-md">
                  100% Match
                </span>
              </div>

              {/* Person A */}
              <div className="mt-5 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4B3F72] text-white flex items-center justify-center font-bold text-sm">
                      AK
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F2937]">Alex Kim</h4>
                      <p className="text-xs text-[#64748B]">Design Student · Senior</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#4B3F72] bg-[#E0E7FF] px-2 py-0.5 rounded">
                    Student
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#10B981] block">Teaches</span>
                    <span className="font-semibold text-[#1F2937]">Graphic Design</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#4B3F72] block">Wants</span>
                    <span className="font-semibold text-[#1F2937]">English Fluency</span>
                  </div>
                </div>
              </div>

              {/* Exchange Dynamic Bridge */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-dashed border-[#A78BFA]" />
                </div>
                <div className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B3F72] text-white text-xs font-semibold shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-[#A7F3D0]" />
                  <span>Mutual Skill Exchange</span>
                </div>
              </div>

              {/* Person B */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#A78BFA] text-[#1F2937] flex items-center justify-center font-bold text-sm">
                      SL
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F2937]">Sarah Lin</h4>
                      <p className="text-xs text-[#64748B]">Literature TA · Grad</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#064E3B] bg-[#A7F3D0] px-2 py-0.5 rounded">
                    Teacher
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#10B981] block">Teaches</span>
                    <span className="font-semibold text-[#1F2937]">English Tutoring</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#4B3F72] block">Wants</span>
                    <span className="font-semibold text-[#1F2937]">Graphic Design</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#64748B]">
                  Both members learn exactly what they need at zero monetary cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
