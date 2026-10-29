import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Pairly...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center select-none',
        className
      )}
    >
      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#4B3F72]/10 mb-4">
        <Loader2 className="w-6 h-6 text-[#4B3F72] animate-spin" />
      </div>
      <p className="text-sm font-medium text-[#4B3F72]">{message}</p>
      <p className="text-xs text-[#64748B] mt-1">Connecting skills and community</p>
    </div>
  );
};
