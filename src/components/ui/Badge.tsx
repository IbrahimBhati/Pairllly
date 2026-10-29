import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'outline' | 'purple' | 'amber';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    secondary: 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]',
    purple: 'bg-[#4B3F72]/10 text-[#4B3F72] border border-[#4B3F72]/20 font-semibold',
    success: 'bg-[#A7F3D0]/60 text-[#064E3B] border border-[#6EE7B7] font-semibold',
    outline: 'border border-[#CBD5E1] text-[#334155]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 select-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
