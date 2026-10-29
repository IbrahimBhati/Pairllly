import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainNavbar } from './components/layout/MainNavbar';
import { SiteFooter } from './components/layout/SiteFooter';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ExplorePage } from './pages/ExplorePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MySkillsPage } from './pages/MySkillsPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { NewListingPage } from './pages/NewListingPage';
import { EditListingPage } from './pages/EditListingPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { ProfileViewPage } from './pages/ProfileViewPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { RequestsPage } from './pages/RequestsPage';
import { ChatPage } from './pages/ChatPage';
import { ExchangesPage } from './pages/ExchangesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthLoadingState } from './components/auth/AuthLoadingState';
import { Database, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { getSupabaseEnv } from './lib/supabase/env';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [showConfigBanner, setShowConfigBanner] = useState(false);
  const { user, profile, isLoading } = useAuth();
  const supabaseEnv = getSupabaseEnv();

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof path !== 'string' || path.startsWith('#')) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Protection Effect
  useEffect(() => {
    if (isLoading) return;

    const protectedPrefixes = [
      '/dashboard',
      '/my-skills',
      '/my-listings',
      '/listings/new',
      '/requests',
      '/chat',
      '/messages',
      '/exchanges',
      '/profile/edit',
      '/settings',
      '/admin',
    ];

    const isProtected =
      protectedPrefixes.some(
        (prefix) => currentPath === prefix || currentPath.startsWith(prefix + '/')
      ) || currentPath.endsWith('/edit');

    // If attempting to access protected route while unauthenticated
    if (isProtected && !user) {
      navigate('/login');
      return;
    }

    // If authenticated user has not completed onboarding
    if (user && !profile?.onboarding_completed && isProtected) {
      navigate('/onboarding');
      return;
    }

    // If authenticated & already completed onboarding visits /onboarding, redirect to /dashboard
    if (user && profile?.onboarding_completed && currentPath === '/onboarding') {
      navigate('/dashboard');
      return;
    }

    // If authenticated user visits login or signup, redirect them
    if (user && (currentPath === '/login' || currentPath === '/signup')) {
      if (profile?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, currentPath, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <AuthLoadingState message="Checking session and credentials..." />
      </div>
    );
  }

  // Parse Dynamic & Shell Routes
  const renderDynamicRoute = () => {
    // 1. Edit Listing: /listings/:id/edit
    if (currentPath.startsWith('/listings/') && currentPath.endsWith('/edit')) {
      const parts = currentPath.split('/');
      const listingId = parts[2];
      return <EditListingPage listingId={listingId} onNavigate={navigate} />;
    }

    // 2. New Listing: /listings/new
    if (currentPath === '/listings/new') {
      return <NewListingPage onNavigate={navigate} />;
    }

    // 3. View Listing Details: /listings/:id
    if (currentPath.startsWith('/listings/')) {
      const parts = currentPath.split('/');
      const listingId = parts[2];
      return <ListingDetailsPage listingId={listingId} onNavigate={navigate} />;
    }

    // 4. Edit Profile: /profile/edit
    if (currentPath === '/profile/edit') {
      return <ProfileEditPage onNavigate={navigate} />;
    }

    // 5. Public Profile with handle: /profile/:username
    if (currentPath.startsWith('/profile/')) {
      const parts = currentPath.split('/');
      const usernameHandle = parts[2];
      return <ProfileViewPage username={usernameHandle} onNavigate={navigate} />;
    }

    // 6. Own Profile: /profile
    if (currentPath === '/profile') {
      return <ProfileViewPage onNavigate={navigate} />;
    }

    // 7. My Skills: /my-skills
    if (currentPath === '/my-skills') {
      return <MySkillsPage onNavigate={navigate} />;
    }

    // 8. My Listings: /my-listings
    if (currentPath === '/my-listings') {
      return <MyListingsPage onNavigate={navigate} />;
    }

    // 9. Dashboard: /dashboard
    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    // 10. Connection Requests: /requests, /requests/sent, /requests/received
    if (currentPath.startsWith('/requests')) {
      return <RequestsPage onNavigate={navigate} />;
    }

    // 11. Realtime Chat: /chat/:conversationId or /chat or /messages
    if (currentPath.startsWith('/chat/') || currentPath === '/chat' || currentPath === '/messages') {
      const parts = currentPath.split('/');
      const initialConvId = parts.length > 2 ? parts[2] : undefined;
      return <ChatPage initialConversationId={initialConvId} onNavigate={navigate} />;
    }

    // 12. Knowledge Exchanges: /exchanges or /exchanges/:id
    if (currentPath.startsWith('/exchanges')) {
      return <ExchangesPage onNavigate={navigate} />;
    }

    // 13. Settings: /settings
    if (currentPath.startsWith('/settings')) {
      return <SettingsPage onNavigate={navigate} />;
    }

    // 14. Admin Console: /admin
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    return null;
  };

  const dynamicContent = renderDynamicRoute();

  // If user is authenticated and navigating inside the AppShell
  const isAppShellRoute = Boolean(
    dynamicContent &&
      user &&
      profile?.onboarding_completed &&
      ![
        '/',
        '/explore',
        '/login',
        '/signup',
        '/forgot-password',
        '/auth/reset-password',
        '/auth/callback',
        '/onboarding',
      ].includes(currentPath)
  );

  if (isAppShellRoute) {
    return (
      <AppShell currentPath={currentPath} onNavigate={navigate}>
        {dynamicContent}
      </AppShell>
    );
  }

  // Standalone & Public Routes
  const renderPublicContent = () => {
    if (dynamicContent) return dynamicContent;

    switch (currentPath) {
      case '/':
      case '':
        return <LandingPage onNavigate={navigate} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/signup':
        return <SignupPage onNavigate={navigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />;
      case '/auth/reset-password':
        return <ResetPasswordPage onNavigate={navigate} />;
      case '/auth/callback':
        return <AuthCallbackPage onNavigate={navigate} />;
      case '/explore':
      case '/listings':
        return <ExplorePage onNavigate={navigate} />;
      case '/onboarding':
        return (
          <OnboardingPage
            onComplete={() => {
              navigate('/dashboard');
            }}
          />
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Dev / Supabase Configuration Diagnostic Banner */}
      {!supabaseEnv.isConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Pairly Preview Mode Active:</strong> Running with browser-isolated state and seed campus data. Configure Supabase in Replit Secrets for live team collaboration.
              </span>
            </div>
            <button
              onClick={() => setShowConfigBanner(!showConfigBanner)}
              className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{showConfigBanner ? 'Hide Details' : 'View Setup Info'}</span>
              {showConfigBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showConfigBanner && (
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200/60 font-mono text-[11px] space-y-1">
              <p>To connect live Supabase cloud database:</p>
              <p>1. Open Replit Secrets panel</p>
              <p>2. Set <code>VITE_SUPABASE_URL</code> to your project URL</p>
              <p>3. Set <code>VITE_SUPABASE_ANON_KEY</code> to your project anonymous key</p>
              <p>4. Execute migrations in <code>supabase/migrations/</code> via the Supabase SQL Editor</p>
            </div>
          )}
        </div>
      )}

      {/* Main Navbar for Public Views */}
      <MainNavbar currentPath={currentPath} onNavigate={navigate} />

      {/* Content */}
      <main className="flex-1">{renderPublicContent()}</main>

      {/* Footer */}
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
