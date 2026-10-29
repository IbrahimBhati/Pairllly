import React from 'react';
import { Globe, MapPin, Shuffle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SessionFormat } from '../../types/database';

export interface SessionFormatBadgeProps {
  format: SessionFormat;
  location?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const SessionFormatBadge: React.FC<SessionFormatBadgeProps> = ({
  format,
  location,
  className,
  size = 'md',
}) => {
  const configs: Record<SessionFormat, { label: string; icon: React.ReactNode }> = {
    online: {
      label: 'Online',
      icon: <Globe className="w-3.5 h-3.5 text-[#4B3F72]" />,
    },
    in_person: {
      label: location ? `In-Person (${location})` : 'In-Person',
      icon: <MapPin className="w-3.5 h-3.5 text-[#10B981]" />,
    },
    hybrid: {
      label: location ? `Hybrid (${location})` : 'Hybrid',
      icon: <Shuffle className="w-3.5 h-3.5 text-[#A78BFA]" />,
    },
  };

  const current = configs[format] || configs.online;
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg bg-white border border-[#E2E8F0] font-medium text-[#1F2937] shadow-2xs',
        sizeClasses[size],
        className
      )}
    >
      {current.icon}
      <span className="truncate max-w-[180px]">{current.label}</span>
    </span>
  );
};
