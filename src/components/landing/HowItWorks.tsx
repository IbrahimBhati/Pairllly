import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { UserCheck, SlidersHorizontal, Users } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      description:
        'Sign up with your campus or personal email. Specify whether you are a student, teacher, professional, or community member.',
      icon: <UserCheck className="w-6 h-6 text-[#4B3F72]" />,
    },
    {
      step: '02',
      title: 'List Offers & Needs',
      description:
        'Select skills you can teach with your proficiency level, and specify the skills you are passionate to learn next.',
      icon: <SlidersHorizontal className="w-6 h-6 text-[#4B3F72]" />,
    },
    {
      step: '03',
      title: 'Discover & Connect',
      description:
        'Pairly calculates reciprocal compatibility automatically so you exchange time and knowledge with perfectly aligned peers.',
      icon: <Users className="w-6 h-6 text-[#4B3F72]" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Simple & Reciprocal"
          title="How Pairly Works"
          subtitle="Skill sharing should be straightforward, honest, and mutually rewarding. Three clear steps get you started."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 transition-all hover:bg-white hover:shadow-md hover:border-[#CBD5E1]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#E0E7FF] border border-[#CBD5E1]/50">
                  {item.icon}
                </div>
                <span className="text-2xl font-black font-mono text-[#CBD5E1]">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">{item.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
