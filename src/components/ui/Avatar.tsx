import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  fallback,
  size = 'md',
  isVerified = false,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const displayName = name || fallback || 'User';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const getInitials = (text: string) => {
    if (!text) return 'P';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden font-semibold select-none border border-[#E2E8F0] shadow-xs',
          'bg-[#4B3F72]/10 text-[#4B3F72]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={displayName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : displayName ? (
          <span>{getInitials(displayName)}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-[#4B3F72]" />
        )}
      </div>

      {isVerified && (
        <span
          title="Verified Member"
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white text-[9px]"
        >
          ✓
        </span>
      )}
    </div>
  );
};
