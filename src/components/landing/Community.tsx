import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { GraduationCap, BookOpen, Briefcase, HeartHandshake } from 'lucide-react';

export const Community: React.FC = () => {
  const roles = [
    {
      title: 'Students',
      icon: <GraduationCap className="w-6 h-6 text-[#4B3F72]" />,
      tagline: 'Excel in Coursework & Skills',
      description:
        'Exchange exam prep, programming lab assistance, language practice, and design pointers with classmates and upper-year peers without breaking student budgets.',
      skills: ['Calculus', 'Python', 'Essay Editing', 'UI Design'],
    },
    {
      title: 'Teachers & TAs',
      icon: <BookOpen className="w-6 h-6 text-[#4B3F72]" />,
      tagline: 'Mentor & Expand Horizons',
      description:
        'Share pedagogical expertise and subject mastery while picking up emerging creative tools, multimedia production, or modern software frameworks.',
      skills: ['Academic Research', 'Pedagogy', 'Public Speaking', 'Data Tools'],
    },
    {
      title: 'Professionals',
      icon: <Briefcase className="w-6 h-6 text-[#4B3F72]" />,
      tagline: 'Give Back & Cross-Train',
      description:
        'Offer real-world career guidance, portfolio reviews, and industry insights in exchange for fresh perspectives, creative collaboration, and language skills.',
      skills: ['Career Guidance', 'Digital Marketing', 'Excel', 'System Architecture'],
    },
    {
      title: 'Community Members',
      icon: <HeartHandshake className="w-6 h-6 text-[#4B3F72]" />,
      tagline: 'Lifelong Knowledge Exchange',
      description:
        'Connect with local and campus communities to share passions like photography, storytelling, creative writing, and practical life skills in a supportive space.',
      skills: ['Photography', 'Creative Writing', 'Video Editing', 'Spanish'],
    },
  ];

  return (
    <section id="community" className="py-20 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Inclusive Ecosystem"
          title="Designed for Every Knowledge Sharer"
          subtitle="Pairly connects diverse members across academic, professional, and local communities into one cohesive peer exchange network."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 flex flex-col justify-between transition-all hover:border-[#4B3F72]/30 hover:bg-white hover:shadow-md"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-5 shadow-xs">
                  {role.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1F2937]">{role.title}</h3>
                <p className="text-xs font-semibold text-[#4B3F72] mt-0.5 mb-3">{role.tagline}</p>
                <p className="text-xs text-[#64748B] leading-relaxed mb-6">{role.description}</p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
                  Common Exchanges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {role.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-medium text-[#4B3F72] bg-[#E0E7FF]/70 px-2 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
