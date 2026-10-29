import React from 'react';
import { GraduationCap, BookOpen, Briefcase, HeartHandshake, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AccountType } from '../../types/database';

export interface AccountTypeSelectorProps {
  value: AccountType;
  onChange: (value: AccountType) => void;
  className?: string;
  error?: string;
}

const ACCOUNT_OPTIONS: {
  type: AccountType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'student',
    label: 'Student',
    description: 'Enrolled in university or college, looking to swap academic & creative skills.',
    icon: <GraduationCap className="w-5 h-5 text-[#4B3F72]" />,
  },
  {
    type: 'teacher',
    label: 'Teacher / TA',
    description: 'Educator, researcher, or teaching assistant sharing academic depth.',
    icon: <BookOpen className="w-5 h-5 text-[#4B3F72]" />,
  },
  {
    type: 'professional',
    label: 'Professional',
    description: 'Industry practitioner offering career, coding, or practical guidance.',
    icon: <Briefcase className="w-5 h-5 text-[#4B3F72]" />,
  },
  {
    type: 'community',
    label: 'Community',
    description: 'Lifelong learner sharing hobbies, languages, or personal expertise.',
    icon: <HeartHandshake className="w-5 h-5 text-[#4B3F72]" />,
  },
];

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  value,
  onChange,
  className,
  error,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-semibold text-[#1F2937]">Select Account Type</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACCOUNT_OPTIONS.map((option) => {
          const isSelected = value === option.type;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={cn(
                'relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer',
                isSelected
                  ? 'border-[#4B3F72] bg-[#4B3F72]/5 ring-1 ring-[#4B3F72] shadow-xs'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors',
                  isSelected ? 'bg-[#4B3F72] text-white' : 'bg-[#F1F5F9] text-[#4B3F72]'
                )}
              >
                {isSelected ? <Check className="w-5 h-5 text-white" /> : option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[#1F2937]">
                  {option.label}
                </span>
                <span className="block text-xs text-[#64748B] mt-0.5 leading-snug">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
};
