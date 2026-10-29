import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C] animate-in fade-in duration-150',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
};
