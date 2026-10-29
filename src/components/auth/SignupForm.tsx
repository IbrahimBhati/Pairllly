import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../lib/validation/schemas';
import type { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PasswordField } from './PasswordField';
import { FormError } from './FormError';
import { AccountTypeSelector } from './AccountTypeSelector';
import { Mail, User, AtSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AccountType } from '../../types/database';

type SignupFormData = z.infer<typeof signupSchema>;

export interface SignupFormProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onNavigateLogin }) => {
  const { signup } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      account_type: 'student' as AccountType,
      display_name: '',
      username: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    try {
      const res = await signup({
        email: data.email,
        password: data.password,
        displayName: data.display_name,
        username: data.username,
        accountType: data.account_type,
      });

      if (res.error) {
        setServerError(res.error);
      } else if (res.requiresVerification) {
        setVerificationPendingEmail(data.email);
      } else {
        onSuccess();
      }
    } catch (err) {
      setServerError((err as Error).message || 'Signup failed');
    }
  };

  if (verificationPendingEmail) {
    return (
      <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-6 text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[#A7F3D0]/60 text-[#064E3B] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1F2937]">Verify Your Email</h3>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            We sent a verification link to <strong className="text-[#1F2937]">{verificationPendingEmail}</strong>.
            Please click the link in your email to confirm your account and begin onboarding.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={onNavigateLogin}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormError message={serverError} />

      {/* Account Type Selector */}
      <Controller
        name="account_type"
        control={control}
        render={({ field }) => (
          <AccountTypeSelector
            value={field.value}
            onChange={field.onChange}
            error={errors.account_type?.message}
          />
        )}
      />

      {/* Display Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1F2937]" htmlFor="display_name">
          Full Name
        </label>
        <Input
          id="display_name"
          placeholder="e.g. Jordan Miller"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.display_name?.message}
          {...register('display_name')}
        />
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1F2937]" htmlFor="username">
          Unique Username
        </label>
        <Input
          id="username"
          placeholder="e.g. jordan_m"
          leftIcon={<AtSign className="w-4 h-4" />}
          error={errors.username?.message}
          {...register('username')}
        />
        <p className="text-[11px] text-[#94A3B8]">Lowercase letters, numbers, and underscores only</p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1F2937]" htmlFor="email">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="jordan@university.edu"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937]" htmlFor="password">
            Password (8+ chars)
          </label>
          <PasswordField
            id="password"
            placeholder="Create password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1F2937]" htmlFor="confirm_password">
            Confirm Password
          </label>
          <PasswordField
            id="confirm_password"
            placeholder="Confirm password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isSubmitting}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Create Account & Continue
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-[#64748B]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-bold text-[#4B3F72] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};
