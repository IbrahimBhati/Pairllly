import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AuthLoadingStateProps {
  message?: string;
  className?: string;
}

export const AuthLoadingState: React.FC<AuthLoadingStateProps> = ({
  message = 'Authenticating session...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white border border-[#E2E8F0] shadow-xs',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4B3F72]/10 mb-3">
        <Loader2 className="w-6 h-6 text-[#4B3F72] animate-spin" />
      </div>
      <p className="text-sm font-bold text-[#1F2937]">{message}</p>
      <p className="text-xs text-[#64748B] mt-1">Verifying your credentials and access permissions</p>
    </div>
  );
};
