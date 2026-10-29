import React, { useState, useEffect } from 'react';
import { AppLogo } from '../ui/AppLogo';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Layers,
  Send,
  MessageSquare,
  ArrowRightLeft,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminService } from '../../lib/services/adminService';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentPath, onNavigate, children }) => {
  const { user, profile, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      const admin = await AdminService.isUserAdmin(user.id);
      setIsAdmin(admin);
    }
    checkAdmin();
  }, [user]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="w-4 h-4" /> },
    { label: 'Requests', path: '/requests', icon: <Send className="w-4 h-4" /> },
    { label: 'Chat', path: '/chat', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Exchanges', path: '/exchanges', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { label: 'My Skills', path: '/my-skills', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'My Listings', path: '/my-listings', icon: <Layers className="w-4 h-4" /> },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4" /> }] : []),
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Member';
  const username = profile?.username || 'user';
  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('/dashboard')}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] rounded-lg"
            >
              <AppLogo size="sm" showTagline={false} />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                      isActive
                        ? 'bg-[#4B3F72] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9]'
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} theme`}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              {resolvedTheme === 'light' ? (
                <Moon className="w-4 h-4 text-[#4B3F72]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* User Dropdown */}
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#A78BFA]/50 transition-all cursor-pointer"
                >
                  <Avatar
                    fallback={displayName}
                    src={profile?.avatar_url}
                    size="sm"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#1F2937] leading-none">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono leading-none mt-1">
                      @{username}
                    </span>
                  </div>
                </button>
              }
              items={[
                {
                  label: 'View Profile',
                  icon: <User className="w-4 h-4" />,
                  onClick: () => handleNav('/profile'),
                },
                {
                  label: 'Account Settings',
                  icon: <Settings className="w-4 h-4" />,
                  onClick: () => handleNav('/settings'),
                },
                ...(isAdmin
                  ? [
                      {
                        label: 'Admin Console',
                        icon: <Shield className="w-4 h-4" />,
                        onClick: () => handleNav('/admin'),
                      },
                    ]
                  : []),
                {
                  label: 'Sign Out',
                  icon: <LogOut className="w-4 h-4" />,
                  onClick: logout,
                  destructive: true,
                },
              ]}
            />

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#E2E8F0] bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-left',
                  currentPath === item.path
                    ? 'bg-[#4B3F72] text-white'
                    : 'text-[#1F2937] hover:bg-[#F8FAFC]'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
              <button
                onClick={() => handleNav('/profile')}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => handleNav('/settings')}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC] rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
};
