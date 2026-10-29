import React from 'react';
import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

export interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();

  const handleLoginSuccess = () => {
    if (profile?.onboarding_completed) {
      onNavigate('/dashboard');
    } else {
      onNavigate('/onboarding');
    }
  };

  return (
    <AuthPageLayout
      title="Welcome Back to Pairly"
      description="Sign in to your account to manage your skill offerings, check reciprocal matches, and exchange knowledge."
      onNavigateHome={() => onNavigate('/')}
    >
      <LoginForm
        onSuccess={handleLoginSuccess}
        onNavigateSignup={() => onNavigate('/signup')}
        onNavigateForgotPassword={() => onNavigate('/forgot-password')}
      />
    </AuthPageLayout>
  );
};
