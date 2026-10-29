import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase/client';
import { getSupabaseEnv } from '../lib/supabase/env';
import type { Profile, OnboardingFormData, AccountType } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: {
    email: string;
    password: string;
    displayName: string;
    username: string;
    accountType: AccountType;
  }) => Promise<{ error?: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  completeOnboarding: (data: OnboardingFormData) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_SESSION = 'pairly_dev_session';
const LOCAL_STORAGE_KEY_PROFILE = 'pairly_dev_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseEnv = getSupabaseEnv();
  const supabase = getSupabase();

  // Load profile from Supabase
  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning (may not be created yet):', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, [supabase]);

  // Initial Auth Check
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      setIsLoading(true);

      if (supabase && supabaseEnv.isConfigured) {
        // Live Supabase Integration
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!isMounted) return;

          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProfile = await loadProfile(currentSession.user.id);
            if (isMounted) setProfile(userProfile);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Failed to get Supabase session:', err);
        }

        // Subscribe to auth state updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!isMounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
              const prof = await loadProfile(newSession.user.id);
              if (isMounted) setProfile(prof);
            } else {
              if (isMounted) setProfile(null);
            }
          }
        );

        setIsLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Local preview fallback when Supabase keys are not set
        try {
          const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
          const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

          if (storedSession && storedProfile) {
            const parsedUser = JSON.parse(storedSession);
            const parsedProfile = JSON.parse(storedProfile);
            setUser(parsedUser);
            setProfile(parsedProfile);
          }
        } catch (e) {
          console.warn('Could not read local preview session:', e);
        }
        setIsLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [supabase, supabaseEnv.isConfigured, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      if (supabase && supabaseEnv.isConfigured) {
        const prof = await loadProfile(user.id);
        setProfile(prof);
      } else {
        const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      }
    }
  }, [user, supabase, supabaseEnv.isConfigured, loadProfile]);

  // Login
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (supabase && supabaseEnv.isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          const prof = await loadProfile(data.user.id);
          setProfile(prof);
        }
        return {};
      } catch (err) {
        return { error: (err as Error).message || 'Failed to sign in' };
      }
    } else {
      // Local preview fallback authentication
      const storedProfileStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      let localProfile: Profile;

      if (storedProfileStr) {
        localProfile = JSON.parse(storedProfileStr);
      } else {
        localProfile = {
          id: 'dev-user-001',
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          display_name: email.split('@')[0],
          avatar_url: null,
          bio: null,
          account_type: 'student',
          institution: 'University College',
          department: null,
          location: null,
          timezone: null,
          availability: null,
          profile_visibility: 'public',
          onboarding_completed: false,
          verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const mockUser = {
        id: localProfile.id,
        email,
        app_metadata: {},
        user_metadata: { display_name: localProfile.display_name },
        aud: 'authenticated',
        created_at: localProfile.created_at,
      } as unknown as User;

      localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(localProfile));
      setUser(mockUser);
      setProfile(localProfile);
      return {};
    }
  };

  // Signup
  const signup = async ({
    email,
    password,
    displayName,
    username,
    accountType,
  }: {
    email: string;
    password: string;
    displayName: string;
    username: string;
    accountType: AccountType;
  }): Promise<{ error?: string; requiresVerification?: boolean }> => {
    if (supabase && supabaseEnv.isConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              username: username.toLowerCase(),
              account_type: accountType,
            },
          },
        });
        if (error) return { error: error.message };

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          if (data.user) {
            const prof = await loadProfile(data.user.id);
            setProfile(prof);
          }
          return {};
        }

        // Email confirmation required
        return { requiresVerification: true };
      } catch (err) {
        return { error: (err as Error).message || 'Signup failed' };
      }
    } else {
      // Local preview fallback
      const newId = 'dev-' + Math.random().toString(36).substring(2, 9);
      const newProfile: Profile = {
        id: newId,
        username: username.toLowerCase(),
        display_name: displayName,
        avatar_url: null,
        bio: null,
        account_type: accountType,
        institution: null,
        department: null,
        location: null,
        timezone: null,
        availability: null,
        profile_visibility: 'public',
        onboarding_completed: false,
        verification_status: 'unverified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockUser = {
        id: newId,
        email,
        app_metadata: {},
        user_metadata: { display_name: displayName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
      setUser(mockUser);
      setProfile(newProfile);
      return {};
    }
  };

  // Logout
  const logout = async () => {
    if (supabase && supabaseEnv.isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Reset Password (Forgot password flow)
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    if (supabase && supabaseEnv.isConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) return { error: error.message };
        return {};
      } catch (err) {
        return { error: (err as Error).message };
      }
    }
    // Preview mode notification
    return {};
  };

  // Update Password (New password submission)
  const updatePassword = async (password: string): Promise<{ error?: string }> => {
    if (supabase && supabaseEnv.isConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return { error: error.message };
        return {};
      } catch (err) {
        return { error: (err as Error).message };
      }
    }
    return {};
  };

  // Complete Onboarding
  const completeOnboarding = async (data: OnboardingFormData): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    if (supabase && supabaseEnv.isConfigured) {
      try {
        const { error } = await (supabase.rpc as any)('complete_user_onboarding', {
          p_display_name: data.display_name,
          p_username: data.username.toLowerCase(),
          p_account_type: data.account_type,
          p_bio: data.bio || null,
          p_institution: data.institution || null,
          p_department: data.department || null,
          p_location: data.location || null,
          p_timezone: data.timezone || null,
          p_availability: data.availability || null,
          p_offered_skills: data.offered_skills,
          p_wanted_skills: data.wanted_skills,
        });

        if (error) return { error: error.message };

        // Refresh profile
        const updated = await loadProfile(user.id);
        if (updated) setProfile(updated);
        return {};
      } catch (err) {
        return { error: (err as Error).message || 'Failed to complete onboarding' };
      }
    } else {
      // Local preview simulation
      const currentProfile: Profile = profile || {
        id: user.id,
        username: data.username.toLowerCase(),
        display_name: data.display_name,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
        account_type: data.account_type,
        institution: data.institution || null,
        department: data.department || null,
        location: data.location || null,
        timezone: data.timezone || null,
        availability: data.availability || null,
        profile_visibility: 'public',
        onboarding_completed: true,
        verification_status: 'unverified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedProfile: Profile = {
        ...currentProfile,
        display_name: data.display_name,
        username: data.username.toLowerCase(),
        account_type: data.account_type,
        avatar_url: data.avatar_url || currentProfile.avatar_url,
        bio: data.bio || null,
        institution: data.institution || null,
        department: data.department || null,
        location: data.location || null,
        timezone: data.timezone || null,
        availability: data.availability || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
      localStorage.setItem('pairly_dev_user_skills', JSON.stringify({
        offered: data.offered_skills,
        wanted: data.wanted_skills,
      }));
      setProfile(updatedProfile);
      return {};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: supabaseEnv.isConfigured,
        login,
        signup,
        logout,
        resetPassword,
        updatePassword,
        completeOnboarding,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
