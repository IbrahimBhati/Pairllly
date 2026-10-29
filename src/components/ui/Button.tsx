import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-[#4B3F72] text-white hover:bg-[#3E3360] shadow-sm active:scale-[0.98]',
      secondary: 'bg-[#A78BFA] text-[#1F2937] hover:bg-[#9677ea] font-medium shadow-sm active:scale-[0.98]',
      outline: 'border border-[#E2E8F0] bg-white text-[#1F2937] hover:bg-[#F1F5F9] shadow-xs active:scale-[0.98]',
      ghost: 'bg-transparent text-[#1F2937] hover:bg-[#F1F5F9] active:bg-[#E2E8F0]',
      success: 'bg-[#A7F3D0] text-[#064E3B] hover:bg-[#86efac] font-medium shadow-xs',
      destructive: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 rounded-xl gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5 min-h-[46px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
