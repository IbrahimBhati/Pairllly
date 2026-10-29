import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load content',
  description = 'Something went wrong while communicating with the service. Please check your connection and try again.',
  onRetry,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2]/50',
        className
      )}
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FEE2E2] text-[#EF4444] mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-base font-bold text-[#1F2937]">{title}</h4>
      <p className="mt-1 text-xs text-[#64748B] leading-relaxed mb-4">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
      {onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          className="mt-2"
        >
          {actionLabel || 'Continue'}
        </Button>
      )}
    </div>
  );
};
