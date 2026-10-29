import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#1F2937]',
              'placeholder:text-[#94A3B8] transition-all duration-150',
              'focus-visible:outline-none focus-visible:border-[#4B3F72] focus-visible:ring-2 focus-visible:ring-[#A78BFA]/40',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F8FAFC]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#EF4444] focus-visible:ring-[#EF4444]/30 focus-visible:border-[#EF4444]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-[#94A3B8] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
