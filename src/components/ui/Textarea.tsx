import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[90px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#1F2937]',
            'placeholder:text-[#94A3B8] transition-all duration-150 resize-y',
            'focus-visible:outline-none focus-visible:border-[#4B3F72] focus-visible:ring-2 focus-visible:ring-[#A78BFA]/40',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F8FAFC]',
            error && 'border-[#EF4444] focus-visible:ring-[#EF4444]/30 focus-visible:border-[#EF4444]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
