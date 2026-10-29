import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowLeftRight, Check, HelpCircle } from 'lucide-react';

export const SmartMatching: React.FC = () => {
  return (
    <section id="smart-matching" className="py-20 bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Deterministic Intelligence"
          title="Smart Matching: Reciprocal By Design"
          subtitle="Pairly eliminates one-sided transactions. Our matching engine verifies that both participants provide and receive genuine value."
        />

        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 sm:p-10 border border-[#E2E8F0] shadow-sm">
          {/* Static Educational Notice */}
          <div className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
            <HelpCircle className="w-4 h-4 text-[#4B3F72] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#1F2937]">Educational Architecture Demonstration:</strong> Below is a static model showing how Pairly calculates reciprocal match compatibility between two users based on skill direction, coverage arithmetic, and mutual overlap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            {/* Person A Card */}
            <div className="md:col-span-5 rounded-2xl border-2 border-[#4B3F72]/20 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4B3F72] text-white flex items-center justify-center font-bold text-base">
                  A
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1F2937]">Person A (Taylor)</h4>
                  <p className="text-xs text-[#64748B]">Computer Science & Design</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#A7F3D0]/20 border border-[#10B981]/30">
                  <span className="text-[10px] uppercase font-bold text-[#064E3B] tracking-wider block">Offers</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-[#1F2937]">Graphic Design</span>
                    <span className="text-[#064E3B] font-medium text-[11px]">Advanced</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1]">
                  <span className="text-[10px] uppercase font-bold text-[#4B3F72] tracking-wider block">Wants to Learn</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-[#1F2937]">English Tutoring</span>
                    <span className="text-[#64748B] text-[11px]">Goal: Academic Writing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reciprocal Dynamic Bridge */}
            <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#4B3F72] text-[#A7F3D0] flex items-center justify-center shadow-md">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span className="mt-2 text-[11px] font-bold text-[#4B3F72] font-mono">100%</span>
            </div>

            {/* Person B Card */}
            <div className="md:col-span-5 rounded-2xl border-2 border-[#A78BFA]/40 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#A78BFA] text-[#1F2937] flex items-center justify-center font-bold text-base">
                  B
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1F2937]">Person B (Marcus)</h4>
                  <p className="text-xs text-[#64748B]">English Literature Graduate</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#A7F3D0]/20 border border-[#10B981]/30">
                  <span className="text-[10px] uppercase font-bold text-[#064E3B] tracking-wider block">Offers</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-[#1F2937]">English Tutoring</span>
                    <span className="text-[#064E3B] font-medium text-[11px]">Native / Expert</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1]">
                  <span className="text-[10px] uppercase font-bold text-[#4B3F72] tracking-wider block">Wants to Learn</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-[#1F2937]">Graphic Design</span>
                    <span className="text-[#64748B] text-[11px]">Goal: Book Covers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="mt-8 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <h5 className="text-sm font-bold text-[#1F2937] mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#10B981]" />
              Why this pair is a 100% Reciprocal Match:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#64748B]">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <strong className="text-[#1F2937] block mb-1">A &rarr; B Directional Fit</strong>
                Taylor offers Graphic Design, which Marcus specifically designated as a wanted learning goal (100% wants coverage for B).
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <strong className="text-[#1F2937] block mb-1">B &rarr; A Directional Fit</strong>
                Marcus offers English Tutoring, satisfying Taylor's learning goal with zero currency exchanged (100% wants coverage for A).
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
