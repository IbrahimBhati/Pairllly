import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="w-6 h-6" />;
    }
    return icon;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center max-w-md mx-auto rounded-2xl border border-dashed border-[#CBD5E1] bg-white/60',
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#4B3F72]/10 text-[#4B3F72] mb-3.5">
          {renderIcon()}
        </div>
      )}
      <h4 className="text-base font-bold text-[#1F2937]">{title}</h4>
      <p className="mt-1 text-xs text-[#64748B] leading-relaxed max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
