import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface OnboardingStepperProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
  className,
}) => {
  return (
    <div className={cn('w-full select-none', className)}>
      <div className="flex items-center justify-between relative">
        {/* Connecting track line */}
        <div
          className="absolute left-6 right-6 top-5 h-0.5 bg-[#E2E8F0] -z-0"
          aria-hidden="true"
        />
        <div
          className="absolute left-6 top-5 h-0.5 bg-[#4B3F72] -z-0 transition-all duration-300"
          style={{
            width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%`,
          }}
          aria-hidden="true"
        />

        {steps.map((s) => {
          const isCompleted = s.number < currentStep;
          const isCurrent = s.number === currentStep;
          const canClick = isCompleted && onStepClick;

          return (
            <div
              key={s.number}
              className="flex flex-col items-center relative z-10"
            >
              <button
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onStepClick(s.number)}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all duration-200 border-2',
                  isCompleted
                    ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                    : isCurrent
                    ? 'bg-[#4B3F72] text-white border-[#4B3F72] ring-4 ring-[#A78BFA]/30 shadow-xs'
                    : 'bg-white text-[#64748B] border-[#CBD5E1]',
                  canClick && 'hover:scale-105 cursor-pointer'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : s.number}
              </button>

              <div className="hidden sm:flex flex-col items-center text-center mt-2">
                <span
                  className={cn(
                    'text-xs font-bold leading-tight',
                    isCurrent ? 'text-[#4B3F72]' : isCompleted ? 'text-[#1F2937]' : 'text-[#64748B]'
                  )}
                >
                  {s.title}
                </span>
                <span className="text-[10px] text-[#94A3B8] max-w-[110px] leading-tight mt-0.5">
                  {s.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
