import React, { useState, forwardRef } from 'react';
import { Input, InputProps } from '../ui/Input';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordFieldProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        leftIcon={<Lock className="w-4 h-4" />}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#94A3B8] hover:text-[#1F2937] transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';
