export * from './database';

export type NavRoute = 
  | '/'
  | '/login'
  | '/signup'
  | '/explore'
  | '/forgot-password'
  | '/auth/reset-password'
  | '/auth/callback'
  | '/onboarding'
  | '/dashboard'
  | '/my-skills'
  | '/my-listings'
  | '/requests'
  | '/messages'
  | '/profile'
  | '/settings'
  | '/not-found';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}
