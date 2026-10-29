import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../lib/validation/schemas';
import type { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PasswordField } from './PasswordField';
import { FormError } from './FormError';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess: () => void;
  onNavigateSignup: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateSignup,
  onNavigateForgotPassword,
}) => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await login(data.email, data.password);
      if (res.error) {
        setServerError(res.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      setServerError((err as Error).message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormError message={serverError} />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1F2937]" htmlFor="email">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="yourname@university.edu"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1F2937]" htmlFor="password">
            Password
          </label>
          <button
            type="button"
            onClick={onNavigateForgotPassword}
            className="text-xs font-medium text-[#4B3F72] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <PasswordField
          id="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isSubmitting}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign In
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-[#64748B]">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={onNavigateSignup}
            className="font-bold text-[#4B3F72] hover:underline cursor-pointer"
          >
            Sign up for free
          </button>
        </p>
      </div>
    </form>
  );
};
