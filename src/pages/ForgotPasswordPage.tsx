import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../lib/validation/schemas';
import type { z } from 'zod';
import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/auth/FormError';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      const res = await resetPassword(data.email);
      if (res.error) {
        setServerError(res.error);
      } else {
        setSuccessEmail(data.email);
      }
    } catch (err) {
      setServerError((err as Error).message || 'Failed to send password reset request');
    }
  };

  return (
    <AuthPageLayout
      title="Reset Your Password"
      description="Enter your registered email address and we will send a password reset link."
      onNavigateHome={() => onNavigate('/')}
      footer={
        <p>
          Remember your password?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-[#4B3F72] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      }
    >
      {successEmail ? (
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#A7F3D0]/60 text-[#064E3B] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F2937]">Check Your Inbox</h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              If an account matches <strong className="text-[#1F2937]">{successEmail}</strong>, you will receive an email with instructions to securely reset your password.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormError message={serverError} />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937]" htmlFor="reset-email">
              Account Email
            </label>
            <Input
              id="reset-email"
              type="email"
              placeholder="e.g. jordan@university.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
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
            Send Reset Instructions
          </Button>
        </form>
      )}
    </AuthPageLayout>
  );
};
