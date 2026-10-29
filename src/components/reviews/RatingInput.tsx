import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const activeRating = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= activeRating;

        return (
          <button
            key={starNumber}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starNumber)}
            onMouseEnter={() => !disabled && setHoverValue(starNumber)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            className={`p-0.5 transition-transform ${
              !disabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
