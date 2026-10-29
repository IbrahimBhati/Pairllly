import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Compass, Share2, Users2, Network } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      title: 'Learn New Skills',
      description:
        'Acquire practical abilities from peers who recently walked the same path. Learn coding, languages, design tools, or math with personalized 1-on-1 pacing.',
      icon: <Compass className="w-6 h-6 text-[#4B3F72]" />,
    },
    {
      title: 'Share Existing Knowledge',
      description:
        'Teaching cements mastery. By helping someone understand a concept or software skill you know well, you sharpen your own communication and confidence.',
      icon: <Share2 className="w-6 h-6 text-[#4B3F72]" />,
    },
    {
      title: 'Meet Compatible People',
      description:
        'Connect with members based on shared intellectual curiosity and complementary goals. Our reciprocal matching ensures no one feels like they owe a favor.',
      icon: <Users2 className="w-6 h-6 text-[#4B3F72]" />,
    },
    {
      title: 'Build Meaningful Connections',
      description:
        'Form lasting academic, career, and personal networks. Turn a single tutoring session into an ongoing study group, portfolio collaboration, or mentorship.',
      icon: <Network className="w-6 h-6 text-[#4B3F72]" />,
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Value Beyond Currency"
          title="Why Share on Pairly?"
          subtitle="Knowledge compounds when exchanged freely. Discover the benefits of reciprocal peer learning."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">{b.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
