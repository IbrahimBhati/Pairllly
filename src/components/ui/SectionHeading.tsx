import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  kicker,
  title,
  subtitle,
  align = 'center',
  className,
}) => {
  return (
    <div
      className={cn(
        'max-w-2xl mb-12',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {kicker && (
        <p className="text-xs font-bold uppercase tracking-wider text-[#4B3F72] mb-2 font-mono">
          {kicker}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-[#64748B] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
