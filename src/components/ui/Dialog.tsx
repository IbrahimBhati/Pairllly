import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Shell */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-2xl bg-white p-6 shadow-xl border border-[#E2E8F0] z-10',
          'transform transition-all',
          maxWidths[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#64748B] leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
