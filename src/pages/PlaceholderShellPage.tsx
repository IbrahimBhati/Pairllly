import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Layers, BookOpen, Send, MessageSquare, User, Settings, ArrowRight } from 'lucide-react';

export interface PlaceholderShellPageProps {
  route: string;
  onNavigate: (path: string) => void;
}

const ROUTE_CONFIG: Record<
  string,
  { title: string; phase: string; icon: React.ReactNode; description: string }
> = {
  '/my-skills': {
    title: 'My Skills Management',
    phase: 'Phase 3',
    icon: <BookOpen className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Granular skill editing, adding/removing proficiency levels, and managing listing dependencies will activate in Phase 3. You can review your initial skills on the Dashboard or re-run onboarding.',
  },
  '/my-listings': {
    title: 'My Listings',
    phase: 'Phase 3',
    icon: <Layers className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Listing creation, online/in-person session formats, duration configuration, and draft/published statuses will be implemented in Phase 3.',
  },
  '/requests': {
    title: 'Connection Requests',
    phase: 'Phase 5',
    icon: <Send className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Initiating connection requests from profiles, reciprocal match context, acceptance, and cancellation workflows are scheduled for Phase 5.',
  },
  '/messages': {
    title: 'Real-Time Messaging',
    phase: 'Phase 5',
    icon: <MessageSquare className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Supabase Realtime conversations, message history, and unread notifications between accepted partners are scheduled for Phase 5.',
  },
  '/profile': {
    title: 'Public Profile',
    phase: 'Phase 3',
    icon: <User className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Public profile viewing (/profile/[username]), edit modes, and profile visibility controls are scheduled for Phase 3.',
  },
  '/settings': {
    title: 'Account Settings',
    phase: 'Phase 7',
    icon: <Settings className="w-6 h-6 text-[#4B3F72]" />,
    description:
      'Comprehensive security controls, theme preferences (dark mode), notification settings, and account deletion are scheduled for Phase 7.',
  },
};

export const PlaceholderShellPage: React.FC<PlaceholderShellPageProps> = ({
  route,
  onNavigate,
}) => {
  const config = ROUTE_CONFIG[route] || {
    title: 'Feature Route',
    phase: 'Upcoming Phase',
    icon: <Layers className="w-6 h-6 text-[#4B3F72]" />,
    description: 'This feature will be unlocked in an upcoming development phase.',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={config.title}
        description={`Scheduled for delivery in ${config.phase}.`}
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/dashboard') },
          { label: config.title },
        ]}
      />

      <div className="py-8">
        <EmptyState
          icon={config.icon}
          title={`${config.title} (${config.phase})`}
          description={config.description}
          actionLabel="Back to Dashboard"
          onAction={() => onNavigate('/dashboard')}
        />
      </div>
    </div>
  );
};
