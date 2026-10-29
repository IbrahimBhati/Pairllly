import React from 'react';
import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { SignupForm } from '../components/auth/SignupForm';

export interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  return (
    <AuthPageLayout
      title="Create Your Pairly Account"
      description="Join our peer-to-peer exchange community to share skills, help others, and grow together."
      onNavigateHome={() => onNavigate('/')}
      maxWidth="lg"
    >
      <SignupForm
        onSuccess={() => onNavigate('/onboarding')}
        onNavigateLogin={() => onNavigate('/login')}
      />
    </AuthPageLayout>
  );
};
