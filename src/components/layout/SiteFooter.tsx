import React from 'react';
import { AppLogo } from '../ui/AppLogo';
import { ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export interface SiteFooterProps {
  onNavigate: (path: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white pt-16 pb-12 text-[#64748B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#E2E8F0]">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <AppLogo size="md" showTagline={true} />
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
              Pairly is a university-level peer-to-peer skill-sharing platform. We connect students, teachers, professionals, and community members who exchange knowledge and grow together.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4B3F72] font-semibold bg-[#F8FAFC] py-2 px-3 rounded-lg border border-[#E2E8F0] w-fit">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Dedicated peer exchange · Trust & Safety prioritized</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937]">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/explore')}
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Explore Skills
                </button>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#smart-matching"
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Smart Matching
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Community Roles
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937]">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Create Account
                </button>
              </li>
              <li>
                <a
                  href="#trust"
                  className="hover:text-[#4B3F72] transition-colors"
                >
                  Verification & Safety
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937]">Integrity & Terms</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-[#94A3B8] cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-[#94A3B8] cursor-default">Terms of Service</span>
              </li>
              <li>
                <span className="text-[#94A3B8] cursor-default">Code of Conduct</span>
              </li>
              <li>
                <span className="text-[#94A3B8] cursor-default">Academic Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Pairly. Share Skills. Help Others. Grow Together.</p>
          <div className="flex items-center gap-4 text-[#94A3B8]">
            <span>Deep Purple #4B3F72</span>
            <span>·</span>
            <span>Lavender #A78BFA</span>
            <span>·</span>
            <span>Mint #A7F3D0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
