import React, { useState } from 'react';
import { AppLogo } from '../ui/AppLogo';
import { Button } from '../ui/Button';
import { Menu, X, ArrowRight, Compass, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface MainNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MainNavbar: React.FC<MainNavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  const handleNavClick = (target: string) => {
    setMobileMenuOpen(false);
    if (target.startsWith('#')) {
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] rounded-lg"
          aria-label="Pairly Home"
        >
          <AppLogo size="md" showTagline={false} />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick('#how-it-works')}
            className="text-sm font-semibold text-[#64748B] hover:text-[#4B3F72] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('/explore')}
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentPath === '/explore' ? 'text-[#4B3F72]' : 'text-[#64748B] hover:text-[#4B3F72]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#A78BFA]" />
            Explore Skills
          </button>
          <button
            onClick={() => handleNavClick('#smart-matching')}
            className="text-sm font-semibold text-[#64748B] hover:text-[#4B3F72] transition-colors cursor-pointer"
          >
            Smart Matching
          </button>
          <button
            onClick={() => handleNavClick('#community')}
            className="text-sm font-semibold text-[#64748B] hover:text-[#4B3F72] transition-colors cursor-pointer"
          >
            Community
          </button>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavClick(profile?.onboarding_completed ? '/dashboard' : '/onboarding')}
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              {profile?.onboarding_completed ? 'Open Dashboard' : 'Finish Onboarding'}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={() => handleNavClick('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleNavClick('/signup')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9] focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('#how-it-works')}
            className="block w-full text-left py-2 px-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('/explore')}
            className="block w-full text-left py-2 px-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
          >
            Explore Skills
          </button>
          <button
            onClick={() => handleNavClick('#smart-matching')}
            className="block w-full text-left py-2 px-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
          >
            Smart Matching
          </button>
          <button
            onClick={() => handleNavClick('#community')}
            className="block w-full text-left py-2 px-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
          >
            Community
          </button>
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
            {user ? (
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => handleNavClick(profile?.onboarding_completed ? '/dashboard' : '/onboarding')}
              >
                {profile?.onboarding_completed ? 'Open Dashboard' : 'Finish Onboarding'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => handleNavClick('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => handleNavClick('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
