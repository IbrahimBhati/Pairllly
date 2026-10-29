import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../lib/validation/schemas';
import type { z } from 'zod';
import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/auth/FormError';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { updatePassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm_password: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      const res = await updatePassword(data.password);
      if (res.error) {
        setServerError(res.error);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setServerError((err as Error).message || 'Failed to update password');
    }
  };

  return (
    <AuthPageLayout
      title="Create New Password"
      description="Choose a strong password to protect your Pairly account and peer exchanges."
      onNavigateHome={() => onNavigate('/')}
    >
      {isSuccess ? (
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#A7F3D0]/60 text-[#064E3B] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F2937]">Password Successfully Updated</h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Your password has been changed. You can now access your dashboard and skills profile.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormError message={serverError} />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937]" htmlFor="new_password">
              New Password (8+ characters)
            </label>
            <PasswordField
              id="new_password"
              placeholder="Enter new password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937]" htmlFor="confirm_new_password">
              Confirm New Password
            </label>
            <PasswordField
              id="confirm_new_password"
              placeholder="Confirm new password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
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
            Update Password
          </Button>
        </form>
      )}
    </AuthPageLayout>
  );
};
