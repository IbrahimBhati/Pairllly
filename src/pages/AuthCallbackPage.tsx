import React, { useEffect, useState } from 'react';
import { AuthLoadingState } from '../components/auth/AuthLoadingState';
import { FormError } from '../components/auth/FormError';
import { Button } from '../components/ui/Button';
import { getSupabase } from '../lib/supabase/client';
import { useAuth } from '../context/AuthContext';

export interface AuthCallbackPageProps {
  onNavigate: (path: string) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      const supabase = getSupabase();
      if (!supabase) {
        // Preview mode: route to onboarding or dashboard
        if (profile?.onboarding_completed) {
          onNavigate('/dashboard');
        } else {
          onNavigate('/onboarding');
        }
        return;
      }

      try {
        // Exchange session from URL hash or code parameters
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session?.user) {
          await refreshProfile();
          if (profile?.onboarding_completed) {
            onNavigate('/dashboard');
          } else {
            onNavigate('/onboarding');
          }
        } else {
          onNavigate('/login');
        }
      } catch (err) {
        setError((err as Error).message || 'Authentication callback failed');
      }
    }

    handleAuthCallback();
  }, [profile, onNavigate, refreshProfile]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <FormError message={error} />
          <Button
            variant="primary"
            onClick={() => onNavigate('/login')}
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6">
      <AuthLoadingState message="Completing authentication and verifying session..." />
    </div>
  );
};
