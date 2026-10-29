import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { ShieldAlert, Star, CheckCircle, Lock } from 'lucide-react';

export const Trust: React.FC = () => {
  const trustPillars = [
    {
      title: 'Two-Way Verified Reviews (Phase 6)',
      status: 'In Active Development',
      description:
        'Reviews are only unlockable after both participants independently confirm that a scheduled exchange session occurred, preventing fraudulent or retaliatory ratings.',
      icon: <Star className="w-5 h-5 text-[#4B3F72]" />,
    },
    {
      title: 'Institutional Verification (Phase 6)',
      status: 'Architecture Ready',
      description:
        'Members will be able to verify student or faculty status through institutional email validation and manual admin review for trusted campus badges.',
      icon: <CheckCircle className="w-5 h-5 text-[#4B3F72]" />,
    },
    {
      title: 'User Reporting & Safety (Phase 6)',
      status: 'Schema Integrated',
      description:
        'A comprehensive moderation framework with instant user blocking, report triage, and administrative oversight to uphold academic and personal integrity.',
      icon: <ShieldAlert className="w-5 h-5 text-[#4B3F72]" />,
    },
    {
      title: 'Privacy & Data Protection',
      status: 'Row-Level Enforced',
      description:
        'PostgreSQL Row Level Security (RLS) guarantees that private profiles, contact details, and private notes can never be read by unauthorized parties.',
      icon: <Lock className="w-5 h-5 text-[#4B3F72]" />,
    },
  ];

  return (
    <section id="trust" className="py-20 bg-white border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Safety & Academic Integrity"
          title="Trust & Safety Foundation"
          subtitle="Pairly is built from the ground up to foster safe, respectful, and accountable peer exchanges."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {trustPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 space-y-3 transition-colors hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center">
                  {pillar.icon}
                </div>
                <span className="text-[11px] font-semibold text-[#4B3F72] bg-[#E0E7FF] px-2.5 py-0.5 rounded-full">
                  {pillar.status}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#1F2937]">{pillar.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Responsible Roadmap Callout */}
        <div className="mt-10 mx-auto max-w-2xl text-center p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
          <p>
            <strong className="text-[#1F2937]">Honest Platform Status:</strong> Pairly is in Phase 1 (Foundation & Landing Experience). Authentication, live exchange records, reviews, and badges will activate in subsequent planned phases.
          </p>
        </div>
      </div>
    </section>
  );
};
