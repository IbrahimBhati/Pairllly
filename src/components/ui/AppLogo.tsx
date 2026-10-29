import React from 'react';
import { cn } from '../../lib/utils';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className,
  size = 'md',
  showTagline = false,
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Dynamic interlocking skill-swap geometric mark */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-[#4B3F72] text-white shadow-sm shrink-0',
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/5 h-4/5 text-white"
        >
          {/* Two balanced, interlaced skill exchange vectors */}
          <path d="M16 3h5v5" />
          <path d="M4 20L21 3" />
          <path d="M21 16v5h-5" />
          <path d="M15 15l6 6" />
          <path d="M4 4l5 5" />
        </svg>
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#A7F3D0] border-2 border-[#F8FAFC]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            'font-extrabold tracking-tight text-[#1F2937] leading-none font-sans',
            sizeClasses[size]
          )}
        >
          Pairly<span className="text-[#A78BFA]">.</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-[#64748B] tracking-wide mt-0.5">
            Share Skills. Help Others.
          </span>
        )}
      </div>
    </div>
  );
};
